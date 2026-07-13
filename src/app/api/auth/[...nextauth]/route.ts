import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  clearRateLimit,
  formatRetryAfter,
  getClientIpFromHeaders,
  incrementRateLimit,
} from "@/lib/rateLimit";
import bcrypt from "bcryptjs";

const LOGIN_EMAIL_RATE_LIMIT = {
  limit: 5,
  windowMs: 5 * 60 * 1000,
};

const LOGIN_IP_RATE_LIMIT = {
  limit: 20,
  windowMs: 5 * 60 * 1000,
};

const LOGIN_RATE_LIMIT_MESSAGE = "Слишком много неудачных попыток входа.";
const LOGIN_INVALID_MESSAGE = "Неверный email или пароль";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Необходим email и пароль");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const emailRateLimitKey = `login-email:${normalizedEmail}`;
        const ipRateLimitKey = `login-ip:${getClientIpFromHeaders(request.headers)}`;
        const emailRateLimit = checkRateLimit(emailRateLimitKey, LOGIN_EMAIL_RATE_LIMIT);
        const ipRateLimit = checkRateLimit(ipRateLimitKey, LOGIN_IP_RATE_LIMIT);

        const blockedRateLimit = !emailRateLimit.allowed ? emailRateLimit : !ipRateLimit.allowed ? ipRateLimit : null;

        if (blockedRateLimit) {
          throw new Error(`${LOGIN_RATE_LIMIT_MESSAGE} Подождите ${formatRetryAfter(blockedRateLimit.retryAfter)}.`);
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          incrementRateLimit(emailRateLimitKey, LOGIN_EMAIL_RATE_LIMIT);
          incrementRateLimit(ipRateLimitKey, LOGIN_IP_RATE_LIMIT);
          throw new Error(LOGIN_INVALID_MESSAGE);
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          incrementRateLimit(emailRateLimitKey, LOGIN_EMAIL_RATE_LIMIT);
          incrementRateLimit(ipRateLimitKey, LOGIN_IP_RATE_LIMIT);
          throw new Error(LOGIN_INVALID_MESSAGE);
        }

        clearRateLimit(emailRateLimitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id || token.sub) as string;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_dev_mode_only",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
