<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Control;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ControlController extends Controller
{
    /** GET /api/v1/controls */
    public function index(Request $request): JsonResponse
    {
        $controls = Control::with(['owner:id,full_name'])
            ->when($request->theme, fn($q) => $q->where('theme', $request->theme))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->owner_id, fn($q) => $q->where('owner_id', $request->owner_id))
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('control_ref', 'like', "%{$request->search}%")
            )
            ->orderBy('control_ref')
            ->paginate($request->input('per_page', 100));

        return response()->json([
            'data' => $controls->map(fn($c) => $this->formatControl($c)),
            'meta' => [
                'page'     => $controls->currentPage(),
                'per_page' => $controls->perPage(),
                'total'    => $controls->total(),
            ],
            'errors' => null,
        ]);
    }

    /** GET /api/v1/controls/{control} */
    public function show(Control $control): JsonResponse
    {
        $control->load(['owner:id,full_name', 'risks:id,risk_id,title,status', 'assets:id,asset_id,name']);
        return response()->json(['data' => $this->formatControl($control, detailed: true), 'errors' => null]);
    }

    /** PUT /api/v1/controls/{control} */
    public function update(Request $request, Control $control): JsonResponse
    {
        $this->authorize('update', $control);

        $validated = $request->validate([
            'status' => ['sometimes', Rule::in([
                'Not Applicable','Not Implemented','Planned',
                'Partially Implemented','Implemented','Tested',
            ])],
            'na_justification'    => 'nullable|string',
            'implementation_notes' => 'nullable|string',
            'evidence'            => 'nullable|array',
            'owner_id'            => 'nullable|uuid|exists:users,id',
            'last_review_date'    => 'nullable|date',
        ]);

        // Require justification when marking as Not Applicable
        if (($validated['status'] ?? $control->status) === 'Not Applicable' && empty($validated['na_justification'])) {
            return response()->json([
                'data'   => null,
                'errors' => ['na_justification' => ['Justification is required when marking a control as Not Applicable.']],
            ], 422);
        }

        $control->update($validated);

        return response()->json(['data' => $this->formatControl($control->fresh()->load('owner:id,full_name')), 'errors' => null]);
    }

    /**
     * GET /api/v1/controls/soa — Statement of Applicability export (CSV)
     * All 93 controls with status, N/A justifications — ISO 27001 evidence artifact
     */
    public function statementOfApplicability(): Response
    {
        $this->authorize('create', \App\Models\Risk::class); // Risk Manager+

        $controls = Control::with('owner:id,full_name')->orderBy('control_ref')->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="statement-of-applicability-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($controls) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Control Ref','Name','Theme','Description','Status','N/A Justification','Implementation Notes','Owner','Last Review Date']);
            foreach ($controls as $c) {
                fputcsv($handle, [
                    $c->control_ref,
                    $c->name,
                    $c->theme,
                    $c->description,
                    $c->status,
                    $c->na_justification ?? '',
                    $c->implementation_notes ?? '',
                    $c->owner?->full_name ?? '',
                    $c->last_review_date?->format('Y-m-d') ?? '',
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function formatControl(Control $control, bool $detailed = false): array
    {
        $data = [
            'id'                    => $control->id,
            'control_ref'           => $control->control_ref,
            'name'                  => $control->name,
            'description'           => $control->description,
            'theme'                 => $control->theme,
            'status'                => $control->status,
            'is_applicable'         => $control->is_applicable,
            'is_implemented'        => $control->is_implemented,
            'na_justification'      => $control->na_justification,
            'implementation_notes'  => $control->implementation_notes,
            'evidence'              => $control->evidence ?? [],
            'owner'                 => $control->owner ? ['id' => $control->owner->id, 'name' => $control->owner->full_name] : null,
            'last_review_date'      => $control->last_review_date?->format('Y-m-d'),
            'updated_at'            => $control->updated_at?->toIso8601String(),
        ];

        if ($detailed) {
            $data['risks']  = $control->risks->map(fn($r) => ['id' => $r->id, 'risk_id' => $r->risk_id, 'title' => $r->title, 'status' => $r->status]);
            $data['assets'] = $control->assets->map(fn($a) => ['id' => $a->id, 'asset_id' => $a->asset_id, 'name' => $a->name]);
        }

        return $data;
    }
}
