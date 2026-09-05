<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurrencySetting extends Model
{
    protected $fillable = ['from_currency', 'to_currency', 'rate'];

    public static function getRate(string $from, string $to): float
    {
        $setting = static::where('from_currency', $from)->where('to_currency', $to)->first();

        return $setting ? (float) $setting->rate : 0;
    }
}
