"use client";

const { SessionProvider } = require("next-auth/react");

function NextAuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export default NextAuthProvider;