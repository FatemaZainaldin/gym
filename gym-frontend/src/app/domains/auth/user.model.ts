// src/app/core/auth/models/user.model.ts
export type UserRole = "admin" | "trainer" | "customer";

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};
