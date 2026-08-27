import httpx
from typing import Optional


class NotificationService:
    """
    Notification Dispatcher for CAPTCHA/bot blocks, system alerts,
    and webhook integrations (Telegram / Email webhooks).
    """

    async def send_captcha_alert(
        self,
        platform: str,
        target_url: str,
        telegram_url: Optional[str] = None,
        email_url: Optional[str] = None,
    ) -> bool:
        message = (
            f"⚠️ [Peachy Security Alert] CAPTCHA / Bot Block detected on {platform} scraper!\n"
            f"URL: {target_url}\n"
            f"Action: Scraper paused gracefully to protect IP reputation. Zero retries executed."
        )

        success = True

        # Dispatch to Telegram Webhook if configured
        if telegram_url:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(telegram_url, json={"text": message}, timeout=5.0)
            except Exception as e:
                print(f"[Notification Error] Telegram webhook dispatch failed: {e}")
                success = False

        # Dispatch to Email Webhook if configured
        if email_url:
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        email_url,
                        json={"subject": f"Peachy Alert: CAPTCHA Blocked on {platform}", "message": message},
                        timeout=5.0,
                    )
            except Exception as e:
                print(f"[Notification Error] Email webhook dispatch failed: {e}")
                success = False

        return success
