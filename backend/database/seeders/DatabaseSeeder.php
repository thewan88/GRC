<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create RBAC roles first (other seeders depend on them)
        $this->call(RolesSeeder::class);

        // 2. Seed all 93 ISO 27001:2022 Annex A controls
        $this->call(AnnexAControlsSeeder::class);

        // 3. Seed a default Trust Centre profile
        $this->call(TrustCentreProfileSeeder::class);
    }
}
