import { create, verify } from "https://deno.land/x/djwt/mod.ts";

export class AuthManager {
  constructor(private readonly secret: string) {}

  async createToken(payload: Record<string, unknown>): Promise<string> {
    return await create({ alg: "HS512", typ: "JWT" }, payload, this.secret);
  }

  async verifyToken(token: string): Promise<Record<string, unknown>> {
    return await verify(token, this.secret, "HS512");
  }
}
