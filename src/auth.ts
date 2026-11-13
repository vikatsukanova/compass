import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.equals(bufB);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = process.env.AUTH_EMAIL;
        const password = process.env.AUTH_PASSWORD;

        if (!email || !password) {
          console.error("AUTH_EMAIL and AUTH_PASSWORD must be set.");
          return null;
        }

        const inputEmail = credentials?.email as string | undefined;
        const inputPassword = credentials?.password as string | undefined;

        if (!inputEmail || !inputPassword) return null;
        if (!safeEqual(inputEmail, email) || !safeEqual(inputPassword, password)) {
          return null;
        }

        return { id: "owner", email };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (token.email && session.user) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  trustHost: true,
});
