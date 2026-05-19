"use client";

import { Clock, Package, ShoppingBag, Store, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/common/Loading";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse } from "@/types";
import { formatCurrency } from "@/lib/utils";

type Stats = {
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
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session.user.role !== "SELLER") router.push("/seller/status");
  }, [status, session, router]);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiGet<ApiResponse<Stats>>("/seller/dashboard", session.accessToken)
      .then((res) => setStats(res.data))
      .catch((error) => {
        alert(getErrorMessage(error));
        router.push("/seller/status");
      });
  }, [session, router]);

  if (!stats) return <Loading />;

  const cards = [
    { label: "Tổng sản phẩm", value: stats.totalProducts, icon: Package, tone: "bg-primary-50 text-primary-700" },
    { label: "Đang chờ duyệt", value: stats.pendingProducts, icon: Clock, tone: "bg-amber-50 text-amber-700" },
    { label: "Đã duyệt", value: stats.approvedProducts, icon: Store, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Bị từ chối", value: stats.rejectedProducts, icon: XCircle, tone: "bg-red-50 text-red-700" },
    { label: "Đơn hàng của shop", value: stats.totalOrders, icon: ShoppingBag, tone: "bg-indigo-50 text-indigo-700" },
    { label: "Doanh thu", value: formatCurrency(stats.revenue), icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700" }
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">Seller center</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Tổng quan shop</h1>
        <p className="mt-2 text-sm text-slate-500">Theo dõi sản phẩm, đơn hàng và trạng thái duyệt sản phẩm của shop.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-slate-500">{item.label}</p>
                <span className={`grid h-10 w-10 place-items-center rounded-md ${item.tone}`}><Icon className="h-5 w-5" /></span>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-950">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
