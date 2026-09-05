<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappContact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappAudienceController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $contacts = $accountId
            ? WhatsappContact::where('whatsapp_account_id', $accountId)->get()
            : collect();

        $audiences = cache()->get('audiences_' . auth()->id(), []);

        $segments = [
            'all' => $contacts->count(),
            'delivered' => 0,
            'pending' => $contacts->where('status', 'active')->count(),
            'cancelled' => $contacts->where('status', 'inactive')->count(),
            'repeat' => $contacts->filter(fn ($c) => ($c->total_orders ?? 0) > 1)->count(),
            'vip' => $contacts->where('status', 'vip')->count(),
            'inactive30' => 0,
            'inactive60' => 0,
            'inactive90' => 0,
        ];

        return Inertia::render('whatsapp/audience', [
            'audiences' => $audiences,
            'segments' => $segments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'filters' => 'required|array',
        ]);

        $accountId = $request->user()->whatsappAccounts->first()?->id;
        $contacts = $this->filterContacts($accountId, $validated['filters']);

        $audiences = cache()->get('audiences_' . auth()->id(), []);
        $audiences[] = [
            'id' => count($audiences) + 1,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'type' => 'dynamic',
            'contact_count' => $contacts->count(),
            'filters' => $validated['filters'],
            'is_dynamic' => true,
            'created_at' => now()->toIso8601String(),
        ];

        cache()->put('audiences_' . auth()->id(), $audiences, now()->addHours(24));

        return back()->with('success', 'Audience created with ' . $contacts->count() . ' contacts');
    }

    public function show(Request $request, string $id): Response
    {
        return $this->index($request);
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $audiences = cache()->get('audiences_' . auth()->id(), []);
        $audiences = array_filter($audiences, fn ($a) => (string) $a['id'] !== $id);
        cache()->put('audiences_' . auth()->id(), array_values($audiences), now()->addHours(24));

        return back()->with('success', 'Audience deleted');
    }

    private function filterContacts(?int $accountId, array $filters): \Illuminate\Database\Eloquent\Collection
    {
        $query = WhatsappContact::where('whatsapp_account_id', $accountId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['tags'])) {
            foreach ((array) $filters['tags'] as $tag) {
                $query->whereJsonContains('tags', $tag);
            }
        }

        if (!empty($filters['opt_in'])) {
            $query->where('opt_in', true);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('phone', 'like', "%{$filters['search']}%");
            });
        }

        return $query->get();
    }
}
