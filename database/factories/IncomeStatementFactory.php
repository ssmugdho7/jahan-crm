<?php

namespace Database\Factories;

use App\Models\IncomeStatement;
use Illuminate\Database\Eloquent\Factories\Factory;

class IncomeStatementFactory extends Factory
{
    protected $model = IncomeStatement::class;

    public function definition(): array
    {
        $totalSales = fake()->randomFloat(2, 1000, 50000);
        $facebookBoost = fake()->randomFloat(2, 50, 5000);
        $mobileInternet = fake()->randomFloat(2, 20, 500);
        $netProfit = $totalSales - $facebookBoost - $mobileInternet;

        return [
            'period' => fake()->dateTimeThisYear()->format('F Y'),
            'total_sales' => $totalSales,
            'facebook_boost_cost' => $facebookBoost,
            'mobile_internet_cost' => $mobileInternet,
            'net_profit' => $netProfit,
        ];
    }
}
