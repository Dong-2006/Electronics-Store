"use client";

import { DollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Loading } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { apiGet, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Order, Product } from "@/types";

type Stats = {
  totalRevenue: string | number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  bestSellingProducts: { product?: Product; sold: number }[];
};

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiGet<ApiResponse<Stats>>("/admin/dashboard/stats", session.accessToken)
      .then((res) => setStats(res.data))
      .catch((error) => alert(getErrorMessage(error)));
  }, [session]);

  if (!stats) return <Loading />;

  const cards = [
    { label: "Doanh thu", value: formatCurrency(stats.totalRevenue), icon: DollarSign, tone: "text-emerald-700 bg-emerald-50" },
    { label: "Đơn hàng", value: stats.totalOrders, icon: ShoppingBag, tone: "text-primary-700 bg-primary-50" },
    { label: "Sản phẩm", value: stats.totalProducts, icon: Package, tone: "text-indigo-700 bg-indigo-50" },
    { label: "Người dùng", value: stats.totalUsers, icon: Users, tone: "text-amber-700 bg-amber-50" }
  ];

  return (
    <>
      <AdminHeader title="Tổng quan" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-950">Đơn hàng gần đây</h2>
          <DataTable headers={["Mã", "Khách", "Tổng", "Trạng thái"]}>
            {stats.recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold">#{order.id}</td>
                <td className="px-4 py-3">{order.user?.email}</td>
                <td className="px-4 py-3 font-bold">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              </tr>
            ))}
          </DataTable>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-950">Sản phẩm bán chạy</h2>
          <DataTable headers={["Sản phẩm", "Đã bán"]}>
            {stats.bestSellingProducts.map((item) => (
              <tr key={item.product?.id || item.sold} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{item.product?.name || "Sản phẩm"}</td>
                <td className="px-4 py-3 font-bold">{item.sold}</td>
              </tr>
            ))}
          </DataTable>
        </section>
      </div>
    </>
  );
}
