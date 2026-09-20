export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ComplaintCategory } from "@/lib/supabase/types";

const VALID_CATEGORIES: ComplaintCategory[] = [
  "product_defect",
  "delivery",
  "billing",
  "warranty",
  "other",
];

// Unauthenticated customer complaint submission. The complaints table has no
// insert policy for anon/authenticated roles — this is the only write path,
// using the service-role client to bypass RLS after server-side validation.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const customerName = typeof body?.customer_name === "string" ? body.customer_name.trim() : "";
  const customerContact =
    typeof body?.customer_contact === "string" ? body.customer_contact.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const category: ComplaintCategory = VALID_CATEGORIES.includes(body?.category)
    ? body.category
    : "other";

  if (!customerName || !customerContact || !description) {
    return NextResponse.json(
      { error: "Name, contact, and description are all required." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!org) {
    console.error("Org lookup failed:", orgError);
    const msg = orgError?.message ?? "No organization configured";
    return NextResponse.json({ error: `Org lookup failed: ${msg}` }, { status: 500 });
  }

  const { data, error } = await admin
    .from("complaints")
    .insert({
      org_id: org.id,
      customer_name: customerName,
      customer_contact: customerContact,
      category,
      description,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Complaint insert failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
