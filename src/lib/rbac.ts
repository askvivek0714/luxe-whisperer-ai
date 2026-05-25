import { createContext, useContext } from "react";

export type Role = "associate" | "marketing" | "admin";

export type Permission =
  | "today.view"
  | "persona.view"
  | "persona.create"
  | "persona.edit"
  | "persona.publish"
  | "persona.retire"
  | "client.view"
  | "recommendation.view"
  | "analytics.view"
  | "audit.view";

const matrix: Record<Role, Permission[]> = {
  associate: ["today.view", "persona.view", "client.view", "recommendation.view"],
  marketing: [
    "persona.view",
    "persona.create",
    "persona.edit",
    "persona.publish",
    "persona.retire",
    "client.view",
    "recommendation.view",
    "analytics.view",
  ],
  admin: [
    "persona.view",
    "persona.create",
    "persona.edit",
    "persona.publish",
    "persona.retire",
    "client.view",
    "recommendation.view",
    "analytics.view",
    "audit.view",
  ],
};

export const roleProfiles: Record<
  Role,
  { name: string; title: string; initials: string }
> = {
  associate: {
    name: "Julian Soames",
    title: "Senior Associate · Bond St.",
    initials: "JS",
  },
  marketing: {
    name: "Camille Devereux",
    title: "Marketing · Client Strategy",
    initials: "CD",
  },
  admin: {
    name: "Hélène Marchand",
    title: "Administrator · HQ",
    initials: "HM",
  },
};

export function can(role: Role, perm: Permission): boolean {
  return matrix[role].includes(perm);
}

export const RoleContext = createContext<{
  role: Role;
  setRole: (r: Role) => void;
}>({ role: "associate", setRole: () => {} });

export const useRole = () => useContext(RoleContext);
export const useCan = (perm: Permission) => can(useContext(RoleContext).role, perm);
