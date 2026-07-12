"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { useVoice, VOICE_LANGUAGE_LABELS, type VoiceLanguage } from "@/lib/voice-context";
import { DEMO_USERS } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/types/user";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, switchUser } = useAuth();
  const { language, setLanguage } = useVoice();
  const [mounted, setMounted] = React.useState(false);
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifyPush, setNotifyPush] = React.useState(true);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-page-title">Settings</h1>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Desi Manager looks on your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-[var(--radius-lg)] border px-3 py-3 text-caption transition-colors ${
                  mounted && theme === option.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <option.icon className="size-4" />
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="notify-email">Email notifications</Label>
              <span className="text-caption text-muted-foreground">
                Get a daily digest of activity
              </span>
            </div>
            <Switch id="notify-email" checked={notifyEmail} onCheckedChange={setNotifyEmail} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="notify-push">Push notifications</Label>
              <span className="text-caption text-muted-foreground">
                Real-time alerts in the browser
              </span>
            </div>
            <Switch id="notify-push" checked={notifyPush} onCheckedChange={setNotifyPush} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Voice Language</CardTitle>
          <CardDescription>
            Language used for voice input and read-aloud responses across AI chats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={language}
            onValueChange={(value) => value && setLanguage(value as VoiceLanguage)}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VOICE_LANGUAGE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Demo: Switch Role</CardTitle>
          <CardDescription>
            Preview the app as a different role (Super Admin, Admin, Manager, Employee)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={user?.email}
            onValueChange={async (email) => {
              if (!email) return;
              await switchUser(email);
              toast.success("Switched role for demo purposes");
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a demo user">
                {(value: string) => {
                  const selected = DEMO_USERS.find((demoUser) => demoUser.email === value);
                  return selected ? `${selected.name} — ${ROLE_LABELS[selected.role]}` : "Select a demo user";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {DEMO_USERS.map((demoUser) => (
                <SelectItem key={demoUser.id} value={demoUser.email}>
                  {demoUser.name} — {ROLE_LABELS[demoUser.role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
