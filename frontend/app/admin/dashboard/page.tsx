"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Loading } from "@/components/common/Loading";
import { apiGet, getErrorMessage } from "@/lib/api";
import { formatCurrency, statusLabel } from "@/lib/utils";
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

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Doanh thu", formatCurrency(stats.totalRevenue)],
          ["Đơn hàng", stats.totalOrders],
          ["Sản phẩm", stats.totalProducts],
          ["Người dùng", stats.totalUsers]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border bg-white p-4">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-primary-700">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold">Đơn hàng gần đây</h2>
          <DataTable headers={["Mã", "Khách", "Tổng", "Trạng thái"]}>
            {stats.recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">{order.user?.email}</td>
                <td className="px-4 py-3">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3">{statusLabel(order.status)}</td>
              </tr>
            ))}
          </DataTable>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold">Sản phẩm bán chạy</h2>
          <DataTable headers={["Sản phẩm", "Đã bán"]}>
            {stats.bestSellingProducts.map((item) => (
              <tr key={item.product?.id || item.sold}>
                <td className="px-4 py-3">{item.product?.name || "Sản phẩm"}</td>
                <td className="px-4 py-3">{item.sold}</td>
              </tr>
            ))}
          </DataTable>
        </section>
      </div>
    </>
  );
}
