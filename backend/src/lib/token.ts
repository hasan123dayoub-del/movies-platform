import { SignJWT, jwtVerify } from "jose";
import { env } from "./env.js";

// Login tokens (JWT): a signed note that says "this is user 5", valid for 7 days.
// Anyone can read a JWT, but only the server can sign one, so it can't be forged.
// Only the user id goes in it; the role is read fresh from the database on each request.

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ALGORITHM = "HS256";
export const TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60;

export function signToken(userId: number) {
  return new SignJWT()
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_LIFETIME_SECONDS}s`)
    .sign(secret);
}

// The user id inside a valid token, or null when it's broken, forged or expired
export async function readToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });
    const userId = Number(payload.sub);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}
