<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'images',
        'description',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
    ];
}
