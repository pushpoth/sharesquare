// Implements: TASK-004 (REQ-023, REQ-024)

export interface User {
  /** UUID — matches `auth.users.id` (Postgres). */
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  createdAt: string;
}
