export type AdminRole = "owner" | "editor" | "contributor";
export type AdminAccessStatus = "invited" | "active" | "suspended";
export type AdminPermission =
  | "news"
  | "doctors"
  | "arlar27"
  | "college"
  | "sigs"
  | "members"
  | "congresses"
  | "resources"
  | "inbox"
  | "access";

export type AdminAccessUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminAccessStatus;
  permissions: AdminPermission[];
  createdAt: string;
  invitedAt: string;
  lastActiveAt: string;
  authUserId: string;
};

export type AdminAccessAuditEntry = {
  id: string;
  action: string;
  targetEmail: string;
  detail: string;
  actorEmail: string;
  createdAt: string;
};

export type AdminAuditLogEntry = {
  id: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  targetLabel: string;
  detail: string;
  actorEmail: string;
  createdAt: string;
};

export const accessPermissionDefinitions: { id: AdminPermission; label: string; description: string }[] = [
  { id: "news", label: "Newsroom", description: "Create, edit, translate, and publish news." },
  { id: "doctors", label: "Doctor directory", description: "Manage doctor profiles and placements." },
  { id: "arlar27", label: "ArLAR27", description: "Manage congress pages, committees, and programme." },
  { id: "college", label: "ArLAR College", description: "Manage webinars, replays, and events." },
  { id: "sigs", label: "Special interest groups", description: "Manage group identities and visibility." },
  { id: "members", label: "Member societies", description: "Manage countries and national societies." },
  { id: "congresses", label: "Past congresses", description: "Manage archives, replays, and galleries." },
  { id: "resources", label: "Professional resources", description: "Manage publications, bulletins, and partners." },
  { id: "inbox", label: "Inbox & subscribers", description: "Review enquiries, questions, and subscribers." },
  { id: "access", label: "Access control", description: "Create administrators and change permissions." },
];

export const roleLabels: Record<AdminRole, string> = {
  owner: "Owner",
  editor: "Editor",
  contributor: "Contributor",
};

export const roleDefaultPermissions: Record<AdminRole, AdminPermission[]> = {
  owner: accessPermissionDefinitions.map((permission) => permission.id),
  editor: accessPermissionDefinitions.filter((permission) => permission.id !== "access").map((permission) => permission.id),
  contributor: ["news", "doctors", "college", "sigs", "members", "congresses", "resources"],
};
