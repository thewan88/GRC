<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('controls', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('control_ref', 10)->unique();  // A.5.1, A.8.23 etc.
            $table->string('name', 500);
            $table->text('description');
            $table->string('theme', 20);
            // Organisational | People | Physical | Technological

            $table->string('status', 25)->default('Not Implemented');
            // Not Applicable | Not Implemented | Planned |
            // Partially Implemented | Implemented | Tested

            $table->text('na_justification')->nullable();      // Required when N/A
            $table->text('implementation_notes')->nullable();
            $table->text('evidence')->nullable();               // JSON array

            $table->foreignUuid('owner_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->date('last_review_date')->nullable();
            $table->timestamps();

            $table->index('theme');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('controls');
    }
};
