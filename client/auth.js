import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ request, auth }) {
      const isLoginPage = request.nextUrl.pathname.startsWith("/login");
      const isAuthUser = !!auth;
      
      if (isLoginPage && isAuthUser) {
        return Response.redirect(new URL("/", request.url));
      }
      
      if (!isLoginPage && !isAuthUser) {
        return Response.redirect(new URL("/login", request.url));
      }
      
      return true;
    },
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      return session;
    },
  },
});
