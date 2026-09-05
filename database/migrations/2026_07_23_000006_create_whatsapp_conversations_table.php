<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_account_id')->constrained('whatsapp_accounts')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();

            $table->timestamp('last_message_at')->nullable();
            $table->text('last_message_preview')->nullable();
            $table->unsignedInteger('unread_count')->default(0);

            $table->boolean('is_archived')->default(false);
            $table->boolean('is_pinned')->default(false);

            $table->timestamps();

            $table->index('whatsapp_account_id');
            $table->index('contact_id');
            $table->index('last_message_at');
            $table->index('is_archived');
            $table->index('is_pinned');
            $table->index(['whatsapp_account_id', 'contact_id'], 'wa_conv_account_contact_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_conversations');
    }
};
