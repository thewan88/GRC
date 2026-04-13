<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Risk extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'risk_id',
        'title',
        'description',
        'category',
        'fca_tags',
        'owner_id',
        'likelihood',
        'impact',
        'rca_method',
        'rca_data',
        'treatment',
        'treatment_plan',
        'residual_likelihood',
        'residual_impact',
        'review_date',
        'status',
        'created_by_id',
    ];

    protected function casts(): array
    {
        return [
            'fca_tags'            => 'array',
            'rca_data'            => 'array',
            'treatment_plan'      => 'array',
            'likelihood'          => 'integer',
            'impact'              => 'integer',
            'residual_likelihood' => 'integer',
            'residual_impact'     => 'integer',
            'review_date'         => 'date',
        ];
    }

    // ─── Computed Scores ──────────────────────────────────────────────────────

    public function getInherentScoreAttribute(): int
    {
        return ($this->likelihood ?? 0) * ($this->impact ?? 0);
    }

    public function getResidualScoreAttribute(): ?int
    {
        if ($this->residual_likelihood === null || $this->residual_impact === null) {
            return null;
        }
        return $this->residual_likelihood * $this->residual_impact;
    }

    public function getRiskLevelAttribute(): string
    {
        return self::scoreToLevel($this->inherent_score);
    }

    public function getResidualLevelAttribute(): ?string
    {
        if ($this->residual_score === null) {
            return null;
        }
        return self::scoreToLevel($this->residual_score);
    }

    public static function scoreToLevel(int $score): string
    {
        return match(true) {
            $score >= 15 => 'Critical',
            $score >= 10 => 'High',
            $score >= 5  => 'Medium',
            default      => 'Low',
        };
    }

    // ─── Relationships ─────────────────────────────────────────────────────────

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function controls(): BelongsToMany
    {
        return $this->belongsToMany(Control::class, 'risk_controls');
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'asset_risks');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'resource_id');
    }

    // ─── Scopes ────────────────────────────────────────────────────────────────

    public function scopeOpen($query)
    {
        return $query->where('status', 'Open');
    }

    public function scopeOverdue($query)
    {
        return $query->where('review_date', '<', now())->where('status', '!=', 'Closed');
    }

    public function scopeDueSoon($query, int $days = 30)
    {
        return $query->whereBetween('review_date', [now(), now()->addDays($days)])
                     ->where('status', '!=', 'Closed');
    }
}
