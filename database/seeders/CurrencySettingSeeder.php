<?php

namespace Database\Seeders;

use App\Models\CurrencySetting;
use Illuminate\Database\Seeder;

class CurrencySettingSeeder extends Seeder
{
    public function run(): void
    {
        CurrencySetting::firstOrCreate(
            ['from_currency' => 'KWD', 'to_currency' => 'BDT'],
            ['rate' => 390.0000]
        );
    }
}
