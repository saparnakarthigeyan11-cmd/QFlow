// All college service information lives here.
// The list is kept in code (not Firestore) because it rarely changes and this saves database reads.
// "prefix" is used in token numbers, e.g. AE-001.
// "avgMinutes" = average minutes one person takes at the counter.

export const COLLEGE = {
  name: "Sri Shakthi Institute of Engineering and Technology",
  addressLines: [
    "Sri Shakthi Nagar, L&T By-Pass,",
    "Chinniyampalayam Post,",
    "Coimbatore – 641062",
  ],
  mapQuery:
    "Sri Shakthi Institute of Engineering and Technology, Sri Shakthi Nagar, L&T By-Pass, Chinniyampalayam Post, Coimbatore 641062",
};

export const ADMISSION_CATEGORIES = ["Government Quota", "Management Quota"];

// Edit this list to match the courses your college really offers.
const COURSES = [
  "B.E. Computer Science and Engineering",
  "B.Tech Information Technology",
  "B.Tech Artificial Intelligence and Data Science",
  "B.E. Electronics and Communication Engineering",
  "B.E. Electrical and Electronics Engineering",
  "B.E. Mechanical Engineering",
  "B.E. Civil Engineering",
  "Other",
];

export const TOKEN_STATUS = {
  WAITING: "Waiting",
  CALLED: "Called",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  SKIPPED: "Skipped",
  CANCELLED: "Cancelled",
};

// Tokens that still occupy a place in the queue.
export const ACTIVE_STATUSES = ["Waiting", "Called", "In Progress"];

export const SERVICES = [
  {
    id: "admission-enquiry",
    icon: "🎓",
    title: "Admission Enquiry",
    text: "Get information about courses and admissions.",
    prefix: "AE",
    avgMinutes: 10,
    fields: [
      { name: "applicantName", label: "Applicant Name", type: "text", required: true, prefill: "name" },
      { name: "course", label: "Course of Interest", type: "select", required: true, options: COURSES },
      { name: "message", label: "Your Enquiry", type: "textarea", required: true, placeholder: "Example: fees, eligibility, hostel, scholarships..." },
    ],
  },
  {
    id: "admission-registration",
    icon: "📝",
    title: "Admission Registration",
    text: "Register for admission and complete your application.",
    prefix: "AR",
    avgMinutes: 15,
    fields: [
      { name: "applicantName", label: "Applicant Name", type: "text", required: true, prefill: "name" },
      { name: "course", label: "Course", type: "select", required: true, options: COURSES },
      { name: "admissionCategory", label: "Admission Category", type: "select", required: true, options: ADMISSION_CATEGORIES, prefill: "category" },
      { name: "cutoff", label: "12th Cut-off / Percentage (optional)", type: "text", required: false, placeholder: "Example: 182.5 or 88%" },
    ],
  },
  {
    id: "document-verification",
    icon: "📄",
    title: "Document Verification",
    text: "Verify your certificates and admission documents.",
    prefix: "DV",
    avgMinutes: 20,
    checklist: [
      "10th and 12th mark sheets (original + photocopy)",
      "Transfer Certificate (TC)",
      "Community certificate",
      "Allotment order / counselling letter (Government Quota)",
      "Passport-size photographs",
      "Aadhaar card copy",
    ],
    notice: "Verification is completed only by authorised college staff at the counter.",
    fields: [
      { name: "applicantName", label: "Applicant Name", type: "text", required: true, prefill: "name" },
      { name: "purpose", label: "Verification For", type: "select", required: true, options: ["New admission", "Scholarship", "Other"] },
      { name: "message", label: "Additional Note (optional)", type: "textarea", required: false },
    ],
  },
  {
    id: "fee-payment",
    icon: "💳",
    title: "Fee Payment",
    text: "Get assistance with college fee payments.",
    prefix: "FP",
    avgMinutes: 10,
    notice: "This request only gives you a place in the fee-counter queue. No payment is made on this website.",
    fields: [
      { name: "studentName", label: "Student / Applicant Name", type: "text", required: true, prefill: "name" },
      { name: "feeCategory", label: "Fee Category", type: "select", required: true, options: ["Tuition Fee", "Hostel Fee", "Transport Fee", "Examination Fee", "Admission Fee", "Other"] },
      { name: "message", label: "Additional Note (optional)", type: "textarea", required: false },
    ],
  },
  {
    id: "scholarship",
    icon: "🏅",
    title: "Scholarship Services",
    text: "Get help with scholarship-related services.",
    prefix: "SC",
    avgMinutes: 15,
    fields: [
      { name: "studentName", label: "Student / Applicant Name", type: "text", required: true, prefill: "name" },
      { name: "scholarshipType", label: "Scholarship Type", type: "select", required: true, options: ["Government scholarship", "First graduate scheme", "Merit scholarship", "Other"] },
      { name: "message", label: "How can we help?", type: "textarea", required: true },
    ],
  },
  {
    id: "certificate",
    icon: "📜",
    title: "Certificate Services",
    text: "Apply for certificates and related services.",
    prefix: "CS",
    avgMinutes: 12,
    fields: [
      { name: "studentName", label: "Student Name", type: "text", required: true, prefill: "name" },
      { name: "certificateType", label: "Certificate Required", type: "select", required: true, options: ["Bonafide certificate", "Transfer Certificate", "Conduct certificate", "Course completion certificate", "Other"] },
      { name: "message", label: "Additional Note (optional)", type: "textarea", required: false },
    ],
  },
  {
    id: "examination",
    icon: "📚",
    title: "Examination Services",
    text: "Get assistance with examination services.",
    prefix: "EX",
    avgMinutes: 10,
    fields: [
      { name: "studentName", label: "Student Name", type: "text", required: true, prefill: "name" },
      { name: "serviceType", label: "Examination Service", type: "select", required: true, options: ["Hall ticket", "Revaluation / re-totalling", "Arrear registration", "Result query", "Other"] },
      { name: "registerNumber", label: "Register Number (optional)", type: "text", required: false },
    ],
  },
  {
    id: "other",
    icon: "🔧",
    title: "Other College Services",
    text: "Access other student and college services.",
    prefix: "OS",
    avgMinutes: 10,
    fields: [
      { name: "studentName", label: "Your Name", type: "text", required: true, prefill: "name" },
      { name: "description", label: "Service Required", type: "textarea", required: true, placeholder: "Describe what you need" },
    ],
  },
];


export function getService(id) {
  return SERVICES.find((service) => service.id === id);
}
