"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Unlink, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface TelegramSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TelegramSettingsDialog({ open, onOpenChange }: TelegramSettingsDialogProps) {
  const [loading, setLoading] = useState(true);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!open) return;

    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (data.success) {
          setTelegramLinked(data.data.telegramLinked);
          setUserId(data.data.id);
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [open]);

  async function handleUnlink() {
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlinkTelegram: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramLinked(false);
        toast.success("Telegram unlinked");
      }
    } catch {
      toast.error("Failed to unlink Telegram");
    }
  }

  async function handleTestMessage() {
    try {
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "🧪 Test message from Orbit!" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Test message sent!");
      } else {
        toast.error(data.error || "Failed to send");
      }
    } catch {
      toast.error("Failed to send test message");
    }
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "OrbitLifeBot";
  const deepLink = `https://t.me/${botUsername}?start=${userId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-5" />
            Telegram Notifications
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : telegramLinked ? (
          <div className="space-y-4">
            <div className="bg-habit-green/20 rounded-xl p-4">
              <p className="text-sm font-medium text-green-700">Telegram is linked</p>
              <p className="text-xs text-muted-foreground mt-1">
                You&apos;ll receive habit reminders and daily summaries via Telegram.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleTestMessage}>
                <Send className="size-4 mr-2" />
                Send Test
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleUnlink}>
                <Unlink className="size-4 mr-2" />
                Unlink
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link your Telegram account to receive habit reminders and daily summaries.
            </p>
            <ol className="text-sm text-muted-foreground list-decimal pl-4 space-y-1">
              <li>Click the button below to open Telegram</li>
              <li>Press &quot;Start&quot; in the bot chat</li>
              <li>Come back here — it should link automatically</li>
            </ol>
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="size-4" />
              Open Telegram Bot
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
