import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import { eq } from "drizzle-orm";
import { hashSync, compareSync } from "bcrypt-ts";
import * as jose from "jose";
import { env } from "./lib/env";

const JWT_SECRET = new TextEncoder().encode(env.jwtSecret || "kinetic-local-secret-key-2024");

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, { clockTolerance: 60 });
    return payload as { userId: number; username: string; type: string };
  } catch {
    return null;
  }
}

export async function getLocalUserFromHeader(headers: Headers) {
  const cookie = headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/kinetic_local_session=([^;]+)/);
  if (!match) return null;
  const payload = await verifyLocalToken(decodeURIComponent(match[1]));
  if (!payload) return null;
  const db = getDb();
  const user = await db.query.localUsers.findFirst({
    where: eq(localUsers.id, payload.userId),
  });
  return user || null;
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        displayName: z.string().min(1).max(100),
        email: z.string().email().optional(),
        password: z.string().min(6).max(100),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.localUsers.findFirst({
        where: eq(localUsers.username, input.username),
      });
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "Username already taken" });
      }
      const passwordHash = hashSync(input.password, 12);
      const result = await db.insert(localUsers).values({
        username: input.username,
        displayName: input.displayName,
        email: input.email || null,
        passwordHash,
      });
      const userId = Number(result[0].lastInsertRowid);
      const token = await new jose.SignJWT({
        userId,
        username: input.username,
        type: "local",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
      return { token, user: { id: userId, username: input.username, displayName: input.displayName } };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const user = await db.query.localUsers.findFirst({
        where: eq(localUsers.username, input.username),
      });
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }
      const valid = compareSync(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }
      const token = await new jose.SignJWT({
        userId: user.id,
        username: user.username,
        type: "local",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(JWT_SECRET);
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          name: user.displayName,
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const headers = ctx.req.headers;
    const user = await getLocalUserFromHeader(headers);
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      name: user.displayName,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
  }),
});
