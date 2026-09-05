<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_account_id')->constrained('whatsapp_accounts')->cascadeOnDelete();
            $table->foreignId('contact_id')->constrained('whatsapp_contacts')->cascadeOnDelete();
            $table->foreignId('campaign_id')->nullable()->constrained('whatsapp_campaigns')->nullOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('whatsapp_templates')->nullOnDelete();

            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('message_type', ['text', 'image', 'video', 'document', 'audio', 'template', 'interactive']);

            $table->longText('content')->nullable();
            $table->string('media_url')->nullable();
            $table->string('caption')->nullable();

            $table->string('whatsapp_message_id')->nullable();
            $table->enum('status', ['sent', 'delivered', 'read', 'failed', 'pending'])->default('pending');

            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            $table->timestamps();

            $table->index('whatsapp_account_id');
            $table->index('contact_id');
            $table->index('campaign_id');
            $table->index('template_id');
            $table->index('direction');
            $table->index('message_type');
            $table->index('status');
            $table->index('whatsapp_message_id');
            $table->index('sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
