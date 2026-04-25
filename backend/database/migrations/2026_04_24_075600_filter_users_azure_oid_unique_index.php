<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'users_azure_oid_unique')
                DROP INDEX [users_azure_oid_unique] ON [users]
        ");

        DB::statement("
            CREATE UNIQUE INDEX [users_azure_oid_unique]
            ON [users] ([azure_oid])
            WHERE [azure_oid] IS NOT NULL
        ");
    }

    public function down(): void
    {
        DB::statement("
            IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'users_azure_oid_unique')
                DROP INDEX [users_azure_oid_unique] ON [users]
        ");

        DB::statement("
            CREATE UNIQUE INDEX [users_azure_oid_unique]
            ON [users] ([azure_oid])
        ");
    }
};
