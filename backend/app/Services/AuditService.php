<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    public function log(
        string $action,
        Model  $model,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $changedFields = null,
        ?string $resourceRef = null,
    ): void {
        $user = Auth::user();

        if (!$user) {
            return; // Skip audit for unauthenticated operations (e.g. seeders)
        }

        AuditLog::create([
            'user_id'        => $user->id,
            'user_email'     => $user->email,
            'action'         => $action,
            'resource_type'  => class_basename($model),
            'resource_id'    => $model->getKey(),
            'resource_ref'   => $resourceRef ?? ($model->risk_id ?? $model->asset_id ?? null),
            'old_values'     => $oldValues,
            'new_values'     => $newValues,
            'changed_fields' => $changedFields,
            'ip_address'     => Request::ip(),
            'user_agent'     => Request::userAgent(),
        ]);
    }

    public function logCreate(Model $model): void
    {
        $this->log('CREATE', $model, null, $model->toArray());
    }

    public function logUpdate(Model $model, array $original): void
    {
        $new = $model->toArray();
        $changed = array_keys(array_diff_assoc($new, $original));

        // Remove timestamps from changed fields list
        $changed = array_values(array_filter($changed, fn($f) => !in_array($f, ['updated_at'])));

        if (empty($changed)) {
            return;
        }

        $this->log(
            'UPDATE',
            $model,
            array_intersect_key($original, array_flip($changed)),
            array_intersect_key($new, array_flip($changed)),
            $changed,
        );
    }

    public function logDelete(Model $model): void
    {
        $this->log('DELETE', $model, $model->toArray(), null);
    }
}
