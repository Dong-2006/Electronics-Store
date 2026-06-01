"use client";

import { ShoppingBag, TicketPercent } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/common/Input";
import { Loading } from "@/components/common/Loading";
import { useToast } from "@/components/common/Toast";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { apiDelete, apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ApiResponse, Cart } from "@/types";

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [removeItemId, setRemoveItemId] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);

  const load = useCallback(async () => {
    if (!session?.accessToken) return;
    const res = await apiGet<ApiResponse<Cart>>("/cart", session.accessToken);
    setCart(res.data);
    setLoading(false);
  }, [session?.accessToken]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.accessToken) {
      load().catch((error) => {
        toast({ title: "Không tải được giỏ hàng", description: getErrorMessage(error), variant: "error" });
        setLoading(false);
      });
    }
  }, [status, session?.accessToken, router, load, toast]);

  async function updateQuantity(itemId: number, quantity: number) {
    if (!session?.accessToken) return;
    try {
      await apiPut(`/cart/items/${itemId}`, { quantity }, session.accessToken);
      await load();
    } catch (error) {
      toast({ title: "Không thể cập nhật số lượng", description: getErrorMessage(error), variant: "error" });
    }
  }

  async function confirmRemove() {
    if (!session?.accessToken || !removeItemId) return;
    setRemoving(true);
    try {
      await apiDelete(`/cart/items/${removeItemId}`, session.accessToken);
      toast({ title: "Đã xóa sản phẩm khỏi giỏ hàng", variant: "success" });
      setRemoveItemId(null);
      await load();
    } catch (error) {
      toast({ title: "Không thể xóa sản phẩm", description: getErrorMessage(error), variant: "error" });
    } finally {
      setRemoving(false);
    }
  }

  if (loading) return <Loading />;
  if (!cart?.items.length) {
    return (
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: "Giỏ hàng" }]} />
        <EmptyState
          title="Giỏ hàng đang trống"
          description="Khám phá các thiết bị mới và thêm sản phẩm bạn thích vào giỏ hàng."
          action={<Link href="/products"><Button>Tiếp tục mua sắm</Button></Link>}
          icon={<ShoppingBag className="h-7 w-7" />}
        />
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => sum + Number(item.product.discountPrice || item.product.price) * item.quantity, 0);
  const lowStockItems = cart.items.filter((item) => item.product.stock <= 3);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Giỏ hàng" }]} />
      <div className="mb-6">
        <p className="muted-label text-primary-700">Shopping cart</p>
        <h1 className="section-title mt-1">Giỏ hàng của bạn</h1>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {lowStockItems.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              Một số sản phẩm trong giỏ còn ít hàng. Hãy kiểm tra số lượng trước khi thanh toán.
            </div>
          )}
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdate={(quantity) => updateQuantity(item.id, quantity)}
              onRemove={() => setRemoveItemId(item.id)}
            />
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardHeader title="Tóm tắt đơn hàng" description="Kiểm tra tổng tiền trước khi thanh toán." />
            <CardContent>
              <div className="space-y-3 border-b border-slate-100 pb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Số sản phẩm</span>
                  <span className="font-bold">{cart.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-bold">{formatCurrency(total)}</span>
                </div>
              </div>
              <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                  <TicketPercent className="h-4 w-4 text-primary-700" />
                  Mã ưu đãi
                </div>
                <Input value={coupon} onChange={(event) => setCoupon(event.target.value.toUpperCase())} placeholder="Nhập mã ở bước checkout" />
                <p className="mt-2 text-xs leading-5 text-slate-500">Voucher theo shop sẽ được áp dụng ở trang thanh toán.</p>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <span className="text-sm font-bold text-slate-500">Tổng tiền</span>
                <p className="text-2xl font-black text-primary-700">{formatCurrency(total)}</p>
              </div>
              <Link href="/checkout"><Button size="lg" className="mt-5 w-full">Tiến hành thanh toán</Button></Link>
              <Link href="/products" className="mt-3 block text-center text-sm font-bold text-primary-700">Tiếp tục mua sắm</Link>
            </CardContent>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={removeItemId !== null}
        title="Xóa sản phẩm khỏi giỏ hàng?"
        description="Sản phẩm sẽ được xóa khỏi giỏ hàng hiện tại. Bạn vẫn có thể thêm lại từ trang sản phẩm."
        confirmLabel="Xóa sản phẩm"
        isLoading={removing}
        onClose={() => setRemoveItemId(null)}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
