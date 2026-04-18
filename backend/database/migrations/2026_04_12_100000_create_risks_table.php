<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('risks', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(NEWSEQUENTIALID())'));
            $table->string('risk_id', 20)->unique();  // RR-YYYY-NNN
            $table->string('title', 500);
            $table->text('description')->nullable();

            $table->string('category', 50);
            // Operational | Regulatory | Financial | Technology |
            // Reputational | Strategic | Third-Party/Outsourcing

            // FCA-specific tags: ["SYSC","COBS","MAR","Operational Resilience"]
            $table->string('fca_tags', 500)->nullable();

            $table->foreignUuid('owner_id')->nullable()->constrained('users')->noActionOnDelete();

            $table->tinyInteger('likelihood');  // 1–5
            $table->tinyInteger('impact');      // 1–5
            // inherent_score computed in application layer (SQLite compat)

            $table->string('rca_method', 10)->nullable();  // fishbone | five_why
            $table->text('rca_data')->nullable();           // JSON

            $table->string('treatment', 10)->nullable();    // Accept|Mitigate|Transfer|Avoid
            $table->text('treatment_plan')->nullable();     // JSON array of action objects

            $table->tinyInteger('residual_likelihood')->nullable();
            $table->tinyInteger('residual_impact')->nullable();
            // residual_score computed in application layer

            $table->date('review_date')->nullable();
            $table->string('status', 15)->default('Open');  // Open|In Review|Closed

            $table->foreignUuid('created_by_id')->nullable()->constrained('users')->noActionOnDelete();
            $table->timestamps();

            // Indexes for common queries
            $table->index('status');
            $table->index('category');
            $table->index('review_date');
            $table->index('owner_id');
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('risks');
    }
};
