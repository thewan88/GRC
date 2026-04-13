<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'asset_id',
        'name',
        'description',
        'asset_type',
        'owner_id',
        'custodian_id',
        'classification',
        'is_personal_data',
        'is_special_category',
        'lawful_basis',
        'special_category_basis',
        'data_subjects',
        'retention_period',
        'international_transfers',
        'transfer_safeguards',
        'location_type',
        'location_detail',
        'vulnerability_notes',
        'review_date',
        'status',
        'created_by_id',
    ];

    protected function casts(): array
    {
        return [
            'is_personal_data'        => 'boolean',
            'is_special_category'     => 'boolean',
            'international_transfers' => 'boolean',
            'data_subjects'           => 'array',
            'review_date'             => 'date',
        ];
    }

    public function getGdprCompletenessAttribute(): int
    {
        if (!$this->is_personal_data) {
            return 100;
        }
        $required = ['lawful_basis', 'data_subjects', 'retention_period'];
        if ($this->international_transfers) {
            $required[] = 'transfer_safeguards';
        }
        $filled = collect($required)->filter(fn($field) => !empty($this->$field))->count();
        return (int) round(($filled / count($required)) * 100);
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function custodian(): BelongsTo
    {
        return $this->belongsTo(User::class, 'custodian_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function thirdParties(): HasMany
    {
        return $this->hasMany(AssetThirdParty::class);
    }

    public function risks(): BelongsToMany
    {
        return $this->belongsToMany(Risk::class, 'asset_risks');
    }

    public function controls(): BelongsToMany
    {
        return $this->belongsToMany(Control::class, 'asset_controls');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'resource_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopePersonalData($query)
    {
        return $query->where('is_personal_data', true);
    }

    public function scopeDueSoon($query, int $days = 30)
    {
        return $query->whereBetween('review_date', [now(), now()->addDays($days)])
                     ->where('status', '!=', 'Disposed');
    }
}
