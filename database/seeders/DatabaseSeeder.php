<?php

namespace Database\Seeders;

use App\Models\CurrencySetting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        CurrencySetting::firstOrCreate(
            ['from_currency' => 'KWD', 'to_currency' => 'BDT'],
            ['rate' => 390.0000]
        );

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
    }
}
