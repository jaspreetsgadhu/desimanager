"use client";

import * as React from "react";
import { Search, Plus, MoreHorizontal, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS } from "@/types/user";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  invited: "bg-info/10 text-info",
  inactive: "bg-muted text-muted-foreground",
};

interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  department: string | null;
  designation: string | null;
  reportingManager: string | null;
  role: keyof typeof ROLE_LABELS;
  status: "active" | "invited" | "inactive";
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EmployeesPage() {
  const supabase = React.useMemo(() => createClient(), []);
  const [employees, setEmployees] = React.useState<EmployeeRow[]>([]);
  const [departmentOptions, setDepartmentOptions] = React.useState<string[]>([]);
  const [designationOptions, setDesignationOptions] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("all");
  const [status, setStatus] = React.useState("all");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const loadEmployees = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, department, designation, reporting_manager, role, status")
      .order("name");

    if (error) {
      toast.error("Could not load employees");
      return;
    }

    setEmployees(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        department: row.department,
        designation: row.designation,
        reportingManager: row.reporting_manager,
        role: row.role,
        status: row.status,
      }))
    );
  }, [supabase]);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      await loadEmployees();
      const [{ data: depts }, { data: designations }] = await Promise.all([
        supabase.from("departments").select("name").order("name"),
        supabase.from("designations").select("title").order("title"),
      ]);
      setDepartmentOptions((depts ?? []).map((d) => d.name));
      setDesignationOptions((designations ?? []).map((d) => d.title));
      setIsLoading(false);
    }
    load();
  }, [loadEmployees, supabase]);

  const filtered = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department === "all" || employee.department === department;
    const matchesStatus = status === "all" || employee.status === status;
    return matchesSearch && matchesDept && matchesStatus;
  });

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setDialogOpen(false);
    toast.info(
      "Creating new logins requires an admin API we haven't wired up yet — this stays demo-only for now."
    );
  }

  async function handleDeactivate(employee: EmployeeRow) {
    const { error } = await supabase
      .from("profiles")
      .update({ status: "inactive" })
      .eq("id", employee.id);

    if (error) {
      toast.error(`Could not deactivate: ${error.message}`);
      return;
    }
    toast.success(`${employee.name} deactivated`);
    setEmployees((prev) =>
      prev.map((e) => (e.id === employee.id ? { ...e, status: "inactive" } : e))
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">Employees</h1>
          <p className="text-caption text-muted-foreground">
            Manage your organization&apos;s workforce
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="gap-1.5" />}>
            <UserPlus className="size-4" />
            Invite Employee
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a new employee</DialogTitle>
              <DialogDescription>
                They&apos;ll receive an email invitation to join your workspace.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-name">Full name</Label>
                <Input id="invite-name" placeholder="Jane Doe" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" placeholder="jane@company.com" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite-dept">Department</Label>
                  <Select defaultValue={departmentOptions[0]}>
                    <SelectTrigger id="invite-dept" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite-designation">Designation</Label>
                  <Select defaultValue={designationOptions[0]}>
                    <SelectTrigger id="invite-designation" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {designationOptions.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Send invite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={(v) => v && setDepartment(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departmentOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => v && setStatus(v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-[var(--radius-lg)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No employees match your filters"
          description="Try adjusting your search or filters, or invite a new employee."
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Reporting Manager</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-small-label">
                          {initials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{employee.name}</span>
                        <span className="text-small-label text-muted-foreground">
                          {employee.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.reportingManager ?? "—"}</TableCell>
                  <TableCell>{ROLE_LABELS[employee.role]}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[employee.status]} variant="secondary">
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info("Edit not implemented in demo")}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={employee.status === "inactive"}
                          onClick={() => handleDeactivate(employee)}
                        >
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
