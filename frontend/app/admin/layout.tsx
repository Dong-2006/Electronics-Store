"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Loading } from "@/components/common/Loading";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session.user.role !== "ADMIN") router.push("/");
  }, [status, session, router]);

  if (status === "loading" || session?.user.role !== "ADMIN") {
    return <Loading label="Đang kiểm tra quyền truy cập..." />;
  }

  return (
    <div className="mx-auto flex max-w-7xl">
      <AdminSidebar />
      <section className="flex-1 p-6">{children}</section>
    </div>
  );
}
