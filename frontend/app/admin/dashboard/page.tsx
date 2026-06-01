"use client";

import { CheckSquare, DollarSign, Package, ShoppingBag, Store, Users } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { DashboardStatCard } from "@/components/common/DashboardStatCard";
import { Loading } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/Toast";
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
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;
    apiGet<ApiResponse<Stats>>("/admin/dashboard/stats", session.accessToken)
      .then((res) => setStats(res.data))
      .catch((error) => toast({ title: "Không tải được admin dashboard", description: getErrorMessage(error), variant: "error" }));
  }, [session?.accessToken, toast]);

  if (!stats) return <Loading />;

  return (
    <>
      <AdminHeader title="Tổng quan" description="Theo dõi doanh thu, đơn hàng, sản phẩm và các hàng chờ cần xử lý." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Doanh thu" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} tone="success" />
        <DashboardStatCard label="Đơn hàng" value={stats.totalOrders} icon={ShoppingBag} />
        <DashboardStatCard label="Sản phẩm" value={stats.totalProducts} icon={Package} tone="info" />
        <DashboardStatCard label="Người dùng" value={stats.totalUsers} icon={Users} tone="warning" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Doanh thu gần đây" description="Biểu đồ minh họa. Backend chưa trả chuỗi doanh thu theo ngày." />
          <CardContent>
            <div className="flex h-64 items-end gap-3 rounded-md bg-slate-50 p-5">
              {[42, 58, 48, 72, 64, 84, 76].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col justify-end">
                  <div className="rounded-t-md bg-gradient-to-t from-primary-600 to-cyan-400" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quick actions" description="Các tác vụ quản trị thường dùng." />
          <CardContent className="space-y-3">
            {[
              { href: "/admin/sellers", label: "Duyệt seller", icon: Store },
              { href: "/admin/product-approvals", label: "Duyệt sản phẩm", icon: CheckSquare },
              { href: "/admin/orders", label: "Quản lý đơn hàng", icon: ShoppingBag }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="secondary" className="mb-2 w-full justify-start">
                    <Icon className="h-4 w-4" /> {item.label}
                  </Button>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-black text-slate-950">Đơn hàng gần đây</h2>
          <DataTable headers={["Mã", "Khách", "Tổng", "Trạng thái"]} empty={!stats.recentOrders.length}>
            {stats.recentOrders.map((order) => (
              <tr key={order.id}>
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
          <DataTable headers={["Sản phẩm", "Đã bán"]} empty={!stats.bestSellingProducts.length}>
            {stats.bestSellingProducts.map((item) => (
              <tr key={item.product?.id || item.sold}>
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
