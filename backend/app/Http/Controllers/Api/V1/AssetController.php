<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetThirdParty;
use App\Services\IdGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    public function __construct(private readonly IdGeneratorService $idGen) {}

    /** GET /api/v1/assets */
    public function index(Request $request): JsonResponse
    {
        $assets = Asset::with(['owner:id,full_name', 'custodian:id,full_name'])
            ->when($request->asset_type, fn($q) => $q->where('asset_type', $request->asset_type))
            ->when($request->classification, fn($q) => $q->where('classification', $request->classification))
            ->when($request->owner_id, fn($q) => $q->where('owner_id', $request->owner_id))
            ->when($request->is_personal_data, fn($q) => $q->where('is_personal_data', true))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) =>
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('asset_id', 'like', "%{$request->search}%")
            )
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => $assets->map(fn($a) => $this->formatAsset($a)),
            'meta' => ['page' => $assets->currentPage(), 'per_page' => $assets->perPage(), 'total' => $assets->total()],
            'errors' => null,
        ]);
    }

    /** POST /api/v1/assets */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Asset::class);

        $validated = $this->validateAsset($request);

        $asset = Asset::create([
            ...$validated,
            'asset_id'       => $this->idGen->nextAssetId(),
            'created_by_id'  => auth()->id(),
        ]);

        if (!empty($validated['third_parties'])) {
            foreach ($validated['third_parties'] as $tp) {
                $asset->thirdParties()->create($tp);
            }
        }
        if (!empty($validated['risk_ids'])) {
            $asset->risks()->sync($validated['risk_ids']);
        }
        if (!empty($validated['control_ids'])) {
            $asset->controls()->sync($validated['control_ids']);
        }

        return response()->json([
            'data'   => $this->formatAsset($asset->load(['owner:id,full_name', 'custodian:id,full_name', 'thirdParties'])),
            'errors' => null,
        ], 201);
    }

    /** GET /api/v1/assets/{asset} */
    public function show(Asset $asset): JsonResponse
    {
        $asset->load(['owner:id,full_name', 'custodian:id,full_name', 'createdBy:id,full_name', 'thirdParties', 'risks:id,risk_id,title,status', 'controls:id,control_ref,name']);
        return response()->json(['data' => $this->formatAsset($asset, detailed: true), 'errors' => null]);
    }

    /** PUT /api/v1/assets/{asset} */
    public function update(Request $request, Asset $asset): JsonResponse
    {
        $this->authorize('update', $asset);

        $validated = $this->validateAsset($request, updating: true);
        $asset->update($validated);

        if (array_key_exists('risk_ids', $validated)) {
            $asset->risks()->sync($validated['risk_ids'] ?? []);
        }
        if (array_key_exists('control_ids', $validated)) {
            $asset->controls()->sync($validated['control_ids'] ?? []);
        }

        return response()->json([
            'data'   => $this->formatAsset($asset->fresh()->load(['owner:id,full_name', 'custodian:id,full_name', 'thirdParties'])),
            'errors' => null,
        ]);
    }

    /** POST /api/v1/assets/{asset}/third-parties */
    public function addThirdParty(Request $request, Asset $asset): JsonResponse
    {
        $this->authorize('update', $asset);
        $validated = $request->validate([
            'party_name'    => 'required|string|max:255',
            'purpose'       => 'nullable|string',
            'dpa_reference' => 'nullable|string|max:255',
        ]);
        $tp = $asset->thirdParties()->create($validated);
        return response()->json(['data' => $tp, 'errors' => null], 201);
    }

    /** DELETE /api/v1/assets/{asset}/third-parties/{thirdParty} */
    public function removeThirdParty(Asset $asset, AssetThirdParty $thirdParty): JsonResponse
    {
        $this->authorize('update', $asset);
        if ($thirdParty->asset_id !== $asset->id) {
            abort(404);
        }
        $thirdParty->delete();
        return response()->json(['data' => null, 'errors' => null], 204);
    }

    /** GET /api/v1/assets/{asset}/audit */
    public function auditLog(Asset $asset): JsonResponse
    {
        $logs = $asset->auditLogs()->with('user:id,full_name,email')->latest()->paginate(50);
        return response()->json([
            'data'   => $logs->items(),
            'meta'   => ['page' => $logs->currentPage(), 'per_page' => $logs->perPage(), 'total' => $logs->total()],
            'errors' => null,
        ]);
    }

    /** GET /api/v1/assets/export/csv */
    public function exportCsv(): Response
    {
        $this->authorize('create', Asset::class);

        $assets = Asset::with(['owner:id,full_name', 'custodian:id,full_name', 'thirdParties'])->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="asset-register-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($assets) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Asset ID','Name','Type','Classification','Owner','Custodian','Personal Data','Special Category','Lawful Basis','Retention','International Transfers','Location','Status']);
            foreach ($assets as $a) {
                fputcsv($handle, [
                    $a->asset_id, $a->name, $a->asset_type, $a->classification,
                    $a->owner?->full_name, $a->custodian?->full_name,
                    $a->is_personal_data ? 'Yes' : 'No',
                    $a->is_special_category ? 'Yes' : 'No',
                    $a->lawful_basis, $a->retention_period,
                    $a->international_transfers ? 'Yes' : 'No',
                    "{$a->location_type}: {$a->location_detail}",
                    $a->status,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function validateAsset(Request $request, bool $updating = false): array
    {
        $rule = $updating ? 'sometimes' : 'required';
        return $request->validate([
            'name'                   => "{$rule}|string|max:500",
            'description'            => 'nullable|string',
            'asset_type'             => ["{$rule}", Rule::in(['Data','System','Software','People','Physical','Service'])],
            'owner_id'               => 'nullable|uuid|exists:users,id',
            'custodian_id'           => 'nullable|uuid|exists:users,id',
            'classification'         => ["{$rule}", Rule::in(['Public','Internal','Confidential','Restricted'])],
            'is_personal_data'       => 'boolean',
            'is_special_category'    => 'boolean',
            'lawful_basis'           => 'nullable|string|max:100',
            'special_category_basis' => 'nullable|string|max:100',
            'data_subjects'          => 'nullable|array',
            'retention_period'       => 'nullable|string|max:200',
            'international_transfers' => 'boolean',
            'transfer_safeguards'    => 'nullable|string',
            'location_type'          => ['nullable', Rule::in(['on-prem','cloud','third-party','hybrid'])],
            'location_detail'        => 'nullable|string|max:500',
            'vulnerability_notes'    => 'nullable|string',
            'review_date'            => 'nullable|date',
            'status'                 => ['nullable', Rule::in(['Active','Archived','Disposed'])],
            'third_parties'          => 'nullable|array',
            'third_parties.*.party_name' => 'required|string|max:255',
            'third_parties.*.purpose' => 'nullable|string',
            'third_parties.*.dpa_reference' => 'nullable|string',
            'risk_ids'               => 'nullable|array',
            'risk_ids.*'             => 'uuid|exists:risks,id',
            'control_ids'            => 'nullable|array',
            'control_ids.*'          => 'uuid|exists:controls,id',
        ]);
    }

    private function formatAsset(Asset $asset, bool $detailed = false): array
    {
        $data = [
            'id'                    => $asset->id,
            'asset_id'              => $asset->asset_id,
            'name'                  => $asset->name,
            'description'           => $asset->description,
            'asset_type'            => $asset->asset_type,
            'owner'                 => $asset->owner ? ['id' => $asset->owner->id, 'name' => $asset->owner->full_name] : null,
            'custodian'             => $asset->custodian ? ['id' => $asset->custodian->id, 'name' => $asset->custodian->full_name] : null,
            'classification'        => $asset->classification,
            'is_personal_data'      => $asset->is_personal_data,
            'is_special_category'   => $asset->is_special_category,
            'lawful_basis'          => $asset->lawful_basis,
            'retention_period'      => $asset->retention_period,
            'international_transfers' => $asset->international_transfers,
            'location_type'         => $asset->location_type,
            'location_detail'       => $asset->location_detail,
            'review_date'           => $asset->review_date?->format('Y-m-d'),
            'status'                => $asset->status,
            'gdpr_completeness'     => $asset->gdpr_completeness,
            'third_parties'         => $asset->relationLoaded('thirdParties') ? $asset->thirdParties->toArray() : [],
            'created_at'            => $asset->created_at?->toIso8601String(),
            'updated_at'            => $asset->updated_at?->toIso8601String(),
        ];

        if ($detailed) {
            $data['special_category_basis'] = $asset->special_category_basis;
            $data['data_subjects']          = $asset->data_subjects ?? [];
            $data['transfer_safeguards']    = $asset->transfer_safeguards;
            $data['vulnerability_notes']    = $asset->vulnerability_notes;
            $data['risks']    = $asset->relationLoaded('risks') ? $asset->risks->map(fn($r) => ['id' => $r->id, 'risk_id' => $r->risk_id, 'title' => $r->title, 'status' => $r->status]) : [];
            $data['controls'] = $asset->relationLoaded('controls') ? $asset->controls->map(fn($c) => ['id' => $c->id, 'ref' => $c->control_ref, 'name' => $c->name]) : [];
            $data['created_by'] = $asset->createdBy ? ['id' => $asset->createdBy->id, 'name' => $asset->createdBy->full_name] : null;
        }

        return $data;
    }
}
