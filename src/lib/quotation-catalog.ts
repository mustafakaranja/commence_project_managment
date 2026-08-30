export const QUOTE_TYPES = [
  "Web Development",
  "Software Development",
  "Website Development",
  "Hosting Provider",
  "Domain Provider",
  "Bug Fixing",
  "Subscription Base",
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

export const SUBSCRIPTION_YEARS = ["1", "2", "3", "4"] as const;

export const DEFAULT_PACKAGE_NAME = "Commence Web Exclusive Cloud Web Development Package";

export const SUBSCRIPTION_SPEC_GROUPS = [
  {
    title: "Hosting & Performance",
    options: [
      "1 Website with Maximum Performance (Up to 10x)",
      "Unlimited NVMe Storage and Unlimited Bandwidth",
      "Free CDN and Dedicated IP Address",
      "Managed Web Hosting Services for E-Commerce Website",
    ],
  },
  {
    title: "Managed WordPress & Platform",
    options: [
      "E-commerce Platform Integration",
      "Full Website Design and Theme Development",
      "Free Automatic Website Migration",
      "Unlimited Pages and Unlimited Gallery",
      "WordPress Staging Tool, WP-CLI, and SSH access",
      "WordPress Multisite and WordPress AI Tools",
      "Free Pre-built Templates and Webmail Services",
    ],
  },
  {
    title: "Security & Optimization",
    options: [
      "Unlimited Free SSL",
      "Daily Backups and On-Demand Backup options",
      "WordPress Vulnerabilities Scanner",
      "Image Optimizer and Smart WordPress Auto Updates",
      "Object Cache for WordPress and Compatibility Checker",
    ],
  },
  {
    title: "Integrations",
    options: [
      "Social Media Integration",
      "Google Analytics Integration",
      "Popup Maker Integration",
    ],
  },
] as const;

export const OWNERSHIP_NOTICE =
  "Subscription Service Notice: This is a subscription-based service agreement. Under these terms, Commence Solutions retains full ownership of the website, all associated infrastructure, files, content, and data. The client is granted usage rights only for the duration of an active subscription. Full ownership of the website and its data requires the execution of a separate, distinct purchase agreement. Upon termination or cancellation of the subscription, all rights to the website and associated assets remain with Commence Solutions. Data export or transfer is subject to separate terms and may require additional fees.";

export function isSubscriptionQuote(type?: string) {
  return type === "Subscription Base";
}

export function emptySpecGroups(): { title: string; items: string[] }[] {
  return SUBSCRIPTION_SPEC_GROUPS.map((g) => ({ title: g.title, items: [] as string[] }));
}

export function defaultFilledSpecGroups(): { title: string; items: string[] }[] {
  return SUBSCRIPTION_SPEC_GROUPS.map((g) => ({ title: g.title, items: [...g.options] }));
}

export function specOptionsFor(title: string, selected: string[]) {
  const group = SUBSCRIPTION_SPEC_GROUPS.find((g) => g.title === title);
  const base: string[] = group ? [...group.options] : [];
  return [...base, ...selected.filter((item) => !base.includes(item))];
}
