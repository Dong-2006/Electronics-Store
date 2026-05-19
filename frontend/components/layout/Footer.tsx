import { Headphones, ShieldCheck, Truck } from "lucide-react";

export function Footer() {
  const benefits = [
    { icon: ShieldCheck, title: "Hàng chính hãng", text: "Nguồn gốc rõ ràng, bảo hành minh bạch." },
    { icon: Truck, title: "Giao nhanh", text: "Theo dõi đơn hàng và trạng thái từng shop." },
    { icon: Headphones, title: "Hỗ trợ tốt", text: "Đội ngũ hỗ trợ trong suốt quá trình mua." }
  ];

  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="container-page grid gap-6 py-8 md:grid-cols-3">
        {benefits.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary-50 text-primary-700">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-slate-100">
        <div className="container-page flex flex-col gap-3 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p className="font-bold text-slate-900">ElectroHub</p>
          <p>Hotline: 1900 1000 | support@electrohub.local</p>
          <p>Đổi trả 7 ngày, bảo hành theo từng sản phẩm.</p>
        </div>
      </div>
    </footer>
  );
}
