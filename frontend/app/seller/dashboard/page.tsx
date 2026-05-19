"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";
import { formatCurrency } from "@/lib/utils";

type Dashboard = {
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  totalOrders: number;
  revenue: number;
};

export default function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/seller/status");
  }, [status, session, router]);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiGet<ApiResponse<Dashboard>>("/seller/dashboard", session.accessToken)
      .then((res) => setStats(res.data))
      .catch((error) => {
        alert(getErrorMessage(error));
        router.push("/seller/status");
      });
  }, [session, router]);

  if (!stats) return <Loading />;

  const cards = [
    ["Tong san pham", stats.totalProducts],
    ["Dang cho duyet", stats.pendingProducts],
    ["Da duyet", stats.approvedProducts],
    ["Bi tu choi", stats.rejectedProducts],
    ["Don hang cua shop", stats.totalOrders],
    ["Doanh thu", formatCurrency(stats.revenue)]
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Seller Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-md border bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-emerald-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
