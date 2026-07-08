import { User } from "@/app/projects/superadmin/users/users.model";

// src/app/core/auth/models/user.model.ts
export type UserRole = "admin" | "trainer" | "customer";

export type AuthResponse = {
  accessToken: string;
  user: User;
};
