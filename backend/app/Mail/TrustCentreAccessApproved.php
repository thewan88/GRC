<?php

namespace App\Mail;

use App\Models\TrustCentreAccessRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TrustCentreAccessApproved extends Mailable
{
    use Queueable, SerializesModels;

    public string $magicLink;

    public function __construct(
        public readonly TrustCentreAccessRequest $accessRequest,
        string $plainToken,
    ) {
        $trustCentreUrl = env('TRUST_CENTRE_URL', 'http://localhost:3000/trust-centre');
        $this->magicLink = "{$trustCentreUrl}/verify?token={$plainToken}";
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your access to our Trust Centre has been approved',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.trust-centre.access-approved',
            with: [
                'requesterName' => $this->accessRequest->requester_name,
                'magicLink'     => $this->magicLink,
                'expiresAt'     => $this->accessRequest->token_expires_at?->format('d M Y'),
            ],
        );
    }
}
