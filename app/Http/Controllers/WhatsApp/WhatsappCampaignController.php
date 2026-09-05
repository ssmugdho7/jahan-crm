<?php

declare(strict_types=1);

namespace App\Http\Controllers\WhatsApp;

use App\Http\Controllers\Controller;
use App\Models\WhatsappCampaign;
use App\Models\WhatsappContact;
use App\Models\WhatsappTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WhatsappCampaignController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->user()->whatsappAccounts->first()?->id;

        $campaigns = WhatsappCampaign::where('whatsapp_account_id', $accountId)
            ->with('template:id,name,category,status')
            ->latest()
            ->get();

        $templates = WhatsappTemplate::where('whatsapp_account_id', $accountId)
            ->select('id', 'name', 'category', 'status')
            ->get();

        $stats = [
            'total' => $campaigns->count(),
            'draft' => $campaigns->where('status', 'draft')->count(),
            'scheduled' => $campaigns->where('status', 'scheduled')->count(),
            'running' => $campaigns->where('status', 'running')->count(),
            'completed' => $campaigns->where('status', 'completed')->count(),
            'cancelled' => $campaigns->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('whatsapp/campaigns', [
            'campaigns' => $campaigns,
            'templates' => $templates,
            'audiences' => [],
            'stats' => $stats,
        ]);
    }

    public function create(Request $request): Response
    {
        return $this->index($request);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template_id' => 'nullable|exists:whatsapp_templates,id',
            'campaign_type' => 'required|string|in:flash_sale,eid_offer,weekend_offer,free_delivery,discount,new_arrival',
            'audience_filter' => 'nullable|array',
        ]);

        $accountId = $request->user()->whatsappAccounts->first()?->id;
        $validated['whatsapp_account_id'] = $accountId;

        $service = app(\App\Services\WhatsApp\CampaignService::class);
        $service->create($validated);

        return redirect()->route('whatsapp.campaigns')
            ->with('success', 'Campaign created');
    }

    public function show(Request $request, int $id): Response
    {
        return $this->index($request);
    }

    public function edit(Request $request, int $id): Response
    {
        return $this->index($request);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'template_id' => 'nullable|exists:whatsapp_templates,id',
            'campaign_type' => 'nullable|string|in:flash_sale,eid_offer,weekend_offer,free_delivery,discount,new_arrival',
            'audience_filter' => 'nullable|array',
        ]);

        $service = app(\App\Services\WhatsApp\CampaignService::class);
        $service->update($id, $validated);

        return back()->with('success', 'Campaign updated');
    }

    public function destroy(int $id): RedirectResponse
    {
        $campaign = WhatsappCampaign::findOrFail($id);

        if (!in_array($campaign->status, ['draft', 'cancelled'])) {
            return back()->withErrors(['campaign' => 'Cannot delete active campaign']);
        }

        $campaign->delete();

        return back()->with('success', 'Campaign deleted');
    }

    public function send(int $id): RedirectResponse
    {
        $service = app(\App\Services\WhatsApp\CampaignService::class);
        $result = $service->start($id);

        return back()->with('success', "Campaign sent: {$result['sent']} sent, {$result['failed']} failed");
    }

    public function schedule(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'schedule_at' => 'required|date|after:now',
        ]);

        $service = app(\App\Services\WhatsApp\CampaignService::class);
        $service->schedule($id, $validated['schedule_at']);

        return back()->with('success', 'Campaign scheduled');
    }

    public function cancel(int $id): RedirectResponse
    {
        $service = app(\App\Services\WhatsApp\CampaignService::class);
        $service->cancel($id);

        return back()->with('success', 'Campaign cancelled');
    }

    public function duplicate(int $id): RedirectResponse
    {
        $campaign = WhatsappCampaign::findOrFail($id);

        $newCampaign = $campaign->replicate();
        $newCampaign->name = $campaign->name . ' (Copy)';
        $newCampaign->status = 'draft';
        $newCampaign->total_sent = 0;
        $newCampaign->total_delivered = 0;
        $newCampaign->total_read = 0;
        $newCampaign->total_failed = 0;
        $newCampaign->schedule_at = null;
        $newCampaign->started_at = null;
        $newCampaign->completed_at = null;
        $newCampaign->save();

        return back()->with('success', 'Campaign duplicated');
    }
}
