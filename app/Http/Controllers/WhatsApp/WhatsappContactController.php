<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\WhatsappContact;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappContactController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsappService
    ) {}

    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $contacts = WhatsappContact::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,mobile,email,order_status')
            ->latest()
            ->get();

        $stats = [
            'total' => $contacts->count(),
            'active' => $contacts->where('status', 'active')->count(),
            'inactive' => $contacts->where('status', 'inactive')->count(),
            'blocked' => $contacts->where('status', 'blocked')->count(),
        ];

        return Inertia::render('whatsapp/contacts', [
            'contacts' => $contacts,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'tag']),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'contact_ids' => 'required|array',
            'contact_ids.*' => 'exists:contacts,id',
        ]);

        $accountId = $request->user()->whatsappAccounts->first()?->id;

        if (!$accountId) {
            return back()->withErrors(['account' => 'No WhatsApp account connected']);
        }

        $imported = 0;
        $skipped = 0;

        foreach ($request->input('contact_ids') as $contactId) {
            $contact = Contact::findOrFail($contactId);
            $phone = $this->normalizePhoneNumber($contact->mobile);

            if (WhatsappContact::where('whatsapp_account_id', $accountId)
                ->where('phone', $phone)
                ->exists()) {
                $skipped++;
                continue;
            }

            WhatsappContact::create([
                'whatsapp_account_id' => $accountId,
                'contact_id' => $contact->id,
                'phone' => $phone,
                'whatsapp_number' => $phone,
                'name' => $contact->name ?? $contact->mobile,
                'status' => 'active',
                'tags' => [],
                'opt_in' => false,
            ]);

            $imported++;
        }

        return back()->with('success', "Imported {$imported} contacts. Skipped {$skipped} duplicates.");
    }

    public function sync(Request $request): RedirectResponse
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        if (!$accountId) {
            return back()->withErrors(['account' => 'No WhatsApp account connected']);
        }

        $result = $this->whatsappService->syncContacts($accountId);

        return back()->with('success', "Synced {$result['synced']} new contacts. {$result['skipped']} already exist.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $contact = WhatsappContact::findOrFail($id);

        $validated = $request->validate([
            'status' => 'nullable|string|in:active,inactive,vip',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $contact->update(array_filter($validated));

        return back()->with('success', 'Contact updated');
    }

    public function destroy(int $id): RedirectResponse
    {
        $contact = WhatsappContact::findOrFail($id);
        $contact->delete();

        return back()->with('success', 'Contact deleted');
    }

    public function export(Request $request): StreamedResponse
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $contacts = WhatsappContact::where('whatsapp_account_id', $accountId)
            ->with('contact:id,name,mobile,email')
            ->get();

        return response()->streamDownload(function () use ($contacts) {
            $stream = fopen('php://output', 'w');
            fwrite($stream, "\xEF\xBB\xBF");

            fputcsv($stream, ['#', 'Name', 'Phone', 'Email', 'Status', 'Tags', 'Opt-in']);

            foreach ($contacts as $i => $contact) {
                fputcsv($stream, [
                    $i + 1,
                    $contact->name ?? '',
                    $contact->phone ?? '',
                    $contact->contact->email ?? '',
                    $contact->status,
                    implode(', ', $contact->tags ?? []),
                    $contact->opt_in ? 'Yes' : 'No',
                ]);
            }

            fclose($stream);
        }, 'whatsapp-contacts.csv');
    }

    private function normalizePhoneNumber(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);

        if (!str_starts_with($phone, '+')) {
            $phone = '+880' . ltrim($phone, '0');
        }

        return $phone;
    }
}
