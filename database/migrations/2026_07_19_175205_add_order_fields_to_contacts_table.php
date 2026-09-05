<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->renameColumn('phone', 'mobile');
            $table->string('product_name')->nullable()->after('job_title');
            $table->date('order_date')->nullable()->after('product_name');
            $table->string('order_status')->default('Pending')->after('order_date');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->renameColumn('mobile', 'phone');
            $table->dropColumn(['product_name', 'order_date', 'order_status']);
        });
    }
};
