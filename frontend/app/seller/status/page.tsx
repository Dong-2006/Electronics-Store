"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/common/Button";
import { Loading } from "@/components/common/Loading";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useToast } from "@/components/common/Toast";
import { apiGet, getErrorMessage } from "@/lib/api";
import { ApiResponse, SellerProfile } from "@/types";

export default function SellerStatusPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      apiGet<ApiResponse<SellerProfile | null>>("/seller/me", session!.accessToken)
        .then((res) => setProfile(res.data))
        .catch((error) => toast({ title: "Không tải được trạng thái seller", description: getErrorMessage(error), variant: "error" }))
        .finally(() => setLoading(false));
    }
    if (status === "unauthenticated") setLoading(false);
  }, [status, session]);

  if (loading || status === "loading") return <Loading />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Trạng thái seller</h1>
      {!session && <p className="mt-4 rounded-md border bg-white p-4">Bạn chưa đăng nhập.</p>}
      {session && !profile && (
        <div className="mt-4 rounded-md border bg-white p-4">
          <p>Bạn chưa đăng ký seller.</p>
          <Link className="mt-3 inline-block" href="/seller/apply"><Button>Đăng ký seller</Button></Link>
        </div>
      )}
      {profile && (
        <div className="mt-4 rounded-md border bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{profile.shopName}</p>
              <p className="text-sm text-slate-500">{profile.businessEmail}</p>
            </div>
            <StatusBadge status={profile.status} />
          </div>
          {profile.status === "REJECTED" && <p className="mt-4 text-red-700">Lý do từ chối: {profile.rejectReason || "Chưa có lý do"}</p>}
          {profile.status === "APPROVED" && <Link className="mt-4 inline-block" href="/seller/dashboard"><Button>Vào trang seller</Button></Link>}
        </div>
      )}
    </div>
  );
}
