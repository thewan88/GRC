<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustCentreProfile extends Model
{
    use HasUuids;

    protected $table = 'trust_centre_profiles';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'company_name', 'tagline', 'logo_path', 'contact_email',
        'fca_reference', 'ico_reference', 'iso_cert_number', 'description', 'updated_by_id',
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_id');
    }
}
