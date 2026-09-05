<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_account_id')->constrained('whatsapp_accounts')->cascadeOnDelete();
            $table->foreignId('template_id')->nullable()->constrained('whatsapp_templates')->nullOnDelete();
            $table->string('name');
            $table->enum('campaign_type', [
                'flash_sale', 'eid_offer', 'weekend_offer', 'free_delivery',
                'discount', 'new_arrival',
            ]);

            $table->json('audience_filter')->nullable();
            $table->string('banner_image')->nullable();
            $table->string('product_image')->nullable();

            $table->string('coupon_code')->nullable();
            $table->string('website_link')->nullable();
            $table->string('cta_button_text')->nullable();
            $table->string('cta_button_url')->nullable();

            $table->timestamp('schedule_at')->nullable();
            $table->string('timezone')->default('Asia/Dhaka');
            $table->enum('status', ['draft', 'scheduled', 'running', 'completed', 'cancelled'])->default('draft');

            $table->unsignedInteger('total_sent')->default(0);
            $table->unsignedInteger('total_delivered')->default(0);
            $table->unsignedInteger('total_read')->default(0);
            $table->unsignedInteger('total_failed')->default(0);
            $table->unsignedInteger('total_replies')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('whatsapp_account_id');
            $table->index('template_id');
            $table->index('campaign_type');
            $table->index('status');
            $table->index('schedule_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_campaigns');
    }
};
