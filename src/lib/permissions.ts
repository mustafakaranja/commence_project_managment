export type Role =
  | "admin"
  | "director"
  | "account_manager"
  | "manager"
  | "developer"
  | "HR"
  | "LT"
  | "user";

export type Permission =
  | "view_dashboard"
  | "view_projects"
  | "view_clients"
  | "view_invoices"
  | "view_members"
  | "view_po"
  | "view_quotations"
  | "view_expenses"
  | "add_member"
  | "edit_member"
  | "delete_member"
  | "add_project"
  | "edit_project"
  | "delete_project"
  | "add_client"
  | "edit_client"
  | "delete_client"
  | "add_invoice"
  | "edit_invoice"
  | "delete_invoice"
  | "add_expense"
  | "edit_expense"
  | "delete_expense"
  | "add_po"
  | "edit_po"
  | "delete_po"
  | "add_quotation"
  | "edit_quotation"
  | "delete_quotation";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "view_dashboard",
    "view_projects",
    "view_clients",
    "view_invoices",
    "view_members",
    "view_po",
    "add_member",
    "edit_member",
    "delete_member",
    "add_project",
    "edit_project",
    "delete_project",
    "add_client",
    "edit_client",
    "delete_client",
    "add_invoice",
    "edit_invoice",
    "delete_invoice",
    "view_expenses",
    "add_expense",
    "edit_expense",
    "delete_expense",
    "add_po",
    "edit_po",
    "delete_po",
  ],
  director: [
    "view_dashboard",
    "view_projects",
    "view_clients",
    "view_invoices",
    "add_invoice",
    "edit_invoice",
    "view_members",
    "view_po",
    "view_expenses",
    "add_expense",
    "edit_expense",
    "delete_expense",
    "add_po",
    "edit_po",
    "delete_po",
    "view_quotations",
    "add_quotation",
    "edit_quotation",
    "delete_quotation",
    "add_project",
    "edit_project",
  ],
  account_manager: [
    "view_projects",
    "view_clients",
    "view_invoices",
    "view_members",
    "view_po",
    "add_member",
    "edit_member",
    "add_project",
    "edit_project",
    "add_client",
    "edit_client",
    "add_invoice",
    "edit_invoice",
    "add_po",
    "edit_po",
  ],
  manager: [
    "view_projects",
    "view_clients",
    "view_members",
    "add_project",
    "edit_project",
    "add_client",
    "edit_client",
  ],
  developer: [
    "view_projects",
    "view_members",
  ],
  HR: [
    "view_members",
    "add_member",
    "edit_member",
  ],
  LT: [
    "view_projects",
    "view_clients",
    "view_invoices",
    "view_members",
  ],
  user: [
    "view_projects",
  ],
};

const EXPENSE_PERMISSIONS: Permission[] = [
  "view_expenses",
  "add_expense",
  "edit_expense",
  "delete_expense",
];

const QUOTATION_PERMISSIONS: Permission[] = [
  "view_quotations",
  "add_quotation",
  "edit_quotation",
  "delete_quotation",
];

export function hasPermission(
  role: Role,
  permission: Permission,
  designation?: string
): boolean {
  if (ROLE_PERMISSIONS[role]?.includes(permission)) return true;
  const isDirector = designation?.trim().toLowerCase() === "director";
  if (isDirector && EXPENSE_PERMISSIONS.includes(permission)) return true;
  if (isDirector && QUOTATION_PERMISSIONS.includes(permission)) return true;
  return false;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  director: "Director",
  account_manager: "Account Manager",
  manager: "Manager",
  developer: "Developer",
  HR: "HR",
  LT: "LT",
  user: "User",
};

export const ALL_ROLES: Role[] = [
  "admin",
  "director",
  "account_manager",
  "manager",
  "developer",
  "HR",
  "LT",
  "user",
];
