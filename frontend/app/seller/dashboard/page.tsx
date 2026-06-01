"use client";

import { Clock, Package, PlusCircle, ShoppingBag, Store, TrendingUp, Upload, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { DashboardStatCard } from "@/components/common/DashboardStatCard";
import { Loading } from "@/components/common/Loading";
import { useToast } from "@/components/common/Toast";
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
  const { toast } = useToast();
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
        toast({ title: "Không tải được seller dashboard", description: getErrorMessage(error), variant: "error" });
        router.push("/seller/status");
      });
  }, [session?.accessToken, router, toast]);

  if (!stats) return <Loading />;

  const todoItems = [
    { label: "Sản phẩm chờ duyệt", value: stats.pendingProducts, href: "/seller/products?status=PENDING" },
    { label: "Sản phẩm bị từ chối", value: stats.rejectedProducts, href: "/seller/products?status=REJECTED" },
    { label: "Đơn hàng cần xử lý", value: stats.totalOrders, href: "/seller/orders" }
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="muted-label text-emerald-700">Seller center</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Tổng quan shop</h1>
          <p className="mt-2 text-sm text-slate-500">Theo dõi sản phẩm, đơn hàng và trạng thái duyệt sản phẩm của shop.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/seller/products/create"><Button><PlusCircle className="h-4 w-4" /> Thêm sản phẩm</Button></Link>
          <Link href="/seller/products"><Button variant="secondary"><Upload className="h-4 w-4" /> Upload CSV</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardStatCard label="Tổng sản phẩm" value={stats.totalProducts} icon={Package} />
        <DashboardStatCard label="Đang chờ duyệt" value={stats.pendingProducts} icon={Clock} tone="warning" />
        <DashboardStatCard label="Đã duyệt" value={stats.approvedProducts} icon={Store} tone="success" />
        <DashboardStatCard label="Bị từ chối" value={stats.rejectedProducts} icon={XCircle} tone="danger" />
        <DashboardStatCard label="Đơn hàng của shop" value={stats.totalOrders} icon={ShoppingBag} tone="info" />
        <DashboardStatCard label="Doanh thu" value={formatCurrency(stats.revenue)} icon={TrendingUp} tone="success" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Hiệu suất bán hàng" description="Backend hiện trả tổng doanh thu, chưa có dữ liệu theo ngày để vẽ chart thật." />
          <CardContent>
            <div className="flex h-64 items-end gap-3 rounded-md bg-slate-50 p-5">
              {[38, 52, 44, 68, 56, 78, 64].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col justify-end">
                  <div className="rounded-t-md bg-gradient-to-t from-primary-600 to-cyan-400" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Việc cần xử lý" description="Các task quan trọng của shop." />
          <CardContent className="space-y-3">
            {todoItems.map((item) => (
              <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50">
                <span className="font-bold text-slate-700">{item.label}</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">{item.value}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
