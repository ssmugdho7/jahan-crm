<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_account_id')->constrained('whatsapp_accounts')->cascadeOnDelete();
            $table->string('name');
            $table->enum('category', ['marketing', 'transactional', 'utility']);

            $table->longText('body_text');
            $table->string('header_text')->nullable();
            $table->string('footer_text')->nullable();

            $table->json('variables')->nullable();
            $table->json('buttons')->nullable();
            $table->string('media_url')->nullable();
            $table->enum('media_type', ['image', 'video', 'document', 'none'])->default('none');

            $table->enum('status', ['approved', 'pending', 'rejected'])->default('pending');
            $table->string('whatsapp_template_id')->nullable();

            $table->timestamps();

            $table->index('whatsapp_account_id');
            $table->index('category');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_templates');
    }
};
