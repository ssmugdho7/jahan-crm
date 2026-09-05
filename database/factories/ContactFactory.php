<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\Contact;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactFactory extends Factory
{
    protected $model = Contact::class;

    public function definition(): array
    {
        $countryCode = fake()->randomElement(['+965', '+91', '+92', '+966', '+880', '+94']);
        $phoneNumber = fake()->numerify('########');

        return [
            'company_id' => Company::factory(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'mobile' => $countryCode . $phoneNumber,
            'job_title' => fake()->randomElement(['Manager', 'Director', 'CEO', 'CTO', 'Sales Executive', 'Marketing Manager', 'HR Manager', 'Software Engineer', 'Designer', 'Consultant']),
            'product_name' => fake()->randomElement(['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro', 'iPad Air', 'Dell XPS 15', 'Sony WH-1000XM5', 'AirPods Pro', 'Apple Watch', 'Canon EOS R5', 'Nike Air Max']),
            'profit' => fake()->randomFloat(2, 10, 500),
            'order_date' => fake()->dateTimeBetween('-6 months', 'now'),
            'order_status' => fake()->randomElement(['Done', 'Pending', 'Cancel', 'Upcoming']),
        ];
    }
}
