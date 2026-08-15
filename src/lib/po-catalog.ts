export const PO_TYPES = ["Hosting", "Subscription", "Web Development"] as const;
export type POType = (typeof PO_TYPES)[number];

export const TOP_FEATURES = [
  "1 Website",
  "Maximum Performance (Up to 10x)",
  "Unlimited NVMe Storage",
  "Daily Backups",
  "Free Email",
  "Unlimited Free SSL",
  "Unlimited Bandwidth",
  "Free CDN",
  "Dedicated IP Address",
];

export const MANAGED_FEATURES = [
  "Full Design and Development",
  "Free Automatic Website Migration",
  "Unlimited Pages / Unlimited Gallery",
  "Free Pre-built Templates",
  "Image optimiser",
  "Social Media Integration",
  "Smart WordPress Auto Updates",
  "WordPress Vulnerabilities Scanner",
  "WordPress Compatibility Checker",
  "WordPress Multisite",
  "WP-CLI and SSH",
  "WordPress Staging Tool",
  "Object Cache for WordPress",
  "On-Demand Backup",
  "WordPress AI Tools",
  "Popup maker Integration",
  "Google analytics Integration",
];
