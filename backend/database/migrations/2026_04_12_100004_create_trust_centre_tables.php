<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Company profile shown on the Trust Centre landing page
        Schema::create('trust_centre_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('company_name', 255);
            $table->string('tagline', 500)->nullable();
            $table->string('logo_path', 500)->nullable();
            $table->string('contact_email', 255)->nullable();
            $table->string('fca_reference', 50)->nullable();       // FCA firm reference number
            $table->string('ico_reference', 50)->nullable();       // ICO registration number
            $table->string('iso_cert_number', 100)->nullable();    // ISO 27001 cert number
            $table->text('description')->nullable();               // Company compliance overview
            $table->foreignUuid('updated_by_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->timestamps();
        });

        // Certifications displayed on Trust Centre (ISO 27001, FCA, ICO, etc.)
        Schema::create('trust_centre_certifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('name', 255);               // "ISO 27001:2022"
            $table->string('issuer', 255)->nullable(); // "BSI Group"
            $table->string('certificate_number', 100)->nullable();
            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->string('cert_file_path', 500)->nullable();  // Uploaded certificate file
            $table->boolean('is_published')->default(false);
            $table->smallInteger('display_order')->default(0);
            $table->timestamps();
        });

        // Documents published on Trust Centre (policies, DPAs, pen test reports, etc.)
        Schema::create('trust_centre_documents', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('title', 500);
            $table->text('description')->nullable();
            $table->string('category', 50)->default('Policy');
            // Policy | DPA | PenTest | Certificate | Report | Other

            $table->string('file_path', 500)->nullable();
            $table->string('file_name', 255)->nullable();
            $table->bigInteger('file_size')->nullable();       // bytes
            $table->string('mime_type', 100)->nullable();

            $table->string('visibility', 20)->default('request_required');
            // public | request_required | nda_required

            $table->string('version', 20)->nullable();        // "v2.1"
            $table->boolean('is_published')->default(false);
            $table->foreignUuid('published_by_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('visibility');
            $table->index('is_published');
        });

        // External visitor access requests
        Schema::create('trust_centre_access_requests', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('requester_name', 255);
            $table->string('requester_email', 255);
            $table->string('requester_company', 255)->nullable();
            $table->string('requester_job_title', 255)->nullable();
            $table->text('purpose')->nullable();
            $table->string('status', 15)->default('pending');  // pending | approved | rejected

            // Set when approved — stored hashed (sha256), sent as plain in email
            $table->string('access_token', 64)->nullable()->unique();
            $table->timestamp('token_expires_at')->nullable();
            $table->boolean('nda_accepted')->default(false);

            $table->foreignUuid('reviewed_by_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('requester_email');
        });

        // Document download audit trail (who downloaded what)
        Schema::create('trust_centre_document_downloads', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->foreignUuid('document_id')->constrained('trust_centre_documents')->cascadeOnDelete();
            $table->string('requester_email', 255)->nullable();   // Null for public downloads
            $table->string('requester_company', 255)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('downloaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trust_centre_document_downloads');
        Schema::dropIfExists('trust_centre_access_requests');
        Schema::dropIfExists('trust_centre_documents');
        Schema::dropIfExists('trust_centre_certifications');
        Schema::dropIfExists('trust_centre_profiles');
    }
};
