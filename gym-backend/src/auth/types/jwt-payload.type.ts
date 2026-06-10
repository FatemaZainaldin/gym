export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  tenantId : string | null,
  isSuperAdmin: boolean;

}
