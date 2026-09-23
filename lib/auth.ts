import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CLIENT", input: false },
      phone: { type: "string", required: false, input: true },
      active: { type: "boolean", defaultValue: true, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});
