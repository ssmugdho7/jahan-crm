<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IncomeStatement extends Model
{
    use HasFactory;
    protected $fillable = [
        'period',
        'total_sales',
        'facebook_boost_cost',
        'mobile_internet_cost',
        'net_profit',
    ];

    protected $casts = [
        'total_sales' => 'decimal:2',
        'facebook_boost_cost' => 'decimal:2',
        'mobile_internet_cost' => 'decimal:2',
        'net_profit' => 'decimal:2',
    ];

    public static function calculateNetProfit(float $totalSales, float $facebookBoost, float $mobileInternet): float
    {
        return $totalSales - $facebookBoost - $mobileInternet;
    }
}
