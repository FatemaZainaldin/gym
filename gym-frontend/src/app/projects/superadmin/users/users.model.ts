import { UserRole } from "@/app/core/models/user.model";
import { Tenant, TenantStatus } from "../clients/clients.model";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
  status?: TenantStatus;
  avatar?: string;
  phone?: string;
  mustChangePassword?: boolean;
  subdomain?: string;
  tenantId? : string;
  tenant :Tenant;
}