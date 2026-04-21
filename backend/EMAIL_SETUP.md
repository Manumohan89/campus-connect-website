# Email Setup for OTP Verification

Campus Connect uses **Gmail SMTP via Nodemailer** — no paid API keys needed.
This works on Render free tier.

## Setup Steps

### 1. Enable 2-Factor Authentication on your Gmail
Go to [myaccount.google.com](https://myaccount.google.com) → Security → 2-Step Verification → Enable

### 2. Generate a Gmail App Password
Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Select app: **Mail**
- Select device: **Other** → type "Campus Connect"
- Click **Generate** → copy the 16-character password

### 3. Add to Render Environment Variables
In your Render dashboard → your service → Environment:

| Key | Value |
|-----|-------|
| `EMAIL_USER` | your Gmail address (e.g. `campusconnect@gmail.com`) |
| `EMAIL_PASS` | the 16-char App Password (NOT your Gmail login password) |

### 4. That's it!
Render can send emails outbound on the free tier.
OTP emails will be sent from your Gmail address.

## Dev Mode (no email configured)
If `EMAIL_USER` is not set, the app runs in **dev mode**:
- Registration succeeds and auto-verifies the account
- No OTP step required
- Console logs show what the OTP would have been
