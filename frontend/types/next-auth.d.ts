import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: "USER" | "SELLER" | "ADMIN";
    };
  }

  interface User {
    id: number;
    role: "USER" | "SELLER" | "ADMIN";
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: "USER" | "SELLER" | "ADMIN";
    accessToken: string;
  }
}
