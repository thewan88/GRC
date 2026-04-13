<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Risk;
use App\Services\IdGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class RiskController extends Controller
{
    public function __construct(private readonly IdGeneratorService $idGen) {}

    /** GET /api/v1/risks */
    public function index(Request $request): JsonResponse
    {
        $query = Risk::with(['owner:id,full_name,email', 'controls:id,control_ref,name'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->owner_id, fn($q) => $q->where('owner_id', $request->owner_id))
            ->when($request->fca_tag, fn($q) => $q->where('fca_tags', 'like', "%{$request->fca_tag}%"))
            ->when($request->search, fn($q) =>
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('risk_id', 'like', "%{$request->search}%")
            )
            ->orderByRaw('likelihood * impact DESC')
            ->orderBy('created_at', 'desc');

        $risks = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $risks->map(fn($r) => $this->formatRisk($r)),
            'meta' => [
                'page'     => $risks->currentPage(),
                'per_page' => $risks->perPage(),
                'total'    => $risks->total(),
            ],
            'errors' => null,
        ]);
    }

    /** POST /api/v1/risks */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Risk::class);

        $validated = $request->validate([
            'title'               => 'required|string|max:500',
            'description'         => 'nullable|string',
            'category'            => ['required', Rule::in(['Operational','Regulatory','Financial','Technology','Reputational','Strategic','Third-Party/Outsourcing'])],
            'fca_tags'            => 'nullable|array',
            'fca_tags.*'          => Rule::in(['SYSC','COBS','MAR','Operational Resilience']),
            'owner_id'            => 'nullable|uuid|exists:users,id',
            'likelihood'          => 'required|integer|min:1|max:5',
            'impact'              => 'required|integer|min:1|max:5',
            'rca_method'          => ['nullable', Rule::in(['fishbone','five_why'])],
            'rca_data'            => 'nullable|array',
            'treatment'           => ['nullable', Rule::in(['Accept','Mitigate','Transfer','Avoid'])],
            'treatment_plan'      => 'nullable|array',
            'residual_likelihood' => 'nullable|integer|min:1|max:5',
            'residual_impact'     => 'nullable|integer|min:1|max:5',
            'review_date'         => 'nullable|date',
            'status'              => ['nullable', Rule::in(['Open','In Review','Closed'])],
            'control_ids'         => 'nullable|array',
            'control_ids.*'       => 'uuid|exists:controls,id',
        ]);

        $risk = Risk::create([
            ...$validated,
            'risk_id'       => $this->idGen->nextRiskId(),
            'created_by_id' => auth()->id(),
            'status'        => $validated['status'] ?? 'Open',
        ]);

        if (!empty($validated['control_ids'])) {
            $risk->controls()->sync($validated['control_ids']);
        }

        return response()->json([
            'data'   => $this->formatRisk($risk->load(['owner:id,full_name,email', 'controls:id,control_ref,name'])),
            'errors' => null,
        ], 201);
    }

    /** GET /api/v1/risks/{risk} */
    public function show(Risk $risk): JsonResponse
    {
        $risk->load(['owner:id,full_name,email', 'createdBy:id,full_name', 'controls', 'assets:id,asset_id,name']);
        return response()->json(['data' => $this->formatRisk($risk, detailed: true), 'errors' => null]);
    }

    /** PUT /api/v1/risks/{risk} */
    public function update(Request $request, Risk $risk): JsonResponse
    {
        $this->authorize('update', $risk);

        $validated = $request->validate([
            'title'               => 'sometimes|string|max:500',
            'description'         => 'nullable|string',
            'category'            => ['sometimes', Rule::in(['Operational','Regulatory','Financial','Technology','Reputational','Strategic','Third-Party/Outsourcing'])],
            'fca_tags'            => 'nullable|array',
            'fca_tags.*'          => Rule::in(['SYSC','COBS','MAR','Operational Resilience']),
            'owner_id'            => 'nullable|uuid|exists:users,id',
            'likelihood'          => 'sometimes|integer|min:1|max:5',
            'impact'              => 'sometimes|integer|min:1|max:5',
            'rca_method'          => ['nullable', Rule::in(['fishbone','five_why'])],
            'rca_data'            => 'nullable|array',
            'treatment'           => ['nullable', Rule::in(['Accept','Mitigate','Transfer','Avoid'])],
            'treatment_plan'      => 'nullable|array',
            'residual_likelihood' => 'nullable|integer|min:1|max:5',
            'residual_impact'     => 'nullable|integer|min:1|max:5',
            'review_date'         => 'nullable|date',
            'status'              => ['sometimes', Rule::in(['Open','In Review','Closed'])],
            'control_ids'         => 'nullable|array',
            'control_ids.*'       => 'uuid|exists:controls,id',
        ]);

        $risk->update($validated);

        if (array_key_exists('control_ids', $validated)) {
            $risk->controls()->sync($validated['control_ids'] ?? []);
        }

        return response()->json([
            'data'   => $this->formatRisk($risk->fresh()->load(['owner:id,full_name,email', 'controls:id,control_ref,name'])),
            'errors' => null,
        ]);
    }

    /** GET /api/v1/risks/{risk}/audit */
    public function auditLog(Risk $risk): JsonResponse
    {
        $logs = $risk->auditLogs()->with('user:id,full_name,email')->latest()->paginate(50);
        return response()->json([
            'data'   => $logs->items(),
            'meta'   => ['page' => $logs->currentPage(), 'per_page' => $logs->perPage(), 'total' => $logs->total()],
            'errors' => null,
        ]);
    }

    /** GET /api/v1/risks/export/csv */
    public function exportCsv(): Response
    {
        $this->authorize('create', Risk::class); // Risk managers+

        $risks = Risk::with(['owner:id,full_name', 'controls:id,control_ref'])->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="risk-register-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($risks) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Risk ID','Title','Category','FCA Tags','Owner','Likelihood','Impact','Score','Level','Treatment','Residual Score','Status','Review Date','Controls']);
            foreach ($risks as $r) {
                fputcsv($handle, [
                    $r->risk_id,
                    $r->title,
                    $r->category,
                    implode('; ', $r->fca_tags ?? []),
                    $r->owner?->full_name,
                    $r->likelihood,
                    $r->impact,
                    $r->inherent_score,
                    $r->risk_level,
                    $r->treatment,
                    $r->residual_score,
                    $r->status,
                    $r->review_date?->format('Y-m-d'),
                    $r->controls->pluck('control_ref')->implode('; '),
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function formatRisk(Risk $risk, bool $detailed = false): array
    {
        $data = [
            'id'              => $risk->id,
            'risk_id'         => $risk->risk_id,
            'title'           => $risk->title,
            'description'     => $risk->description,
            'category'        => $risk->category,
            'fca_tags'        => $risk->fca_tags ?? [],
            'owner'           => $risk->owner ? ['id' => $risk->owner->id, 'name' => $risk->owner->full_name] : null,
            'likelihood'      => $risk->likelihood,
            'impact'          => $risk->impact,
            'inherent_score'  => $risk->inherent_score,
            'risk_level'      => $risk->risk_level,
            'treatment'       => $risk->treatment,
            'residual_likelihood' => $risk->residual_likelihood,
            'residual_impact'     => $risk->residual_impact,
            'residual_score'      => $risk->residual_score,
            'residual_level'      => $risk->residual_level,
            'review_date'         => $risk->review_date?->format('Y-m-d'),
            'status'              => $risk->status,
            'created_at'          => $risk->created_at?->toIso8601String(),
            'updated_at'          => $risk->updated_at?->toIso8601String(),
            'controls'            => $risk->relationLoaded('controls')
                ? $risk->controls->map(fn($c) => ['id' => $c->id, 'ref' => $c->control_ref, 'name' => $c->name])
                : [],
        ];

        if ($detailed) {
            $data['rca_method']    = $risk->rca_method;
            $data['rca_data']      = $risk->rca_data;
            $data['treatment_plan'] = $risk->treatment_plan ?? [];
            $data['created_by']    = $risk->createdBy ? ['id' => $risk->createdBy->id, 'name' => $risk->createdBy->full_name] : null;
            $data['assets']        = $risk->relationLoaded('assets')
                ? $risk->assets->map(fn($a) => ['id' => $a->id, 'asset_id' => $a->asset_id, 'name' => $a->name])
                : [];
        }

        return $data;
    }
}
