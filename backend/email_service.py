import urllib.request
import urllib.error
import ssl
import json
import random
import os
from pathlib import Path
from dotenv import load_dotenv

# Load local .env if available
env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)
load_dotenv()

def generate_otp_code() -> str:
    """Generate a random 6-digit numeric OTP."""
    return f"{random.randint(100000, 999999)}"

def send_verification_email(recipient_email: str, recipient_name: str, otp_code: str):
    """Send a transactional verification email containing the 6-digit OTP via Brevo API."""
    api_key = os.getenv("BREVO_API_KEY", "").strip()
    sender_email = os.getenv("BREVO_SENDER_EMAIL", "uhaider695@gmail.com").strip()
    sender_name = os.getenv("BREVO_SENDER_NAME", "619 Islam").strip()

    if not api_key:
        err = "BREVO_API_KEY environment variable is not configured."
        print(f"Warning: {err}")
        return False, err

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your 619 Islam Account</title>
    </head>
    <body style="margin:0; padding:30px 15px; background-color:#071e20; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px; background-color:#0d2b2c; border:1px solid rgba(245,158,11,0.3); border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding:35px 25px 20px 25px;">
            <h1 style="margin:0; font-size:30px; font-weight:900; letter-spacing:3px; color:#f59e0b;">619 ISLAM</h1>
            <p style="margin:6px 0 0 0; font-size:12px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase;">Daily Quran & Habit Companion</p>
          </td>
        </tr>

        <!-- Greeting & Message -->
        <tr>
          <td style="padding:0 35px 20px 35px; color:#e2e8f0; font-size:15px; line-height:1.6; text-align:center;">
            <p style="margin:0 0 12px 0;">Assalamu Alaikum <strong>{recipient_name}</strong>,</p>
            <p style="margin:0; color:#94a3b8; font-size:14px;">Thank you for joining 619 Islam. Please use the 6-digit verification code below to activate your account:</p>
          </td>
        </tr>

        <!-- OTP Code Box -->
        <tr>
          <td align="center" style="padding:10px 35px 25px 35px;">
            <div style="background-color:rgba(245,158,11,0.1); border:2px dashed #f59e0b; border-radius:18px; padding:22px; max-width:320px;">
              <span style="font-size:36px; font-weight:900; letter-spacing:10px; color:#fbbf24; display:block; font-family:Courier, monospace;">
                {otp_code}
              </span>
              <span style="display:block; margin-top:8px; font-size:11px; color:#94a3b8; letter-spacing:1px; text-transform:uppercase;">
                ⏳ Valid for 10 minutes
              </span>
            </div>
          </td>
        </tr>

        <!-- Security Warning -->
        <tr>
          <td style="padding:0 35px 30px 35px; color:#64748b; font-size:12px; text-align:center; line-height:1.5;">
            <p style="margin:0;">If you did not request this email, no further action is required. Please do not share this code with anyone.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="background-color:#082022; padding:18px 25px; border-top:1px solid rgba(255,255,255,0.06); color:#64748b; font-size:11px;">
            &copy; 2026 619 Islam. Built with devotion.
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": recipient_email, "name": recipient_name}],
        "subject": f"619 Islam - Your Verification Code is {otp_code}",
        "htmlContent": html_content
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        ctx = ssl._create_unverified_context()

        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            resp_body = resp.read().decode("utf-8", errors="ignore")
            if resp.status in [200, 201, 202]:
                print(f"Verification email sent to {recipient_email} (Code: {otp_code})")
                return True, "Email sent successfully"
            return False, f"Unexpected response status: {resp.status} - {resp_body}"
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        print(f"Brevo HTTPError ({e.code}): {err_body}")
        return False, f"Brevo HTTP {e.code}: {err_body}"
    except Exception as e:
        err = str(e)
        print(f"Failed to send email via Brevo: {err}")
        return False, err

def send_password_reset_email(recipient_email: str, recipient_name: str, reset_link: str, expire_minutes: int = 5):
    """Send a transactional password reset email with a 5-minute expiry link via Brevo API."""
    api_key = os.getenv("BREVO_API_KEY", "").strip()
    sender_email = os.getenv("BREVO_SENDER_EMAIL", "uhaider695@gmail.com").strip()
    sender_name = os.getenv("BREVO_SENDER_NAME", "619 Islam").strip()

    if not api_key:
        err = "BREVO_API_KEY environment variable is not configured."
        print(f"Warning: {err}")
        return False, err

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your 619 Islam Password</title>
    </head>
    <body style="margin:0; padding:30px 15px; background-color:#071e20; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px; background-color:#0d2b2c; border:1px solid rgba(245,158,11,0.3); border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.4);">
        <!-- Header -->
        <tr>
          <td align="center" style="padding:35px 25px 20px 25px;">
            <h1 style="margin:0; font-size:30px; font-weight:900; letter-spacing:3px; color:#f59e0b;">619 ISLAM</h1>
            <p style="margin:6px 0 0 0; font-size:12px; letter-spacing:2px; color:#94a3b8; text-transform:uppercase;">Account Security & Recovery</p>
          </td>
        </tr>

        <!-- Greeting & Message -->
        <tr>
          <td style="padding:0 35px 20px 35px; color:#e2e8f0; font-size:15px; line-height:1.6; text-align:center;">
            <p style="margin:0 0 12px 0;">Assalamu Alaikum <strong>{recipient_name}</strong>,</p>
            <p style="margin:0; color:#94a3b8; font-size:14px;">We received a request to reset the password for your 619 Islam account. Click the button below to choose a new password:</p>
          </td>
        </tr>

        <!-- Action Button -->
        <tr>
          <td align="center" style="padding:10px 35px 25px 35px;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center" style="border-radius:16px; background:linear-gradient(135deg, #f59e0b, #d97706); box-shadow:0 10px 20px rgba(245,158,11,0.3);">
                  <a href="{reset_link}" target="_blank" style="display:inline-block; padding:16px 36px; font-size:16px; font-weight:bold; color:#071e20; text-decoration:none; border-radius:16px; letter-spacing:0.5px;">
                    Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <span style="display:block; margin-top:14px; font-size:12px; font-weight:600; color:#fbbf24; letter-spacing:0.5px;">
              ⏳ This link expires in {expire_minutes} minutes
            </span>
          </td>
        </tr>

        <!-- Fallback Link -->
        <tr>
          <td style="padding:0 35px 25px 35px; color:#94a3b8; font-size:12px; line-height:1.5; text-align:center;">
            <p style="margin:0 0 6px 0;">Or copy and paste this link in your browser:</p>
            <p style="margin:0; word-break:break-all; color:#38bdf8; font-size:11px;">
              <a href="{reset_link}" style="color:#38bdf8; text-decoration:underline;">{reset_link}</a>
            </p>
          </td>
        </tr>

        <!-- Security Warning -->
        <tr>
          <td style="padding:0 35px 30px 35px; color:#64748b; font-size:12px; text-align:center; line-height:1.5;">
            <p style="margin:0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="background-color:#082022; padding:18px 25px; border-top:1px solid rgba(255,255,255,0.06); color:#64748b; font-size:11px;">
            &copy; 2026 619 Islam. Built with devotion.
          </td>
        </tr>
      </table>
    </body>
    </html>
    """

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": recipient_email, "name": recipient_name}],
        "subject": "619 Islam - Password Reset Request (Expires in 5 Minutes)",
        "htmlContent": html_content
    }

    try:
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
        ctx = ssl._create_unverified_context()

        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            resp_body = resp.read().decode("utf-8", errors="ignore")
            if resp.status in [200, 201, 202]:
                print(f"Password reset email sent to {recipient_email}")
                return True, "Email sent successfully"
            return False, f"Unexpected response status: {resp.status} - {resp_body}"
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="ignore")
        print(f"Brevo HTTPError ({e.code}): {err_body}")
        return False, f"Brevo HTTP {e.code}: {err_body}"
    except Exception as e:
        err = str(e)
        print(f"Failed to send password reset email via Brevo: {err}")
        return False, err
