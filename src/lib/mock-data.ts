import type { User } from "@/types/user";

export const DEMO_USERS: User[] = [
  {
    id: "u-1",
    name: "Aarav Shah",
    email: "aarav@desimanager.ai",
    role: "super_admin",
    department: "Executive",
  },
  {
    id: "u-2",
    name: "Priya Nair",
    email: "priya@desimanager.ai",
    role: "admin",
    department: "Operations",
  },
  {
    id: "u-3",
    name: "Rohan Mehta",
    email: "rohan@desimanager.ai",
    role: "manager",
    department: "Sales",
  },
  {
    id: "u-4",
    name: "Simran Kaur",
    email: "simran@desimanager.ai",
    role: "employee",
    department: "Customer Support",
  },
];

export const DASHBOARD_STATS = [
  { label: "Employees", value: "128", change: "+4 this month", icon: "Users" },
  { label: "Documents", value: "342", change: "+12 this week", icon: "FileText" },
  { label: "Questions Today", value: "87", change: "+18% vs yesterday", icon: "MessageCircle" },
  { label: "AI Adoption", value: "76%", change: "+5% this month", icon: "Sparkles" },
] as const;

export const RECENT_ACTIVITY = [
  { id: "a-1", actor: "Priya Nair", action: "uploaded", target: "Leave Policy 2026.pdf", time: "10 min ago" },
  { id: "a-2", actor: "Rohan Mehta", action: "asked Buddy AI", target: "What is our refund policy?", time: "32 min ago" },
  { id: "a-3", actor: "Simran Kaur", action: "completed training", target: "Product Onboarding 101", time: "1 hr ago" },
  { id: "a-4", actor: "System", action: "flagged a knowledge gap in", target: "Customer Care", time: "3 hrs ago" },
] as const;

export const TRAINING_PROGRESS = [
  { id: "t-1", title: "Product Onboarding 101", progress: 82 },
  { id: "t-2", title: "HR Compliance Basics", progress: 64 },
  { id: "t-3", title: "Customer Care Playbook", progress: 41 },
] as const;

export const POPULAR_DOCUMENTS = [
  { id: "d-1", title: "Employee Handbook.pdf", views: 214, category: "HR" },
  { id: "d-2", title: "Sales SOP.docx", views: 176, category: "Sales" },
  { id: "d-3", title: "Refund Policy.pdf", views: 152, category: "Customer Support" },
  { id: "d-4", title: "Product Manual v3.pdf", views: 98, category: "Products" },
] as const;

export const ORGANIZATION_PROFILE = {
  name: "Desi Manager Pvt. Ltd.",
  industry: "Retail & E-commerce",
  size: "100-250 employees",
  website: "www.desimanager.ai",
  businessHoursStart: "09:00",
  businessHoursEnd: "18:00",
  timezone: "Asia/Kolkata (IST)",
};

export const DEPARTMENTS = [
  { id: "dept-1", name: "Executive", head: "Aarav Shah", employeeCount: 4 },
  { id: "dept-2", name: "Operations", head: "Priya Nair", employeeCount: 22 },
  { id: "dept-3", name: "Sales", head: "Rohan Mehta", employeeCount: 34 },
  { id: "dept-4", name: "Customer Support", head: "Simran Kaur", employeeCount: 28 },
  { id: "dept-5", name: "HR", head: "Neha Kapoor", employeeCount: 8 },
  { id: "dept-6", name: "Products", head: "Vikram Singh", employeeCount: 12 },
] as const;

export const BRANCHES = [
  { id: "branch-1", name: "Mumbai HQ", city: "Mumbai", employeeCount: 64 },
  { id: "branch-2", name: "Delhi Office", city: "Delhi", employeeCount: 38 },
  { id: "branch-3", name: "Bangalore Office", city: "Bangalore", employeeCount: 26 },
] as const;

export const DESIGNATIONS = [
  "Software Engineer",
  "Sales Executive",
  "Customer Support Associate",
  "HR Manager",
  "Operations Lead",
  "Product Manager",
] as const;

export const POLICIES = [
  { id: "pol-1", title: "Leave Policy 2026", updated: "2 weeks ago" },
  { id: "pol-2", title: "Code of Conduct", updated: "1 month ago" },
  { id: "pol-3", title: "Remote Work Policy", updated: "3 months ago" },
] as const;

export type EmployeeStatus = "active" | "invited" | "inactive";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  reportingManager: string;
  role: import("@/types/user").Role;
  status: EmployeeStatus;
}

export const EMPLOYEES: Employee[] = [
  { id: "e-1", name: "Aarav Shah", email: "aarav@desimanager.ai", department: "Executive", designation: "Product Manager", reportingManager: "—", role: "super_admin", status: "active" },
  { id: "e-2", name: "Priya Nair", email: "priya@desimanager.ai", department: "Operations", designation: "Operations Lead", reportingManager: "Aarav Shah", role: "admin", status: "active" },
  { id: "e-3", name: "Rohan Mehta", email: "rohan@desimanager.ai", department: "Sales", designation: "Sales Executive", reportingManager: "Priya Nair", role: "manager", status: "active" },
  { id: "e-4", name: "Simran Kaur", email: "simran@desimanager.ai", department: "Customer Support", designation: "Customer Support Associate", reportingManager: "Priya Nair", role: "employee", status: "active" },
  { id: "e-5", name: "Neha Kapoor", email: "neha@desimanager.ai", department: "HR", designation: "HR Manager", reportingManager: "Aarav Shah", role: "manager", status: "active" },
  { id: "e-6", name: "Vikram Singh", email: "vikram@desimanager.ai", department: "Products", designation: "Product Manager", reportingManager: "Aarav Shah", role: "manager", status: "active" },
  { id: "e-7", name: "Ananya Verma", email: "ananya@desimanager.ai", department: "Sales", designation: "Sales Executive", reportingManager: "Rohan Mehta", role: "employee", status: "invited" },
  { id: "e-8", name: "Karan Malhotra", email: "karan@desimanager.ai", department: "Customer Support", designation: "Customer Support Associate", reportingManager: "Simran Kaur", role: "employee", status: "inactive" },
];

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: string;
  type: "PDF" | "DOC" | "Video" | "URL";
  size: string;
  uploadedBy: string;
  updated: string;
}

export const KNOWLEDGE_CATEGORIES = [
  "All",
  "HR",
  "Sales",
  "Operations",
  "Training",
  "Products",
  "Customer Support",
] as const;

export const KNOWLEDGE_DOCUMENTS: KnowledgeDocument[] = [
  { id: "kd-1", title: "Employee Handbook.pdf", category: "HR", type: "PDF", size: "2.4 MB", uploadedBy: "Neha Kapoor", updated: "2 days ago" },
  { id: "kd-2", title: "Leave Policy 2026.pdf", category: "HR", type: "PDF", size: "1.1 MB", uploadedBy: "Priya Nair", updated: "10 min ago" },
  { id: "kd-3", title: "Sales SOP.docx", category: "Sales", type: "DOC", size: "860 KB", uploadedBy: "Rohan Mehta", updated: "5 days ago" },
  { id: "kd-4", title: "Refund Policy.pdf", category: "Customer Support", type: "PDF", size: "540 KB", uploadedBy: "Simran Kaur", updated: "1 week ago" },
  { id: "kd-5", title: "Product Manual v3.pdf", category: "Products", type: "PDF", size: "4.7 MB", uploadedBy: "Vikram Singh", updated: "2 weeks ago" },
  { id: "kd-6", title: "Onboarding Walkthrough.mp4", category: "Training", type: "Video", size: "58 MB", uploadedBy: "Neha Kapoor", updated: "3 weeks ago" },
  { id: "kd-7", title: "Company Website FAQ", category: "Operations", type: "URL", size: "—", uploadedBy: "Aarav Shah", updated: "1 month ago" },
];

export const HR_QUICK_INFO = {
  leaveBalance: 12,
  leaveTotal: 18,
  nextHoliday: { name: "Republic Day", date: "Jan 26, 2027" },
  benefitsEnrolled: 3,
};

export const HR_FAQS = [
  { id: "faq-1", question: "How many paid leave days do I get per year?", answer: "18 paid leave days per year, plus public holidays observed at your branch." },
  { id: "faq-2", question: "How do I apply for leave?", answer: "Submit a leave request at least 3 days in advance through your reporting manager in the HR portal." },
  { id: "faq-3", question: "What health benefits are available?", answer: "All full-time employees get health insurance, an annual wellness allowance, and mental health support sessions." },
  { id: "faq-4", question: "What is the notice period for resignation?", answer: "The standard notice period is 30 days, or as specified in your offer letter." },
];

export const COMPANY_RULES = [
  "Business hours are 9:00 AM to 6:00 PM, Monday to Friday.",
  "Remote work is allowed up to 2 days per week with manager approval.",
  "All expense claims must be submitted within 30 days with receipts.",
  "Respectful communication is expected across all official channels.",
];

export const EMPLOYEE_BENEFITS = [
  { id: "ben-1", title: "Health Insurance", description: "Covers employee + family, up to ₹5L/year" },
  { id: "ben-2", title: "Wellness Allowance", description: "₹10,000/year for gym, therapy, or wellness apps" },
  { id: "ben-3", title: "Learning Stipend", description: "₹15,000/year for courses and certifications" },
];

export interface TrainingModule {
  id: string;
  title: string;
  category: string;
  progress: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  certified: boolean;
}

export const TRAINING_MODULES: TrainingModule[] = [
  { id: "tm-1", title: "Product Onboarding 101", category: "Products", progress: 82, lessonsCompleted: 9, lessonsTotal: 11, certified: false },
  { id: "tm-2", title: "HR Compliance Basics", category: "HR", progress: 64, lessonsCompleted: 7, lessonsTotal: 11, certified: false },
  { id: "tm-3", title: "Customer Care Playbook", category: "Customer Support", progress: 41, lessonsCompleted: 4, lessonsTotal: 10, certified: false },
  { id: "tm-4", title: "Sales Fundamentals", category: "Sales", progress: 100, lessonsCompleted: 8, lessonsTotal: 8, certified: true },
  { id: "tm-5", title: "Workplace Safety", category: "Operations", progress: 100, lessonsCompleted: 6, lessonsTotal: 6, certified: true },
];

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: "q-1",
    question: "How many paid leave days does an employee get per year?",
    options: ["10", "18", "24", "30"],
    correctIndex: 1,
  },
  {
    id: "q-2",
    question: "Within how many days should a customer refund be processed?",
    options: ["1-2 business days", "5-7 business days", "14 business days", "It's not processed"],
    correctIndex: 1,
  },
  {
    id: "q-3",
    question: "How many days remote work is allowed per week (with approval)?",
    options: ["0", "1", "2", "5"],
    correctIndex: 2,
  },
];

export type TicketStatus = "open" | "pending" | "resolved";
export type TicketPriority = "low" | "medium" | "high";

export interface SupportTicket {
  id: string;
  subject: string;
  customer: string;
  status: TicketStatus;
  priority: TicketPriority;
  updated: string;
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  { id: "TCK-4521", subject: "Refund delay for order #8823", customer: "Meera Joshi", status: "open", priority: "high", updated: "2 days ago" },
  { id: "TCK-4498", subject: "Product not working as expected", customer: "Arjun Rao", status: "pending", priority: "medium", updated: "6 hrs ago" },
  { id: "TCK-4487", subject: "Question about warranty", customer: "Divya Menon", status: "resolved", priority: "low", updated: "1 day ago" },
  { id: "TCK-4475", subject: "Billing discrepancy", customer: "Kabir Chawla", status: "open", priority: "high", updated: "4 hrs ago" },
];

export const WHATSAPP_CONTACT = {
  name: "Meera Joshi",
  phone: "+91 98765 43210",
};

export const WHATSAPP_SEED_MESSAGES: ChatMessage[] = [
  { id: "wa-1", role: "user", content: "Hi, I ordered a product last week and want to return it. How do I do that?" },
  {
    id: "wa-2",
    role: "assistant",
    content: "Hi! You can return any item within 30 days of delivery. Just share your order number and I'll start the return for you.",
    citations: [{ title: "Refund Policy.pdf", category: "Customer Support" }],
    agent: "Customer Care AI",
  },
];

export const REPORT_SUMMARY = {
  daily: "Today, Buddy AI answered 87 questions across 42 employees. Customer Support asked the most questions (28), followed by Sales (19). 2 questions went unanswered due to missing knowledge base coverage.",
  weekly: "This week, AI usage grew 18% with 412 total questions. HR and Customer Support remain the most active departments. Knowledge Base grew by 12 new documents. AI adoption is now at 76% of active employees.",
};

export const MOST_ASKED_QUESTIONS = [
  { id: "maq-1", question: "What is our leave policy?", count: 34, department: "HR" },
  { id: "maq-2", question: "How do I raise a customer refund?", count: 28, department: "Customer Support" },
  { id: "maq-3", question: "What's our remote work policy?", count: 21, department: "HR" },
  { id: "maq-4", question: "Where can I find the Product Manual?", count: 17, department: "Products" },
  { id: "maq-5", question: "What is the escalation process for tickets?", count: 12, department: "Customer Support" },
];

export const KNOWLEDGE_GAPS = [
  { id: "gap-1", topic: "Warranty claims for international orders", department: "Customer Support", occurrences: 9 },
  { id: "gap-2", topic: "Parental leave policy details", department: "HR", occurrences: 6 },
  { id: "gap-3", topic: "Bulk order discount structure", department: "Sales", occurrences: 4 },
];

export const DEPARTMENT_ACTIVITY = [
  { department: "Customer Support", questions: 142, activeUsers: 26 },
  { department: "HR", questions: 98, activeUsers: 8 },
  { department: "Sales", questions: 87, activeUsers: 34 },
  { department: "Operations", questions: 52, activeUsers: 22 },
  { department: "Products", questions: 33, activeUsers: 12 },
];

export const ANALYTICS_KPIS = [
  { label: "Active Users", value: "98", change: "+6% this week", icon: "Users" },
  { label: "Documents Uploaded", value: "342", change: "+12 this week", icon: "FileText" },
  { label: "AI Questions", value: "412", change: "+18% this week", icon: "MessageCircle" },
  { label: "AI Adoption", value: "76%", change: "+5% this month", icon: "Sparkles" },
] as const;

export const KNOWLEDGE_COVERAGE = [
  { category: "HR", coverage: 92 },
  { category: "Sales", coverage: 78 },
  { category: "Customer Support", coverage: 65 },
  { category: "Products", coverage: 88 },
  { category: "Training", coverage: 54 },
];

export interface ChatCitation {
  title: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  agent?: string;
}

