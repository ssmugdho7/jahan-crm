<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no')->unique();
            $table->foreignId('contact_id')->constrained()->cascadeOnDelete();
            $table->decimal('subtotal', 12, 3)->default(0);
            $table->decimal('discount', 12, 3)->default(0);
            $table->decimal('delivery_charge', 12, 3)->default(0);
            $table->decimal('total', 12, 3)->default(0);
            $table->string('payment_status')->default('Unpaid');
            $table->string('order_status')->default('Pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 12, 3)->default(0);
            $table->decimal('total', 12, 3)->default(0);
            $table->timestamps();
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('category');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 3)->default(0);
            $table->string('payment_method')->default('Cash');
            $table->date('expense_date');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('facebook_ads', function (Blueprint $table) {
            $table->id();
            $table->string('campaign_name');
            $table->string('objective')->nullable();
            $table->decimal('budget', 12, 3)->default(0);
            $table->decimal('amount_spent', 12, 3)->default(0);
            $table->integer('reach')->default(0);
            $table->integer('clicks')->default(0);
            $table->decimal('cpc', 8, 3)->default(0);
            $table->decimal('cpm', 8, 3)->default(0);
            $table->decimal('ctr', 5, 2)->default(0);
            $table->integer('leads')->default(0);
            $table->integer('purchases')->default(0);
            $table->decimal('roas', 8, 2)->default(0);
            $table->date('ad_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('facebook_ads');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
