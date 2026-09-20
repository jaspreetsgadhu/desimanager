"use client";

import * as React from "react";
import { CalendarDays, HeartHandshake, Gift, Scale, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "@/components/chat-panel";
import { ChatInputBar } from "@/components/chat-input-bar";
import { LeaveApprovals } from "@/components/leave-approvals";
import { LeaveRequestForm } from "@/components/leave-request-form";
import { MyLeaveRequests } from "@/components/my-leave-requests";
import { useAuth } from "@/lib/auth-context";
import { useRagChat } from "@/hooks/use-rag-chat";
import { HR_QUICK_INFO, HR_FAQS, COMPANY_RULES, EMPLOYEE_BENEFITS } from "@/lib/mock-data";

const HR_SUGGESTED_PROMPTS = [
  "How many leave days do I have left?",
  "When is the next public holiday?",
  "What health benefits do I have?",
];

export default function HrPage() {
  const { user } = useAuth();
  const chat = useRagChat({ agent: "hr", assistantName: "HR Manager AI" });
  const [leaveRefreshKey, setLeaveRefreshKey] = React.useState(0);
  const canApprove = user?.role === "manager" || user?.role === "admin" || user?.role === "super_admin";

  function refreshLeave() {
    setLeaveRefreshKey((k) => k + 1);
  }

  if (chat.hasConversation) {
    return (
      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <ChatPanel
          messages={chat.messages}
          streamingText={chat.streamingText}
          userName={user?.name ?? "You"}
          assistantName="HR Manager AI"
          input={chat.input}
          onInputChange={chat.setInput}
          onSubmit={chat.handleSubmit}
          onRegenerate={chat.regenerateLast}
          placeholder="Ask HR Manager AI about leave, attendance, benefits..."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-page-title">HR</h1>
        <p className="text-caption text-muted-foreground">
          Leave, attendance, holidays, and HR policies — answered instantly.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leave" className="gap-1.5">
            <ClipboardList className="size-4" />
            Leave
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-soft-sm">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="size-4" />
              <span className="text-small-label font-medium">Leave Balance</span>
            </div>
            <span className="text-page-title">
              {HR_QUICK_INFO.leaveBalance}
              <span className="text-caption text-muted-foreground"> / {HR_QUICK_INFO.leaveTotal} days</span>
            </span>
            <Progress value={(HR_QUICK_INFO.leaveBalance / HR_QUICK_INFO.leaveTotal) * 100} />
          </CardContent>
        </Card>
        <Card className="shadow-soft-sm">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gift className="size-4" />
              <span className="text-small-label font-medium">Next Holiday</span>
            </div>
            <span className="text-card-title">{HR_QUICK_INFO.nextHoliday.name}</span>
            <span className="text-caption text-muted-foreground">{HR_QUICK_INFO.nextHoliday.date}</span>
          </CardContent>
        </Card>
        <Card className="shadow-soft-sm">
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HeartHandshake className="size-4" />
              <span className="text-small-label font-medium">Benefits Enrolled</span>
            </div>
            <span className="text-page-title">{HR_QUICK_INFO.benefitsEnrolled}</span>
            <span className="text-caption text-muted-foreground">of {EMPLOYEE_BENEFITS.length} available</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="shadow-soft-sm">
          <CardHeader>
            <CardTitle>Employee Benefits</CardTitle>
            <CardDescription>What you&apos;re covered for</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {EMPLOYEE_BENEFITS.map((benefit) => (
              <div key={benefit.id} className="rounded-[var(--radius-lg)] border border-border px-3 py-2.5">
                <p className="font-medium">{benefit.title}</p>
                <p className="text-caption text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="size-4" />
              Company Rules
            </CardTitle>
            <CardDescription>Key policies every employee should know</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-caption">
              {COMPANY_RULES.map((rule) => (
                <li key={rule} className="flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  {rule}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>HR FAQs</CardTitle>
          <CardDescription>Common questions answered</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {HR_FAQS.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-soft-sm">
        <CardHeader>
          <CardTitle>Ask HR Manager AI</CardTitle>
          <CardDescription>Get instant answers about leave, attendance, and benefits</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {HR_SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => chat.sendMessage(prompt)}
                className="rounded-full border border-border px-3 py-1.5 text-caption text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
          <ChatInputBar
            value={chat.input}
            onChange={chat.setInput}
            onSubmit={chat.handleSubmit}
            placeholder="Ask HR Manager AI about leave, attendance, benefits..."
          />
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="leave" className="flex flex-col gap-6">
          {canApprove && <LeaveApprovals refreshKey={leaveRefreshKey} onReviewed={refreshLeave} />}

          <Card className="shadow-soft-sm">
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
              <CardDescription>Submit a leave request for your manager to review</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveRequestForm onSubmitted={refreshLeave} />
            </CardContent>
          </Card>

          <Card className="shadow-soft-sm">
            <CardHeader>
              <CardTitle>My Leave Requests</CardTitle>
              <CardDescription>Your leave request history</CardDescription>
            </CardHeader>
            <CardContent>
              <MyLeaveRequests refreshKey={leaveRefreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
