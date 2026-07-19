export type Role =
  | "admin"
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
  | "delete_invoice";

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

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  account_manager: "Account Manager",
  manager: "Manager",
  developer: "Developer",
  HR: "HR",
  LT: "LT",
  user: "User",
};

export const ALL_ROLES: Role[] = [
  "admin",
  "account_manager",
  "manager",
  "developer",
  "HR",
  "LT",
  "user",
];
