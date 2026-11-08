import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { signToken } from "../lib/token.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

// The fields that are safe to send back: never the password hash
export const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} as const;

// 10 rounds: about 60 ms per hash, slow enough to make guessing expensive
const HASH_ROUNDS = 10;

// Compared against when the email doesn't exist, so a wrong email takes as long as
// a wrong password and response times don't reveal which emails have accounts
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", HASH_ROUNDS);

export async function register({ name, email, password }: RegisterInput) {
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const user = await prisma.user.create({
    // New accounts are always regular users; admins are made with `npm run make-admin`
    data: { name, email, passwordHash: await bcrypt.hash(password, HASH_ROUNDS) },
    select: publicUserFields,
  });

  return { user, token: await signToken(user.id) };
}

export async function login({ email, password }: LoginInput) {
  const found = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, found?.passwordHash ?? DUMMY_HASH);

  // One message for both cases: don't tell an attacker which part was wrong
  if (!found || !passwordMatches) {
    throw new HttpError(401, "Email or password is incorrect");
  }

  const { passwordHash: _, ...user } = found;
  return { user, token: await signToken(user.id) };
}

export function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: publicUserFields });
}
