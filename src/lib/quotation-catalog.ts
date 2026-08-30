export const QUOTE_TYPES = [
  "Web Development",
  "Software Development",
  "Website Development",
  "Hosting Provider",
  "Domain Provider",
  "Bug Fixing",
] as const;

export const TIMELINE_UNITS = ["Days", "Weeks", "Months"] as const;

export const QUOTE_STATUSES = ["Draft", "Open", "Pending", "Approved", "Close"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export function normalizeQuoteStatus(value?: string | null): QuoteStatus {
  return (QUOTE_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as QuoteStatus)
    : "Draft";
}

export const TECH_OPTIONS = [
  "WordPress",
  "Laravel",
  "PHP",
  "MySQL",
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "MongoDB",
  "WooCommerce",
  "Elementor",
  "Hostinger",
  "AWS",
  "Cloudflare CDN",
  "SSL",
];

export const FEATURES_BY_TYPE: Record<string, string[]> = {
  "Web Development": [
    "Responsive UI across devices",
    "Admin dashboard",
    "Inquiry / contact forms",
    "SEO-ready pages",
    "SSL & basic security",
    "Payment gateway ready",
    "Analytics setup",
    "WhatsApp / call button",
    "Staging + go-live support",
  ],
  "Website Development": [
    "Theme setup & customisation",
    "Up to agreed page count",
    "Mobile-first layout",
    "Contact & lead forms",
    "SEO basics",
    "SSL certificate",
    "Google Business / Analytics",
    "Social links & share",
    "Launch checklist",
  ],
  "Software Development": [
    "Requirements & architecture",
    "Custom modules / workflows",
    "Role-based access",
    "API integrations",
    "Database design",
    "QA & UAT cycles",
    "Admin training",
    "Source handover",
  ],
  "Hosting Provider": [
    "Cloud / shared hosting setup",
    "Free SSL",
    "Daily backups",
    "Email mailboxes",
    "CDN",
    "Uptime monitoring",
    "Migration support",
  ],
  "Domain Provider": [
    "Domain registration",
    "DNS configuration",
    "Email forwarding",
    "WHOIS privacy",
    "SSL mapping",
  ],
  "Bug Fixing": [
    "Issue audit",
    "Priority bug fixes",
    "Regression testing",
    "Performance check",
    "Fix report",
    "Post-fix support window",
  ],
};

export const COMMON_FEATURES = [
  "Responsive design",
  "SSL & security",
  "Backup setup",
  "Go-live support",
  "Handover documentation",
];

export function featuresForType(type: string) {
  return FEATURES_BY_TYPE[type] ?? COMMON_FEATURES;
}
