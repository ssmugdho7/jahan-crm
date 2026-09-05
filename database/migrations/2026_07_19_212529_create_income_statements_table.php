<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('income_statements', function (Blueprint $table) {
            $table->id();
            $table->string('period')->nullable();
            $table->decimal('total_sales', 12, 2)->default(0);
            $table->decimal('facebook_boost_cost', 12, 2)->default(0);
            $table->decimal('mobile_internet_cost', 12, 2)->default(0);
            $table->decimal('net_profit', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('income_statements');
    }
};
