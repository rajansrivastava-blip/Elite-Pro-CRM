import { Lead, Appointment, CommunicationLog, SalesStat, User } from "./types";

export const PRESET_USERS: User[] = [
  {
    id: "user-super-admin",
    name: "Viren Mehta",
    email: "viren@eliteproinfra.com",
    role: "super_admin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    department: "Executive Board",
    password: "superadmin123"
  },
  {
    id: "user-admin",
    name: "Admin",
    email: "rajan.srivastava@eliteproinfra.com",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    department: "Operations Management",
    password: "admin123"
  },
  
  // -- TEAM 1: Ricky Matharu --
  {
    id: "tl-ricky",
    name: "Ricky Matharu",
    email: "ricky.matharu@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-kaushal",
    name: "Kaushal Midha",
    email: "kaushal.midha@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-kunal",
    name: "Kunal Wadhwa",
    email: "kunal.wadhwa@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-khushboo",
    name: "Khushboo Kapoor",
    email: "khushboo.kapoor@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-rohit",
    name: "Rohit Yadav",
    email: "rohit.yadav@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-mahesh",
    name: "Mahesh Kumar",
    email: "mahesh.kumar@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-yogesh-singh",
    name: "Yogesh Kumar Singh",
    email: "yogesh.singh@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-ritika",
    name: "Ritika Ojha",
    email: "ritika.ojha@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-ricky",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- TEAM 2: Prabhjot Singh --
  {
    id: "tl-prabhjot",
    name: "Prabhjot Singh",
    email: "prabhjot.singh@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-argho",
    name: "Argho",
    email: "argho@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-jeevak",
    name: "Jeevak Raina",
    email: "jeevak.raina@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-dharmendra",
    name: "Dharmendra Singh",
    email: "dharmendra.singh@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-tejasvi",
    name: "Tejasvi Yadav",
    email: "tejasvi.yadav@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-harsh",
    name: "Harsh Malik",
    email: "harsh.malik@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-yaman",
    name: "Yaman Tewatia",
    email: "yaman.tewatia@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-harpal",
    name: "Harpal Prajapat",
    email: "harpal.prajapat@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-suhavani",
    name: "Suhavani Alhuwalia",
    email: "suhavani.alhuwalia@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-prabhjot",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- TEAM 3: Shammy Verma --
  {
    id: "tl-shammy",
    name: "Shammy Verma",
    email: "shammy.verma@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-ankit",
    name: "Ankit Ghudayia",
    email: "ankit.ghudayia@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-shammy",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-deepanshu",
    name: "Deepanshu Garg",
    email: "deepanshu.garg@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-shammy",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-pratham",
    name: "Pratham Agarwal",
    email: "pratham.agarwal@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-shammy",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- TEAM 4: Sanjeev Mehta / Haarish Khan --
  {
    id: "tl-sanjeev-haarish",
    name: "Sanjeev Mehta / Haarish Khan",
    email: "sanjeev.haarish@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-tanuj",
    name: "Tanuj Makkar",
    email: "tanuj.makkar@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-sanjeev-haarish",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-govind",
    name: "Govind",
    email: "govind@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-sanjeev-haarish",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-gautam",
    name: "Gautam",
    email: "gautam@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-sanjeev-haarish",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- TEAM 5: Vinay Grewal --
  {
    id: "tl-vinay",
    name: "Vinay Grewal",
    email: "vinay.grewal@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-yogesh-kumar",
    name: "Yogesh Kumar",
    email: "yogesh.kumar@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-dhiraj",
    name: "Dhiraj Kumar",
    email: "dhiraj.kumar@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-mehar",
    name: "Mehar Singh Tewatia",
    email: "mehar.tewatia@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-pankaj",
    name: "Pankaj Tewatia",
    email: "pankaj.tewatia@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-manoj",
    name: "Manoj Kumar",
    email: "manoj.kumar@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-amit",
    name: "Amit Sisodiya",
    email: "amit.sisodiya@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-dharmender",
    name: "Dharmender Dhariwal",
    email: "dharmender.dhariwal@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-vikas",
    name: "Vikas Tewatia",
    email: "vikas.tewatia@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-garima",
    name: "Garima Madan Sharma",
    email: "garima.sharma@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vinay",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- TEAM 6: Vishal Laller/Yuvansh Kapoor --
  {
    id: "tl-vishal-yuvansh",
    name: "Vishal Laller/Yuvansh Kapoor",
    email: "vishal.yuvansh@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-jagdish",
    name: "Jagdish Sharma",
    email: "jagdish.sharma@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-vishal-yuvansh",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- TEAM 7: Pardeep Sharma --
  {
    id: "tl-pardeep",
    name: "Pardeep Sharma",
    email: "pardeep.sharma@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "sales-yashveer",
    name: "Yashveer Singh",
    email: "yashveer.singh@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-pardeep",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },
  {
    id: "sales-nishant",
    name: "Nishant Singh",
    email: "nishant.singh@eliteproinfra.com",
    role: "sales_team",
    teamLeaderId: "tl-pardeep",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Commercial Realty Sales",
    password: "password123"
  },

  // -- ADDITIONAL INDEPENDENT TEAM LEADERS --
  {
    id: "tl-chirag",
    name: "Chirag Mehta",
    email: "chirag.mehta@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "tl-pawan",
    name: "Pawan Tanwar",
    email: "pawan.tanwar@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "tl-dev",
    name: "Dev Verma",
    email: "dev.verma@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "tl-sourav",
    name: "Sourav Tulli",
    email: "sourav.tulli@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "tl-sahil",
    name: "Sahil Arora",
    email: "sahil.arora@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "tl-pratibha",
    name: "Pratibha Pawa",
    email: "pratibha.pawa@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
  },
  {
    id: "tl-karan",
    name: "Karan Rana",
    email: "karan.rana@eliteproinfra.com",
    role: "team_leader",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop",
    department: "Sales Team Leader",
    password: "password123"
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
    projectName: "Apex Net-Zero Warehouse",
    dateCreated: "2026-05-10",
    dateUpdated: "2026-05-24",
    lastCommunication: "2026-05-24",
    location: "Gurugram Infrastructure Corridor, India",
    assignedAgent: "Viren Mehta",
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
    notes: "Seeking modular land development with 30MW redundancy and solar grid-tie options. Elite Pro is competing with 2 other regional partners.",
    projectName: "Vortex Hyper-scale DC",
    dateCreated: "2026-05-25",
    dateUpdated: "2026-05-25",
    lastCommunication: "2026-05-25",
    location: "Noida Sector 144 Tech Park, India",
    assignedAgent: "Viren Mehta",
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
    notes: "Deal closed successfully on May 18. Architect plans sent for custom interior facade styling. Elite Pro designed state-of-the-art earthquake compliance structural elements.",
    projectName: "Heian Glass Tower",
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
    projectName: "EMAAR IBC",
    dateCreated: "2026-05-15",
    dateUpdated: "2026-05-22",
    lastCommunication: "2026-05-22",
    location: "Saket Commercial Belt, New Delhi",
    assignedAgent: "Admin",
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
    projectName: "Nordic Central Port Hub",
    dateCreated: "2026-03-01",
    dateUpdated: "2026-05-05",
    lastCommunication: "2026-05-05",
    location: "Port Area, Chennai, India",
    assignedAgent: "Admin",
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
    sender: "Viren Mehta"
  },
  {
    id: "comm-2",
    leadId: "lead-1",
    date: "2026-05-20",
    type: "call",
    content: "Introductory discovery discussion. Aligned Apex Logistics Tech with our green belt warehousing initiative. Vikram confirmed high priority.",
    sender: "Viren Mehta"
  },
  {
    id: "comm-3",
    leadId: "lead-4",
    date: "2026-05-22",
    type: "email",
    content: "Sent South Delhi catalog and commercial retail pricing matrix. Rajesh acknowledged receipt.",
    sender: "Admin"
  }
];

export const SALES_METRICS_HISTORY: SalesStat[] = [
  { month: "Jan", leadsAdded: 24, dealsWon: 2, revenue: 38.4, target: 40.0 },
  { month: "Feb", leadsAdded: 28, dealsWon: 3, revenue: 57.6, target: 40.0 },
  { month: "Mar", leadsAdded: 35, dealsWon: 4, revenue: 92.0, target: 64.0 },
  { month: "Apr", leadsAdded: 41, dealsWon: 5, revenue: 113.6, target: 80.0 },
  { month: "May", leadsAdded: 48, dealsWon: 6, revenue: 158.4, target: 96.0 },
];
