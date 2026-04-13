<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Append-only audit trail — never UPDATE or DELETE rows in this table
        Schema::create('audit_log', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));

            $table->foreignUuid('user_id')->constrained('users');
            $table->string('user_email', 255); // Denormalised: user may be deleted later

            $table->string('action', 10);      // CREATE | UPDATE | DELETE
            $table->string('resource_type', 50); // risk | asset | control | user | trust_centre_*
            $table->uuid('resource_id');
            $table->string('resource_ref', 50)->nullable(); // RR-2024-001 (human-readable)

            $table->text('old_values')->nullable();    // JSON snapshot before change
            $table->text('new_values')->nullable();    // JSON snapshot after change
            $table->string('changed_fields', 500)->nullable(); // JSON array of field names

            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();

            // Only created_at — no updated_at (append-only)
            $table->timestamp('created_at')->useCurrent();

            $table->index(['resource_type', 'resource_id']);
            $table->index(['user_id', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};
