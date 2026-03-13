import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

async function refreshGoogleToken(token) {
  try {
    if (!token.refreshToken) {
      return {
        ...token,
        error: "MissingRefreshToken",
      };
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      accessToken: refreshedTokens.access_token ?? token.accessToken,
      expiresAt: Math.floor(Date.now() / 1000) + (refreshedTokens.expires_in ?? 3600),
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          access_type: "offline",
        },
      },
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
      if (account) {
        return {
          ...token,
          idToken: account.id_token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token ?? token.refreshToken,
          expiresAt: account.expires_at,
          error: undefined,
        };
      }

      if (token.expiresAt && Date.now() < token.expiresAt * 1000) {
        return token;
      }

      return refreshGoogleToken(token);
    },
    async session({ session, token }) {
      session.idToken = token.idToken;
      session.error = token.error;
      return session;
    },
  },
});
