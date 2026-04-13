<?php

namespace Database\Seeders;

use App\Models\TrustCentreProfile;
use Illuminate\Database\Seeder;

class TrustCentreProfileSeeder extends Seeder
{
    public function run(): void
    {
        TrustCentreProfile::firstOrCreate(
            [],
            [
                'company_name'    => 'Your Company Name Ltd',
                'tagline'         => 'Committed to security, privacy, and compliance.',
                'contact_email'   => 'security@company.com',
                'fca_reference'   => 'XXXXXX',
                'ico_reference'   => 'ZXXXXXXX',
                'iso_cert_number' => '',
                'description'     => 'We are an FCA-authorised UK ACD firm certified to ISO 27001:2022 and registered with the ICO under UK GDPR. This Trust Centre provides transparency into our information security and compliance programme.',
            ]
        );
    }
}
