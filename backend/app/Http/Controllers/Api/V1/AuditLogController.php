<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuditLogController extends Controller
{
    /** GET /api/v1/audit-log */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AuditLog::class);

        $logs = AuditLog::with('user:id,full_name,email')
            ->when($request->user_id, fn($q) => $q->where('user_id', $request->user_id))
            ->when($request->resource_type, fn($q) => $q->where('resource_type', $request->resource_type))
            ->when($request->action, fn($q) => $q->where('action', $request->action))
            ->when($request->date_from, fn($q) => $q->where('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->where('created_at', '<=', $request->date_to . ' 23:59:59'))
            ->when($request->resource_ref, fn($q) => $q->where('resource_ref', 'like', "%{$request->resource_ref}%"))
            ->latest()
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => $logs->map(fn($log) => [
                'id'            => $log->id,
                'user'          => $log->user ? ['id' => $log->user->id, 'name' => $log->user->full_name, 'email' => $log->user_email] : ['email' => $log->user_email],
                'action'        => $log->action,
                'resource_type' => $log->resource_type,
                'resource_id'   => $log->resource_id,
                'resource_ref'  => $log->resource_ref,
                'changed_fields' => $log->changed_fields ?? [],
                'old_values'    => $log->old_values,
                'new_values'    => $log->new_values,
                'ip_address'    => $log->ip_address,
                'created_at'    => $log->created_at?->toIso8601String(),
            ]),
            'meta'   => ['page' => $logs->currentPage(), 'per_page' => $logs->perPage(), 'total' => $logs->total()],
            'errors' => null,
        ]);
    }

    /** GET /api/v1/audit-log/export/csv — admin only */
    public function exportCsv(Request $request): Response
    {
        $this->authorize('export', AuditLog::class);

        $logs = AuditLog::with('user:id,full_name')
            ->when($request->date_from, fn($q) => $q->where('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->where('created_at', '<=', $request->date_to . ' 23:59:59'))
            ->latest()
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="audit-log-' . now()->format('Y-m-d') . '.csv"',
        ];

        $callback = function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Timestamp','User','Email','Action','Resource Type','Resource Ref','Changed Fields','IP Address']);
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at?->toIso8601String(),
                    $log->user?->full_name,
                    $log->user_email,
                    $log->action,
                    $log->resource_type,
                    $log->resource_ref,
                    implode('; ', $log->changed_fields ?? []),
                    $log->ip_address,
                ]);
            }
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
