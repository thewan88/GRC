<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustCentreAccessRequest extends Model
{
    use HasUuids;

    protected $table = 'trust_centre_access_requests';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'requester_name',
        'requester_email',
        'requester_company',
        'requester_job_title',
        'purpose',
        'status',
        'access_token',
        'token_expires_at',
        'nda_accepted',
        'reviewed_by_id',
        'reviewed_at',
    ];

    protected $hidden = ['access_token'];

    protected function casts(): array
    {
        return [
            'nda_accepted'      => 'boolean',
            'token_expires_at'  => 'datetime',
            'reviewed_at'       => 'datetime',
        ];
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_id');
    }

    public function isTokenValid(): bool
    {
        return $this->status === 'approved'
            && $this->access_token !== null
            && $this->token_expires_at !== null
            && $this->token_expires_at->isFuture();
    }
}
