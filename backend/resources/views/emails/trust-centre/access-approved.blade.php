<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust Centre Access Approved</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: #1e3a5f; color: #fff; padding: 32px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; }
        .body { padding: 32px; }
        .cta-button { display: inline-block; margin: 24px 0; padding: 14px 28px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; }
        .note { background: #f0f4ff; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #374151; }
        .footer { padding: 24px 32px; background: #f9fafb; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Trust Centre Access Approved</h1>
    </div>
    <div class="body">
        <p>Dear {{ $requesterName }},</p>
        <p>Your request to access our Trust Centre has been <strong>approved</strong>. You can now view our compliance documentation, security policies, and certifications.</p>
        <p>Click the button below to access the Trust Centre:</p>
        <div style="text-align: center;">
            <a href="{{ $magicLink }}" class="cta-button">Access Trust Centre</a>
        </div>
        <div class="note">
            <strong>Important:</strong> This link is unique to you and will expire on <strong>{{ $expiresAt }}</strong>. Do not share this link with others.
        </div>
        <p>If the button above does not work, copy and paste the following URL into your browser:</p>
        <p style="word-break: break-all; font-size: 13px; color: #4b5563;">{{ $magicLink }}</p>
    </div>
    <div class="footer">
        <p>This email was sent because you submitted an access request to our Trust Centre. If you did not make this request, please ignore this email.</p>
    </div>
</div>
</body>
</html>
