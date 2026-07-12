"use client";

import * as React from "react";
import { Building2, MapPin, Users, FileText, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { toast } from "sonner";

interface OrgProfile {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  business_hours_start: string | null;
  business_hours_end: string | null;
  timezone: string | null;
}

interface Department {
  id: string;
  name: string;
  head: string | null;
  employee_count: number;
}

interface Branch {
  id: string;
  name: string;
  city: string | null;
  employee_count: number;
}

interface Policy {
  id: string;
  title: string;
  updated_at: string;
}

export default function OrganizationPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const [org, setOrg] = React.useState<OrgProfile | null>(null);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [designations, setDesignations] = React.useState<string[]>([]);
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [deptDialogOpen, setDeptDialogOpen] = React.useState(false);
  const [branchDialogOpen, setBranchDialogOpen] = React.useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      const [orgRes, deptRes, branchRes, designationRes, policyRes] = await Promise.all([
        supabase.from("organizations").select("*").single(),
        supabase.from("departments").select("*").order("name"),
        supabase.from("branches").select("*").order("name"),
        supabase.from("designations").select("title").order("title"),
        supabase.from("company_policies").select("*").order("updated_at", { ascending: false }),
      ]);
      setOrg(orgRes.data ?? null);
      setDepartments(deptRes.data ?? []);
      setBranches(branchRes.data ?? []);
      setDesignations((designationRes.data ?? []).map((d) => d.title));
      setPolicies(policyRes.data ?? []);
      setIsLoading(false);
    }
    load();
  }, [supabase]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!org) return;
    const form = new FormData(e.currentTarget);
    const updates = {
      name: String(form.get("name") ?? org.name),
      industry: String(form.get("industry") ?? ""),
      size: String(form.get("size") ?? ""),
      website: String(form.get("website") ?? ""),
      business_hours_start: String(form.get("hours_start") ?? ""),
      business_hours_end: String(form.get("hours_end") ?? ""),
      timezone: String(form.get("timezone") ?? ""),
    };
    const { error } = await supabase.from("organizations").update(updates).eq("id", org.id);
    if (error) {
      toast.error(`Could not save: ${error.message}`);
      return;
    }
    setOrg({ ...org, ...updates });
    toast.success("Company information saved");
  }

  async function handleAddDepartment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const head = String(form.get("head") ?? "").trim();
    if (!name || !org) return;

    const { data, error } = await supabase
      .from("departments")
      .insert({ org_id: org.id, name, head: head || null, employee_count: 0 })
      .select()
      .single();

    if (error) {
      toast.error(`Could not add department: ${error.message}`);
      return;
    }
    setDepartments((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setDeptDialogOpen(false);
    toast.success("Department added");
  }

  async function handleAddBranch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    if (!name || !org) return;

    const { data, error } = await supabase
      .from("branches")
      .insert({ org_id: org.id, name, city: city || null, employee_count: 0 })
      .select()
      .single();

    if (error) {
      toast.error(`Could not add branch: ${error.message}`);
      return;
    }
    setBranches((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    setBranchDialogOpen(false);
    toast.success("Branch added");
  }

  async function handleAddPolicy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title || !org) return;

    const { data, error } = await supabase
      .from("company_policies")
      .insert({ org_id: org.id, title })
      .select()
      .single();

    if (error) {
      toast.error(`Could not add policy: ${error.message}`);
      return;
    }
    setPolicies((prev) => [data, ...prev]);
    setPolicyDialogOpen(false);
    toast.success("Policy added");
  }

  if (isLoading || !org) {
    return (
      <div className="flex max-w-4xl flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius-card)]" />
        <Skeleton className="h-40 w-full rounded-[var(--radius-card)]" />
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-page-title">Organization Settings</h1>
        <p className="text-caption text-muted-foreground">
          Manage your company profile, departments, branches, and policies.
        </p>
      </div>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Basic details about your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 pb-4">
            <div className="flex size-16 items-center justify-center rounded-[var(--radius-lg)] bg-secondary text-primary">
              <Building2 className="size-7" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Logo upload not implemented in demo")}
            >
              Upload logo
            </Button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Company name</Label>
              <Input id="org-name" name="name" defaultValue={org.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-industry">Industry</Label>
              <Input id="org-industry" name="industry" defaultValue={org.industry ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-size">Company size</Label>
              <Input id="org-size" name="size" defaultValue={org.size ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-website">Website</Label>
              <Input id="org-website" name="website" defaultValue={org.website ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-hours">Business hours</Label>
              <div className="flex items-center gap-2">
                <Input id="org-hours" name="hours_start" defaultValue={org.business_hours_start ?? ""} />
                <span className="text-muted-foreground">to</span>
                <Input name="hours_end" defaultValue={org.business_hours_end ?? ""} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-tz">Timezone</Label>
              <Input id="org-tz" name="timezone" defaultValue={org.timezone ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Organize employees by department</CardDescription>
          </div>
          <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
              <Plus className="size-3.5" />
              Add Department
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a department</DialogTitle>
                <DialogDescription>Create a new department for your organization.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddDepartment} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dept-name">Name</Label>
                  <Input id="dept-name" name="name" placeholder="e.g. Marketing" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dept-head">Department head</Label>
                  <Input id="dept-head" name="head" placeholder="e.g. Jane Doe" />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Department</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="font-medium">{dept.name}</span>
                {dept.head && (
                  <span className="text-caption text-muted-foreground">Head: {dept.head}</span>
                )}
              </div>
              <Badge variant="secondary" className="self-start sm:self-auto">
                {dept.employee_count} employees
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Branches</CardTitle>
            <CardDescription>Physical office locations</CardDescription>
          </div>
          <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
              <Plus className="size-3.5" />
              Add Branch
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a branch</DialogTitle>
                <DialogDescription>Create a new office location.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddBranch} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="branch-name">Name</Label>
                  <Input id="branch-name" name="name" placeholder="e.g. Pune Office" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="branch-city">City</Label>
                  <Input id="branch-city" name="city" placeholder="e.g. Pune" />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Branch</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-wrap items-center gap-2">
                <MapPin className="size-4 text-muted-foreground" />
                <span className="font-medium">{branch.name}</span>
                {branch.city && (
                  <span className="text-caption text-muted-foreground">{branch.city}</span>
                )}
              </div>
              <Badge variant="secondary" className="self-start sm:self-auto">
                {branch.employee_count} employees
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Employee Designations</CardTitle>
          <CardDescription>Job titles available when adding employees</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {designations.map((designation) => (
            <Badge key={designation} variant="outline">
              {designation}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Company Policies</CardTitle>
            <CardDescription>Documents that guide organizational conduct</CardDescription>
          </div>
          <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1" />}>
              <Plus className="size-3.5" />
              Add Policy
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a policy</DialogTitle>
                <DialogDescription>Add a new company policy document.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPolicy} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="policy-title">Title</Label>
                  <Input id="policy-title" name="title" placeholder="e.g. Travel Policy" required />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Policy</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {policies.map((policy, i) => (
            <React.Fragment key={policy.id}>
              <div className="flex items-center justify-between py-2 text-caption">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{policy.title}</span>
                </div>
                <span className="text-muted-foreground">
                  Updated {formatRelativeTime(policy.updated_at)}
                </span>
              </div>
              {i < policies.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
