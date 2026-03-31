// Implements: TASK-005 (REQ-027)

export const ROUTES = {
  LANDING: "/",
  HOME: "/home",
  GROUPS: "/groups",
  GROUP_DETAIL: (id: string) => `/groups/${id}`,
  ADD_EXPENSE: "/expenses/new",
  EDIT_EXPENSE: (id: string) => `/expenses/${id}/edit`,
  ACTIVITY: "/activity",
  SETTINGS: "/settings",
} as const;
