<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('asset_id', 20)->unique();  // IAR-YYYY-NNN
            $table->string('name', 500);
            $table->text('description')->nullable();

            $table->string('asset_type', 20);
            // Data | System | Software | People | Physical | Service

            $table->foreignUuid('owner_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->foreignUuid('custodian_id')->nullable()->constrained('users')->noActionOnDelete();

            $table->string('classification', 15);
            // Public | Internal | Confidential | Restricted

            // GDPR fields
            $table->boolean('is_personal_data')->default(false);
            $table->boolean('is_special_category')->default(false);
            $table->string('lawful_basis', 100)->nullable();           // Art.6 basis
            $table->string('special_category_basis', 100)->nullable(); // Art.9 basis
            $table->string('data_subjects', 500)->nullable();           // JSON array
            $table->string('retention_period', 200)->nullable();
            $table->boolean('international_transfers')->default(false);
            $table->text('transfer_safeguards')->nullable();            // SCCs, adequacy etc.

            // Location
            $table->string('location_type', 15)->nullable();
            // on-prem | cloud | third-party | hybrid
            $table->string('location_detail', 500)->nullable();

            $table->text('vulnerability_notes')->nullable();
            $table->date('review_date')->nullable();
            $table->string('status', 10)->default('Active');  // Active | Archived | Disposed

            $table->foreignUuid('created_by_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->timestamps();

            $table->index('classification');
            $table->index('asset_type');
            $table->index('owner_id');
            $table->index('review_date');
        });

        // Risk ↔ Control (many-to-many) — created here so both risks and controls exist
        Schema::create('risk_controls', function (Blueprint $table) {
            $table->foreignUuid('risk_id')->constrained('risks')->cascadeOnDelete();
            $table->foreignUuid('control_id')->constrained('controls')->cascadeOnDelete();
            $table->primary(['risk_id', 'control_id']);
        });

        // Asset ↔ Risk (many-to-many)
        Schema::create('asset_risks', function (Blueprint $table) {
            $table->foreignUuid('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignUuid('risk_id')->constrained('risks')->cascadeOnDelete();
            $table->primary(['asset_id', 'risk_id']);
        });

        // Asset ↔ Control (many-to-many)
        Schema::create('asset_controls', function (Blueprint $table) {
            $table->foreignUuid('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignUuid('control_id')->constrained('controls')->cascadeOnDelete();
            $table->primary(['asset_id', 'control_id']);
        });

        // Asset third-party access records
        Schema::create('asset_third_parties', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->foreignUuid('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('party_name', 255);
            $table->text('purpose')->nullable();
            $table->string('dpa_reference', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_third_parties');
        Schema::dropIfExists('asset_controls');
        Schema::dropIfExists('asset_risks');
        Schema::dropIfExists('risk_controls');
        Schema::dropIfExists('assets');
    }
};
