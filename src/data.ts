import { Lead, Appointment, CommunicationLog, SalesStat, User } from "./types";

export const PRESET_USERS: User[] = [
  {
    id: "user-super-admin",
    name: "Rajan Srivastava",
    email: "rajan.srivastava@eliteproinfra.com",
    role: "super_admin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    department: "Executive Board",
    password: "superadmin123"
  },
  {
    id: "user-admin",
    name: "Ananya Sharma",
    email: "ananya.sharma@eliteproinfra.com",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    department: "Operations Management",
    password: "admin123"
  },
  {
    id: "user-sales",
    name: "Rakesh Verma",
    email: "rakesh.verma@eliteproinfra.com",
    role: "sales_team",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Infrastructure Advisory",
    password: "sales123"
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Vikram Malhotra",
    company: "Apex Logistics Tech",
    position: "VP of Global Expansion",
    email: "v.malhotra@apexlog.io",
    phone: "+91 98110 54122",
    status: "Interested",
    source: "Website",
    temperature: "Hot",
    budget: "₹37.5 Cr",
    notes: "Requires 120,000 sq ft zero-carbon footprint storage near NH-48 with automated conveyor support and multi-dock access. Key decision maker. High intent.",
    dateCreated: "2026-05-10",
    dateUpdated: "2026-05-24",
    lastCommunication: "2026-05-24",
    location: "Gurugram Infrastructure Corridor, India",
    assignedAgent: "Rajan Srivastava",
    score: 92
  },
  {
    id: "lead-2",
    name: "Sarah Jenkins",
    company: "Vortex Data Solutions",
    position: "Chief Infrastructure Officer",
    email: "jenkins@vortexdata.net",
    phone: "+1 415 555 0192",
    status: "Follow Up",
    source: "Google Ad",
    temperature: "Hot",
    budget: "₹100 Cr",
    notes: "Seeking modular land development with 30MW redundancy and solar grid-tie options. Elite Pro Infra is competing with 2 other regional partners.",
    dateCreated: "2026-05-25",
    dateUpdated: "2026-05-25",
    lastCommunication: "2026-05-25",
    location: "Noida Sector 144 Tech Park, India",
    assignedAgent: "Rajan Srivastava",
    score: 85
  },
  {
    id: "lead-3",
    name: "Akira Tanaka",
    company: "Heian Tech Real Estate",
    position: "Senior Real Estate Analyst",
    email: "tanaka@heian-dev.co.jp",
    phone: "+81 3 5555 0143",
    status: "Site Visit",
    source: "Reference",
    temperature: "Warm",
    budget: "₹71 Cr",
    notes: "Deal closed successfully on May 18. Architect plans sent for custom interior facade styling. Elite Pro Infra designed state-of-the-art earthquake compliance structural elements.",
    dateCreated: "2026-04-12",
    dateUpdated: "2026-05-18",
    lastCommunication: "2026-05-18",
    location: "BKC Commercial Hub, Mumbai",
    assignedAgent: "Rakesh Verma",
    score: 100
  },
  {
    id: "lead-4",
    name: "Rajesh Singhania",
    company: "Singhania Premium Retail",
    position: "Managing Director",
    email: "rajesh@singhaniagroup.in",
    phone: "+91 99991 23456",
    status: "Detailed Share",
    source: "Meta Ad",
    temperature: "Warm",
    budget: "₹25 Cr",
    notes: "Interested in premium glass facade architectural shell in South Delhi. Requested layout brochures. Setting up physical site alignment visit.",
    dateCreated: "2026-05-15",
    dateUpdated: "2026-05-22",
    lastCommunication: "2026-05-22",
    location: "Saket Commercial Belt, New Delhi",
    assignedAgent: "Ananya Sharma",
    score: 68
  },
  {
    id: "lead-5",
    name: "Elena Rostova",
    company: "Nordic Smart Logistics",
    position: "Procurement Lead",
    email: "erostova@nordicsmart.com",
    phone: "+46 8 123 4567",
    status: "Not Interested",
    source: "Cold Call",
    temperature: "Dead",
    budget: "₹50 Cr",
    notes: "Withdrew bid due to corporate restructuring in Europe. Will keep in touch for next fiscal quarter. Flagged as warm retargeting lead in October.",
    dateCreated: "2026-03-01",
    dateUpdated: "2026-05-05",
    lastCommunication: "2026-05-05",
    location: "Port Area, Chennai, India",
    assignedAgent: "Ananya Sharma",
    score: 15
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "app-1",
    leadId: "lead-1",
    leadName: "Vikram Malhotra",
    title: "Site Tour & Eco-Footprint Proof Concept",
    date: "2026-05-26", // Tomorrow relative to Current Time 2026-05-25
    time: "10:30",
    type: "site_visit",
    notes: "Rajan to meet Vikram near toll booth NH-48. Show layout boundaries and verify 30-meter high structural clearance.",
    isCompleted: false,
    reminderActive: true
  },
  {
    id: "app-2",
    leadId: "lead-2",
    leadName: "Sarah Jenkins",
    title: "Vortex red line power assessment",
    date: "2026-05-26",
    time: "14:00",
    type: "meeting",
    notes: "Discuss 30MW energy reliability grid mapping with engineers over Teams conference call.",
    isCompleted: false,
    reminderActive: true
  },
  {
    id: "app-3",
    leadId: "lead-4",
    leadName: "Rajesh Singhania",
    title: "Saket Layout presentation briefing",
    date: "2026-05-27",
    time: "11:00",
    type: "call",
    notes: "Review structural PDF feedback and finalize floor index pricing estimates.",
    isCompleted: false,
    reminderActive: false
  },
  {
    id: "app-4",
    leadId: "lead-3",
    leadName: "Akira Tanaka",
    title: "Post-close architect onboarding",
    date: "2026-05-28",
    time: "09:30",
    type: "meeting",
    notes: "Formal handover to structural delivery team at Elite Pro headquarters.",
    isCompleted: false,
    reminderActive: true
  }
];

export const INITIAL_COMMUNICATION_LOGS: CommunicationLog[] = [
  {
    id: "comm-1",
    leadId: "lead-1",
    date: "2026-05-24",
    type: "meeting",
    content: "Met with Vikram in corporate office corridor. He loved our sustainable materials catalogue and green roof cooling layout.",
    sender: "Rajan Srivastava"
  },
  {
    id: "comm-2",
    leadId: "lead-1",
    date: "2026-05-20",
    type: "call",
    content: "Introductory discovery discussion. Aligned Apex Logistics Tech with our green belt warehousing initiative. Vikram confirmed high priority.",
    sender: "Rajan Srivastava"
  },
  {
    id: "comm-3",
    leadId: "lead-4",
    date: "2026-05-22",
    type: "email",
    content: "Sent South Delhi catalog and commercial retail pricing matrix. Rajesh acknowledged receipt.",
    sender: "Ananya Sharma"
  }
];

export const SALES_METRICS_HISTORY: SalesStat[] = [
  { month: "Jan", leadsAdded: 24, dealsWon: 2, revenue: 38.4, target: 40.0 },
  { month: "Feb", leadsAdded: 28, dealsWon: 3, revenue: 57.6, target: 40.0 },
  { month: "Mar", leadsAdded: 35, dealsWon: 4, revenue: 92.0, target: 64.0 },
  { month: "Apr", leadsAdded: 41, dealsWon: 5, revenue: 113.6, target: 80.0 },
  { month: "May", leadsAdded: 48, dealsWon: 6, revenue: 158.4, target: 96.0 },
];
