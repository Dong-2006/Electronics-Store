import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: "USER" | "ADMIN";
    };
  }

  interface User {
    id: number;
    role: "USER" | "ADMIN";
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: "USER" | "ADMIN";
    accessToken: string;
  }
}
