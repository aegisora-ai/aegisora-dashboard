// SAMPLE DATA ONLY. Not connected to Aegisora Core.

export type MemberRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
export type MemberStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export type DemoMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  lastActive: string;
  joinedAt: string;
};

export const demoMembers: DemoMember[] = [
  { id: "u_01", name: "Maradona Özer", email: "maradona@aegisora.dev", role: "OWNER", status: "ACTIVE", lastActive: "2026-09-22 08:10:00Z", joinedAt: "2026-03-19" },
  { id: "u_02", name: "Lena Brandt", email: "lena@aegisora.dev", role: "ADMIN", status: "ACTIVE", lastActive: "2026-09-21 19:44:00Z", joinedAt: "2026-04-01" },
  { id: "u_03", name: "Marco Ferreira", email: "marco@aegisora.dev", role: "MEMBER", status: "ACTIVE", lastActive: "2026-09-20 16:02:00Z", joinedAt: "2026-05-14" },
  { id: "u_04", name: "Priya Nair", email: "priya@aegisora.dev", role: "MEMBER", status: "INVITED", lastActive: "-", joinedAt: "2026-09-18" },
  { id: "u_05", name: "Tomasz Wiśniewski", email: "tomasz@aegisora.dev", role: "VIEWER", status: "SUSPENDED", lastActive: "2026-08-02 10:00:00Z", joinedAt: "2026-04-22" },
];

export const roleDescriptions: { role: MemberRole; label: string; description: string }[] = [
  { role: "OWNER", label: "Owner", description: "Full control, including billing, workspace deletion, and ownership transfer." },
  { role: "ADMIN", label: "Admin", description: "Manages policies, agents, and integrations. Cannot delete the workspace." },
  { role: "MEMBER", label: "Member", description: "Views runtime data and can respond to approval requests." },
  { role: "VIEWER", label: "Viewer", description: "Read-only access to dashboards, decisions, and evidence." },
];