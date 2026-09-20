"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ComplaintCategory } from "@/lib/supabase/types";

const CATEGORY_OPTIONS: { value: ComplaintCategory; label: string }[] = [
  { value: "product_defect", label: "Product defect" },
  { value: "delivery", label: "Delivery issue" },
  { value: "billing", label: "Billing issue" },
  { value: "warranty", label: "Warranty claim" },
  { value: "other", label: "Other" },
];

interface ComplaintFormProps {
  initialName: string;
  initialContact: string;
  description: string;
  onDescriptionChange: (value: string) => void;
}

export function ComplaintForm({
  initialName,
  initialContact,
  description,
  onDescriptionChange,
}: ComplaintFormProps) {
  const router = useRouter();
  const [name, setName] = React.useState(initialName);
  const [contact, setContact] = React.useState(initialContact);
  const [category, setCategory] = React.useState<ComplaintCategory>("other");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !description.trim()) {
      toast.error("Please fill in your name, contact, and a description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_contact: contact.trim(),
          category,
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        toast.error(body?.error ?? "Could not submit your complaint. Please try again.");
        return;
      }

      toast.success("Complaint submitted — our team will follow up.");
      router.push("/portal");
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="complaint-name">Name</Label>
          <Input id="complaint-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="complaint-contact">Email or phone</Label>
          <Input
            id="complaint-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="complaint-category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => value && setCategory(value as ComplaintCategory)}
        >
          <SelectTrigger id="complaint-category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="complaint-description">What happened?</Label>
        <Textarea
          id="complaint-description"
          rows={5}
          placeholder="Describe the issue you're experiencing..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Complaint"}
      </Button>
    </form>
  );
}
