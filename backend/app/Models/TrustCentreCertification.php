<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TrustCentreCertification extends Model
{
    use HasUuids;

    protected $table = 'trust_centre_certifications';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'issuer', 'certificate_number',
        'issued_date', 'expiry_date', 'cert_file_path',
        'is_published', 'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'issued_date'  => 'date',
            'expiry_date'  => 'date',
        ];
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expiry_date !== null && $this->expiry_date->isPast();
    }
}
