export function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 text-sm text-slate-600 md:grid-cols-3">
        <div>
          <p className="font-bold text-slate-900">ElectroHub</p>
          <p className="mt-2">Thiết bị điện tử chính hãng, giá rõ ràng, bảo hành minh bạch.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Hỗ trợ</p>
          <p className="mt-2">Hotline: 1900 1000</p>
          <p>Email: support@electrohub.local</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900">Chính sách</p>
          <p className="mt-2">Đổi trả trong 7 ngày, bảo hành theo từng sản phẩm.</p>
        </div>
      </div>
    </footer>
  );
}
