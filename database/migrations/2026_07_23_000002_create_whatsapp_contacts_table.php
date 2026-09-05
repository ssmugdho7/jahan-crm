<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('whatsapp_account_id')->constrained('whatsapp_accounts')->cascadeOnDelete();
            $table->string('name');
            $table->string('phone');
            $table->string('whatsapp_number');
            $table->string('email')->nullable();
            $table->string('avatar')->nullable();

            $table->enum('status', ['active', 'inactive', 'blocked', 'pending'])->default('active');
            $table->json('tags')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->text('last_message_preview')->nullable();

            $table->unsignedInteger('total_orders')->default(0);
            $table->decimal('total_purchase', 15, 2)->default(0);
            $table->boolean('opt_in')->default(true);

            $table->timestamps();

            $table->index('whatsapp_account_id');
            $table->index('contact_id');
            $table->index('status');
            $table->index('phone');
            $table->index('whatsapp_number');
            $table->index('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_contacts');
    }
};
