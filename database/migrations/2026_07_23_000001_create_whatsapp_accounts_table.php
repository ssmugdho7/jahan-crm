<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->string('phone_number');
            $table->string('country_code', 10)->default('+880');

            $table->string('whatsapp_business_account_id')->nullable();
            $table->string('phone_number_id')->nullable();
            $table->string('meta_app_id')->nullable();
            $table->text('meta_app_secret')->nullable();

            $table->text('permanent_access_token')->nullable();
            $table->string('webhook_url')->nullable();
            $table->string('webhook_verify_token')->nullable();

            $table->string('business_website')->nullable();
            $table->string('business_email')->nullable();
            $table->string('business_logo')->nullable();

            $table->enum('connection_status', ['connected', 'disconnected', 'pending'])->default('pending');
            $table->timestamp('last_sync_at')->nullable();

            $table->timestamps();

            $table->index('user_id');
            $table->index('connection_status');
            $table->index('phone_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_accounts');
    }
};
