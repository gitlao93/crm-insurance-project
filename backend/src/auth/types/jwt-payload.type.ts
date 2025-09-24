export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: string;
  iat?: number; // issued at (optional, added by JWT)
  exp?: number; // expiration (optional, added by JWT)
}
