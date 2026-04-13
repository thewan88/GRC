<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\TrustCentreAccessApproved;
use App\Models\Control;
use App\Models\Risk;
use App\Models\TrustCentreAccessRequest;
use App\Models\TrustCentreDocument;
use App\Models\TrustCentreDocumentDownload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TrustCentreController extends Controller
{
    // ─── Public Endpoints (no auth required) ──────────────────────────────────

    /** GET /api/v1/trust-centre/profile */
    public function profile(): JsonResponse
    {
        $profile = \App\Models\TrustCentreProfile::first();
        $certs   = \App\Models\TrustCentreCertification::where('is_published', true)->orderBy('display_order')->get();

        return response()->json([
            'data' => [
                'profile'          => $profile,
                'certifications'   => $certs,
            ],
            'errors' => null,
        ]);
    }

    /**
     * GET /api/v1/trust-centre/metrics
     * Live compliance metrics derived from the internal GRC registers.
     * Only safe, aggregate stats — no sensitive risk details exposed publicly.
     */
    public function metrics(): JsonResponse
    {
        $themes = ['Organisational', 'People', 'Physical', 'Technological'];
        $controlStats = [];
        foreach ($themes as $theme) {
            $applicable  = Control::byTheme($theme)->applicable()->count();
            $implemented = Control::byTheme($theme)->implemented()->count();
            $controlStats[$theme] = [
                'applicable'  => $applicable,
                'implemented' => $implemented,
                'percentage'  => $applicable > 0 ? round(($implemented / $applicable) * 100) : 0,
            ];
        }

        $totalControls     = Control::applicable()->count();
        $implementedTotal  = Control::implemented()->count();
        $overallCompliance = $totalControls > 0 ? round(($implementedTotal / $totalControls) * 100) : 0;

        return response()->json([
            'data' => [
                'iso_27001_compliance' => [
                    'overall_percentage' => $overallCompliance,
                    'by_theme'           => $controlStats,
                    'total_controls'     => 93,
                    'applicable'         => $totalControls,
                    'implemented'        => $implementedTotal,
                ],
            ],
            'errors' => null,
        ]);
    }

    /** GET /api/v1/trust-centre/documents?visibility=public */
    public function documents(Request $request): JsonResponse
    {
        $visitor = $this->resolveVisitor($request);

        $query = TrustCentreDocument::published();

        if (!$visitor) {
            // Unauthenticated — only public documents
            $query->where('visibility', 'public');
        }
        // Approved visitor sees all published documents

        $docs = $query->orderBy('category')->orderBy('title')->get();

        return response()->json([
            'data'   => $docs->map(fn($d) => $this->formatDocument($d)),
            'errors' => null,
        ]);
    }

    /** GET /api/v1/trust-centre/documents/{document}/download */
    public function downloadDocument(Request $request, TrustCentreDocument $document): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $visitor = $this->resolveVisitor($request);

        if ($document->visibility !== 'public' && !$visitor) {
            abort(403, 'Access required. Please submit an access request.');
        }

        if (!$document->is_published || !$document->file_path) {
            abort(404);
        }

        // Log the download
        TrustCentreDocumentDownload::create([
            'document_id'        => $document->id,
            'requester_email'    => $visitor?->requester_email,
            'requester_company'  => $visitor?->requester_company,
            'ip_address'         => $request->ip(),
            'downloaded_at'      => now(),
        ]);

        return Storage::disk('documents')->download($document->file_path, $document->file_name);
    }

    /** POST /api/v1/trust-centre/access-requests — submit request form */
    public function submitAccessRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requester_name'      => 'required|string|max:255',
            'requester_email'     => 'required|email|max:255',
            'requester_company'   => 'nullable|string|max:255',
            'requester_job_title' => 'nullable|string|max:255',
            'purpose'             => 'nullable|string|max:1000',
            'nda_accepted'        => 'boolean',
        ]);

        // Prevent duplicate pending requests
        $existing = TrustCentreAccessRequest::where('requester_email', $validated['requester_email'])
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'data'   => null,
                'errors' => ['message' => 'You already have a pending access request.'],
            ], 422);
        }

        TrustCentreAccessRequest::create($validated);

        return response()->json([
            'data'   => ['message' => 'Access request submitted. You will be notified by email when reviewed.'],
            'errors' => null,
        ], 201);
    }

    /** POST /api/v1/trust-centre/verify — exchange magic link token for session */
    public function verify(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        $accessRequest = TrustCentreAccessRequest::where('status', 'approved')
            ->whereNotNull('access_token')
            ->get()
            ->first(fn($ar) => Hash::check($request->token, $ar->access_token));

        if (!$accessRequest || !$accessRequest->isTokenValid()) {
            return response()->json([
                'data'   => null,
                'errors' => ['message' => 'Invalid or expired access token.'],
            ], 401);
        }

        // Store visitor info in session (no Entra ID involved for external visitors)
        $request->session()->put('trust_centre_visitor', [
            'request_id' => $accessRequest->id,
            'email'      => $accessRequest->requester_email,
            'company'    => $accessRequest->requester_company,
        ]);

        return response()->json([
            'data'   => ['email' => $accessRequest->requester_email, 'company' => $accessRequest->requester_company],
            'errors' => null,
        ]);
    }

    // ─── Admin Endpoints (Sanctum auth required) ──────────────────────────────

    /** GET /api/v1/trust-centre/admin/access-requests */
    public function adminAccessRequests(Request $request): JsonResponse
    {
        $this->authorize('manage', TrustCentreAccessRequest::class);

        $requests = TrustCentreAccessRequest::with('reviewedBy:id,full_name')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data'   => $requests->items(),
            'meta'   => ['page' => $requests->currentPage(), 'per_page' => $requests->perPage(), 'total' => $requests->total()],
            'errors' => null,
        ]);
    }

    /** PATCH /api/v1/trust-centre/admin/access-requests/{request}/approve */
    public function approveAccessRequest(TrustCentreAccessRequest $accessRequest): JsonResponse
    {
        $this->authorize('manage', TrustCentreAccessRequest::class);

        $plainToken = Str::random(48);
        $ttlDays    = (int) env('TRUST_CENTRE_TOKEN_TTL_DAYS', 7);

        $accessRequest->update([
            'status'           => 'approved',
            'access_token'     => Hash::make($plainToken),
            'token_expires_at' => now()->addDays($ttlDays),
            'reviewed_by_id'   => auth()->id(),
            'reviewed_at'      => now(),
        ]);

        // Email the magic link to the requester
        Mail::to($accessRequest->requester_email)
            ->send(new TrustCentreAccessApproved($accessRequest, $plainToken));

        return response()->json(['data' => $accessRequest->fresh(), 'errors' => null]);
    }

    /** PATCH /api/v1/trust-centre/admin/access-requests/{request}/reject */
    public function rejectAccessRequest(TrustCentreAccessRequest $accessRequest): JsonResponse
    {
        $this->authorize('manage', TrustCentreAccessRequest::class);

        $accessRequest->update([
            'status'         => 'rejected',
            'reviewed_by_id' => auth()->id(),
            'reviewed_at'    => now(),
        ]);

        return response()->json(['data' => $accessRequest->fresh(), 'errors' => null]);
    }

    /** POST /api/v1/trust-centre/admin/documents — upload a document */
    public function uploadDocument(Request $request): JsonResponse
    {
        $this->authorize('manage', TrustCentreDocument::class);

        $validated = $request->validate([
            'title'       => 'required|string|max:500',
            'description' => 'nullable|string',
            'category'    => 'required|in:Policy,DPA,PenTest,Certificate,Report,Other',
            'visibility'  => 'required|in:public,request_required,nda_required',
            'version'     => 'nullable|string|max:20',
            'is_published' => 'boolean',
            'file'        => 'required|file|mimes:pdf,doc,docx,xlsx,csv,txt|max:51200', // 50MB
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'documents');

        $document = TrustCentreDocument::create([
            'title'          => $validated['title'],
            'description'    => $validated['description'] ?? null,
            'category'       => $validated['category'],
            'visibility'     => $validated['visibility'],
            'version'        => $validated['version'] ?? null,
            'is_published'   => $validated['is_published'] ?? false,
            'file_path'      => $path,
            'file_name'      => $file->getClientOriginalName(),
            'file_size'      => $file->getSize(),
            'mime_type'      => $file->getMimeType(),
            'published_by_id' => auth()->id(),
            'published_at'   => ($validated['is_published'] ?? false) ? now() : null,
        ]);

        return response()->json(['data' => $this->formatDocument($document), 'errors' => null], 201);
    }

    /** GET /api/v1/trust-centre/admin/download-log */
    public function downloadLog(Request $request): JsonResponse
    {
        $this->authorize('manage', TrustCentreDocument::class);

        $logs = TrustCentreDocumentDownload::with('document:id,title')
            ->latest('downloaded_at')
            ->paginate(50);

        return response()->json([
            'data'   => $logs->items(),
            'meta'   => ['page' => $logs->currentPage(), 'per_page' => $logs->perPage(), 'total' => $logs->total()],
            'errors' => null,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function resolveVisitor(Request $request): ?TrustCentreAccessRequest
    {
        $visitor = $request->session()->get('trust_centre_visitor');
        if (!$visitor) {
            return null;
        }
        $ar = TrustCentreAccessRequest::find($visitor['request_id'] ?? null);
        return $ar?->isTokenValid() ? $ar : null;
    }

    private function formatDocument(TrustCentreDocument $doc): array
    {
        return [
            'id'           => $doc->id,
            'title'        => $doc->title,
            'description'  => $doc->description,
            'category'     => $doc->category,
            'visibility'   => $doc->visibility,
            'version'      => $doc->version,
            'file_name'    => $doc->file_name,
            'file_size'    => $doc->file_size,
            'is_published' => $doc->is_published,
            'published_at' => $doc->published_at?->toIso8601String(),
            'updated_at'   => $doc->updated_at?->toIso8601String(),
        ];
    }
}
