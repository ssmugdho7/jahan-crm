<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_auto_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_account_id')->constrained('whatsapp_accounts')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('whatsapp_templates')->cascadeOnDelete();

            $table->enum('trigger_type', [
                'order_created', 'order_confirmed', 'payment_received',
                'order_shipped', 'order_delivered', 'order_cancelled',
                'birthday', 'festival', 'customer_inactive',
            ]);

            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('delay_minutes')->default(0);
            $table->json('conditions')->nullable();

            $table->timestamps();

            $table->index('whatsapp_account_id');
            $table->index('template_id');
            $table->index('trigger_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_auto_messages');
    }
};
