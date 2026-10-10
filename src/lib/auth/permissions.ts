export type Role = "owner" | "moderator";

export type Permission = "reviews" | "submissions" | "hide_content" | "adoptables";

export interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  perms: Record<Permission, boolean>;
}

export const PERMISSION_LIST: { key: Permission; label: string; desc: string }[] = [
  { key: "reviews", label: "Review moderation", desc: "Approve or reject client reviews." },
  { key: "submissions", label: "Submission moderation", desc: "Approve or reject commission submissions." },
  { key: "hide_content", label: "Hide content", desc: "Hide inappropriate reviews or submissions." },
  { key: "adoptables", label: "Adoptables Management", desc: "Create, upload, edit, and publish adoptables." },
];

export function ownerPermissions(): Record<Permission, boolean> {
  return { reviews: true, submissions: true, hide_content: true, adoptables: true };
}

export function emptyPermissions(): Record<Permission, boolean> {
  return { reviews: false, submissions: false, hide_content: false, adoptables: false };
}
