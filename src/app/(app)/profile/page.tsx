"use client";

import { Mail, Building2, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABELS } from "@/types/user";
import { toast } from "sonner";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-page-title">User Profile</h1>

      <Card className="shadow-soft-sm">
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-card-title">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-card-title font-bold">{user.name}</span>
            <div className="flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="size-3.5" /> {user.email}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="size-3.5" /> {user.department}
              </span>
            </div>
            <Badge variant="secondary" className="mt-1 w-fit gap-1">
              <Shield className="size-3" />
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Profile saved (demo only)");
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" defaultValue={user.email} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="department">Department</Label>
              <Input id="department" defaultValue={user.department} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" defaultValue={ROLE_LABELS[user.role]} disabled />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
