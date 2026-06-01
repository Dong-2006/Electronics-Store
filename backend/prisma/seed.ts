import bcrypt from "bcryptjs";
import { PrismaClient, ProductApprovalStatus, Role, SellerStatus, VoucherType } from "@prisma/client";
import { slugify } from "../src/utils/slug";

const prisma = new PrismaClient();

const image = (text: string) =>
  `https://placehold.co/900x700/eff6ff/1d4ed8?text=${encodeURIComponent(text)}`;

const productImage = (name: string) => `/images/products/${slugify(name)}.png`;

const categories = [
  "Điện thoại",
  "Laptop",
  "Tai nghe",
  "Bàn phím",
  "Chuột",
  "Màn hình",
  "Linh kiện PC",
  "Phụ kiện"
];

const brands = [
  "Apple",
  "Samsung",
  "Dell",
  "Asus",
  "Lenovo",
  "Sony",
  "Logitech",
  "MSI",
  "HP",
  "Acer",
  "Razer",
  "Corsair",
  "Kingston",
  "Seagate",
  "Anker",
  "Xiaomi",
  "JBL",
  "LG",
  "Gigabyte",
  "Intel",
  "AMD",
  "TP-Link",
  "Keychron",
  "Ugreen",
  "Baseus",
  "Akko"
];

const sellerSeeds = [
  {
    key: "techzone",
    name: "TechZone Seller",
    email: "seller1@gmail.com",
    phone: "0911111111",
    shopName: "TechZone Store",
    description: "Cửa hàng thiết bị công nghệ và phụ kiện chọn lọc.",
    address: "123 Nguyen Trai, Quan 1, TP.HCM"
  },
  {
    key: "applehub",
    name: "AppleHub Seller",
    email: "applehub@gmail.com",
    phone: "0911111112",
    shopName: "AppleHub Vietnam",
    description: "Shop chuyên iPhone, MacBook, iPad và phụ kiện Apple.",
    address: "45 Le Loi, Quan 1, TP.HCM"
  },
  {
    key: "samsungworld",
    name: "SamsungWorld Seller",
    email: "samsungworld@gmail.com",
    phone: "0911111113",
    shopName: "SamsungWorld",
    description: "Thiết bị Samsung chính hãng cho điện thoại, tablet và âm thanh.",
    address: "88 Cach Mang Thang 8, Quan 3, TP.HCM"
  },
  {
    key: "gaminggear",
    name: "GamingGear Seller",
    email: "gaminggear@gmail.com",
    phone: "0911111114",
    shopName: "Gaming Gear Pro",
    description: "Bàn phím, chuột, tai nghe và laptop gaming hiệu năng cao.",
    address: "12 Nguyen Van Cu, Quan 5, TP.HCM"
  },
  {
    key: "pcmaster",
    name: "PCMaster Seller",
    email: "pcmaster@gmail.com",
    phone: "0911111115",
    shopName: "PC Master",
    description: "Linh kiện PC, CPU, VGA, RAM, SSD và nguồn máy tính.",
    address: "79 Ly Thuong Kiet, Quan 10, TP.HCM"
  },
  {
    key: "soundwave",
    name: "SoundWave Seller",
    email: "soundwave@gmail.com",
    phone: "0911111116",
    shopName: "SoundWave Audio",
    description: "Tai nghe, loa bluetooth và thiết bị âm thanh di động.",
    address: "21 Phan Dang Luu, Binh Thanh, TP.HCM"
  },
  {
    key: "displaypro",
    name: "DisplayPro Seller",
    email: "displaypro@gmail.com",
    phone: "0911111117",
    shopName: "Display Pro",
    description: "Màn hình văn phòng, đồ họa, gaming và phụ kiện hiển thị.",
    address: "66 Nguyen Huu Canh, Binh Thanh, TP.HCM"
  },
  {
    key: "accessoryhub",
    name: "AccessoryHub Seller",
    email: "accessoryhub@gmail.com",
    phone: "0911111118",
    shopName: "Accessory Hub",
    description: "Sạc, cáp, router, webcam, dock và phụ kiện công nghệ.",
    address: "17 Tran Duy Hung, Cau Giay, Ha Noi"
  },
  {
    key: "laptopcenter",
    name: "LaptopCenter Seller",
    email: "laptopcenter@gmail.com",
    phone: "0911111119",
    shopName: "Laptop Center",
    description: "Laptop học tập, văn phòng, đồ họa và gaming.",
    address: "101 Thai Ha, Dong Da, Ha Noi"
  }
] as const;

type ProductSpec = { key: string; value: string };

type ProductSeed = {
  name: string;
  category: string;
  brand: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  sellerKey: string;
  approvalStatus?: ProductApprovalStatus;
  rejectReason?: string | null;
  isFeatured?: boolean;
  warrantyMonths?: number;
  sold?: number;
  rating?: number;
  specs?: ProductSpec[];
};

const defaultSpecs: ProductSpec[] = [
  { key: "Tình trạng", value: "Mới 100%" },
  { key: "Xuất xứ", value: "Chính hãng" },
  { key: "Bảo hành", value: "12 tháng" },
  { key: "Đổi trả", value: "7 ngày theo chính sách shop" }
];

const products: ProductSeed[] = [
  { name: "iPhone 15", category: "Điện thoại", brand: "Apple", price: 22990000, discountPrice: 21490000, stock: 18, sellerKey: "applehub", sold: 96, rating: 4.8 },
  { name: "iPhone 15 Pro Max", category: "Điện thoại", brand: "Apple", price: 34990000, discountPrice: 32990000, stock: 11, sellerKey: "applehub", sold: 75, rating: 4.9 },
  { name: "iPhone 14", category: "Điện thoại", brand: "Apple", price: 19990000, discountPrice: 17490000, stock: 20, sellerKey: "applehub", sold: 112, rating: 4.7 },
  { name: "Apple Magic Trackpad", category: "Phụ kiện", brand: "Apple", price: 3490000, discountPrice: 3190000, stock: 19, sellerKey: "applehub", sold: 34, rating: 4.6 },
  { name: "MacBook Air M2", category: "Laptop", brand: "Apple", price: 27990000, discountPrice: 25990000, stock: 12, sellerKey: "applehub", sold: 64, rating: 4.8 },
  { name: "MacBook Pro M3", category: "Laptop", brand: "Apple", price: 42990000, discountPrice: 39990000, stock: 7, sellerKey: "applehub", sold: 42, rating: 4.9 },
  { name: "Apple AirPods Pro 2", category: "Tai nghe", brand: "Apple", price: 6490000, discountPrice: 5790000, stock: 28, sellerKey: "applehub", sold: 135, rating: 4.8 },

  { name: "Samsung Galaxy S24", category: "Điện thoại", brand: "Samsung", price: 21990000, discountPrice: 19990000, stock: 22, sellerKey: "samsungworld", sold: 88, rating: 4.7 },
  { name: "Samsung Galaxy S24 Ultra", category: "Điện thoại", brand: "Samsung", price: 33990000, discountPrice: 30990000, stock: 9, sellerKey: "samsungworld", sold: 58, rating: 4.8 },
  { name: "Samsung Galaxy A55", category: "Điện thoại", brand: "Samsung", price: 9990000, discountPrice: 8990000, stock: 30, sellerKey: "samsungworld", sold: 121, rating: 4.5 },
  { name: "Samsung Galaxy Z Flip5", category: "Điện thoại", brand: "Samsung", price: 25990000, discountPrice: 22990000, stock: 8, sellerKey: "samsungworld", sold: 39, rating: 4.6 },
  { name: "Samsung Galaxy Tab S9", category: "Phụ kiện", brand: "Samsung", price: 19990000, discountPrice: 18490000, stock: 14, sellerKey: "samsungworld", sold: 51, rating: 4.7 },
  { name: "Samsung Galaxy Buds2 Pro", category: "Tai nghe", brand: "Samsung", price: 4990000, discountPrice: 3890000, stock: 32, sellerKey: "samsungworld", sold: 89, rating: 4.5 },

  { name: "Dell XPS 13", category: "Laptop", brand: "Dell", price: 32990000, discountPrice: 30990000, stock: 8, sellerKey: "laptopcenter", sold: 44, rating: 4.7 },
  { name: "Dell Inspiron 15", category: "Laptop", brand: "Dell", price: 16990000, discountPrice: 15490000, stock: 18, sellerKey: "laptopcenter", sold: 67, rating: 4.4 },
  { name: "HP Spectre x360", category: "Laptop", brand: "HP", price: 34990000, discountPrice: 32990000, stock: 9, sellerKey: "laptopcenter", sold: 31, rating: 4.6 },
  { name: "Acer Swift Go 14", category: "Laptop", brand: "Acer", price: 18990000, discountPrice: 17490000, stock: 15, sellerKey: "laptopcenter", sold: 49, rating: 4.4 },
  { name: "Lenovo ThinkPad X1 Carbon", category: "Laptop", brand: "Lenovo", price: 38990000, discountPrice: 35990000, stock: 9, sellerKey: "laptopcenter", sold: 38, rating: 4.8 },
  { name: "Lenovo Legion 5 Pro", category: "Laptop", brand: "Lenovo", price: 36990000, discountPrice: 33990000, stock: 10, sellerKey: "laptopcenter", sold: 55, rating: 4.7 },
  { name: "Asus ZenBook 14 OLED", category: "Laptop", brand: "Asus", price: 24990000, discountPrice: 22990000, stock: 13, sellerKey: "laptopcenter", sold: 47, rating: 4.6 },

  { name: "Asus ROG Strix G16", category: "Laptop", brand: "Asus", price: 39990000, discountPrice: 36990000, stock: 10, sellerKey: "gaminggear", sold: 62, rating: 4.8 },
  { name: "Logitech G Pro Keyboard", category: "Bàn phím", brand: "Logitech", price: 3290000, discountPrice: 2890000, stock: 35, sellerKey: "gaminggear", sold: 141, rating: 4.7 },
  { name: "Logitech G502 X", category: "Chuột", brand: "Logitech", price: 1890000, discountPrice: 1590000, stock: 44, sellerKey: "gaminggear", sold: 156, rating: 4.7 },
  { name: "Logitech G Pro X Headset", category: "Tai nghe", brand: "Logitech", price: 3290000, discountPrice: 2990000, stock: 23, sellerKey: "gaminggear", sold: 83, rating: 4.5 },
  { name: "Razer DeathAdder V3", category: "Chuột", brand: "Razer", price: 1890000, discountPrice: 1690000, stock: 41, sellerKey: "gaminggear", sold: 97, rating: 4.6 },
  { name: "Razer BlackWidow V4", category: "Bàn phím", brand: "Razer", price: 4490000, discountPrice: 3990000, stock: 17, sellerKey: "gaminggear", sold: 42, rating: 4.5 },
  { name: "Razer BlackShark V2", category: "Tai nghe", brand: "Razer", price: 2490000, discountPrice: 2190000, stock: 27, sellerKey: "gaminggear", sold: 76, rating: 4.4 },
  { name: "Corsair K70 RGB", category: "Bàn phím", brand: "Corsair", price: 3890000, discountPrice: 3490000, stock: 19, sellerKey: "gaminggear", sold: 52, rating: 4.5 },
  { name: "Asus ROG Azoth", category: "Bàn phím", brand: "Asus", price: 5490000, discountPrice: 4990000, stock: 12, sellerKey: "gaminggear", sold: 26, rating: 4.6 },
  { name: "Asus ROG Keris", category: "Chuột", brand: "Asus", price: 1690000, discountPrice: 1490000, stock: 33, sellerKey: "gaminggear", sold: 65, rating: 4.4 },
  { name: "MSI Clutch GM41", category: "Chuột", brand: "MSI", price: 1290000, discountPrice: 1090000, stock: 39, sellerKey: "gaminggear", sold: 71, rating: 4.3 },

  { name: "Sony WH-1000XM5", category: "Tai nghe", brand: "Sony", price: 8490000, discountPrice: 7290000, stock: 30, sellerKey: "soundwave", sold: 128, rating: 4.8 },
  { name: "Sony WF-1000XM5", category: "Tai nghe", brand: "Sony", price: 6990000, discountPrice: 6290000, stock: 24, sellerKey: "soundwave", sold: 83, rating: 4.7 },
  { name: "Sony Pulse 3D", category: "Tai nghe", brand: "Sony", price: 2490000, discountPrice: 2190000, stock: 21, sellerKey: "soundwave", sold: 61, rating: 4.4 },
  { name: "JBL Tune 770NC", category: "Tai nghe", brand: "JBL", price: 2990000, discountPrice: 2490000, stock: 36, sellerKey: "soundwave", sold: 74, rating: 4.3 },
  { name: "JBL Flip 6", category: "Tai nghe", brand: "JBL", price: 3190000, discountPrice: 2790000, stock: 30, sellerKey: "soundwave", sold: 91, rating: 4.5 },
  { name: "Anker Soundcore Liberty 4", category: "Tai nghe", brand: "Anker", price: 2790000, discountPrice: 2290000, stock: 42, sellerKey: "soundwave", sold: 86, rating: 4.4 },

  { name: "MSI Monitor 27 inch", category: "Màn hình", brand: "MSI", price: 6490000, discountPrice: 5990000, stock: 16, sellerKey: "displaypro", sold: 68, rating: 4.5 },
  { name: "LG UltraGear 27GP850", category: "Màn hình", brand: "LG", price: 8990000, discountPrice: 8290000, stock: 14, sellerKey: "displaypro", sold: 54, rating: 4.6 },
  { name: "Dell UltraSharp U2723QE", category: "Màn hình", brand: "Dell", price: 13990000, discountPrice: 12990000, stock: 8, sellerKey: "displaypro", sold: 29, rating: 4.7 },
  { name: "Samsung Odyssey G5", category: "Màn hình", brand: "Samsung", price: 7490000, discountPrice: 6890000, stock: 17, sellerKey: "displaypro", sold: 78, rating: 4.4 },
  { name: "Asus ProArt PA278QV", category: "Màn hình", brand: "Asus", price: 8590000, discountPrice: 7990000, stock: 10, sellerKey: "displaypro", sold: 32, rating: 4.5 },
  { name: "Gigabyte M27Q", category: "Màn hình", brand: "Gigabyte", price: 7990000, discountPrice: 7290000, stock: 12, sellerKey: "displaypro", sold: 45, rating: 4.5 },
  { name: "Lenovo ThinkVision P27h", category: "Màn hình", brand: "Lenovo", price: 9990000, discountPrice: 9290000, stock: 9, sellerKey: "displaypro", sold: 23, rating: 4.4 },
  { name: "Acer Nitro XV272U", category: "Màn hình", brand: "Acer", price: 6990000, discountPrice: 6490000, stock: 18, sellerKey: "displaypro", sold: 59, rating: 4.3 },
  { name: "HP M27fwa", category: "Màn hình", brand: "HP", price: 4990000, discountPrice: 4590000, stock: 22, sellerKey: "displaypro", sold: 40, rating: 4.2 },

  { name: "Intel Core i5-14400F", category: "Linh kiện PC", brand: "Intel", price: 5190000, discountPrice: 4890000, stock: 25, sellerKey: "pcmaster", sold: 98, rating: 4.6 },
  { name: "Intel Core i7-14700K", category: "Linh kiện PC", brand: "Intel", price: 10990000, discountPrice: 10490000, stock: 13, sellerKey: "pcmaster", sold: 57, rating: 4.8 },
  { name: "AMD Ryzen 5 7600", category: "Linh kiện PC", brand: "AMD", price: 5490000, discountPrice: 5090000, stock: 22, sellerKey: "pcmaster", sold: 84, rating: 4.6 },
  { name: "AMD Ryzen 7 7800X3D", category: "Linh kiện PC", brand: "AMD", price: 10990000, discountPrice: 9990000, stock: 11, sellerKey: "pcmaster", sold: 63, rating: 4.9 },
  { name: "MSI GeForce RTX 4060", category: "Linh kiện PC", brand: "MSI", price: 8990000, discountPrice: 8490000, stock: 15, sellerKey: "pcmaster", sold: 76, rating: 4.5 },
  { name: "Gigabyte GeForce RTX 4070", category: "Linh kiện PC", brand: "Gigabyte", price: 16990000, discountPrice: 15990000, stock: 7, sellerKey: "pcmaster", sold: 35, rating: 4.7 },
  { name: "Corsair Vengeance DDR5 32GB", category: "Linh kiện PC", brand: "Corsair", price: 3290000, discountPrice: 2990000, stock: 35, sellerKey: "pcmaster", sold: 122, rating: 4.6 },
  { name: "Kingston NV2 1TB SSD", category: "Linh kiện PC", brand: "Kingston", price: 1890000, discountPrice: 1590000, stock: 60, sellerKey: "pcmaster", sold: 210, rating: 4.5 },
  { name: "Seagate Barracuda 2TB HDD", category: "Linh kiện PC", brand: "Seagate", price: 1690000, discountPrice: 1490000, stock: 48, sellerKey: "pcmaster", sold: 144, rating: 4.3 },
  { name: "Corsair RM750e PSU", category: "Linh kiện PC", brand: "Corsair", price: 2890000, discountPrice: 2590000, stock: 26, sellerKey: "pcmaster", sold: 78, rating: 4.6 },
  { name: "Asus TUF B650M-Plus", category: "Linh kiện PC", brand: "Asus", price: 4790000, discountPrice: 4390000, stock: 16, sellerKey: "pcmaster", sold: 41, rating: 4.5 },
  { name: "MSI MAG B760M Mortar", category: "Linh kiện PC", brand: "MSI", price: 4290000, discountPrice: 3990000, stock: 18, sellerKey: "pcmaster", sold: 49, rating: 4.4 },

  { name: "Logitech MX Master 3S", category: "Chuột", brand: "Logitech", price: 2490000, discountPrice: 2190000, stock: 40, sellerKey: "accessoryhub", sold: 177, rating: 4.8 },
  { name: "Logitech MX Keys S", category: "Bàn phím", brand: "Logitech", price: 2790000, discountPrice: 2490000, stock: 36, sellerKey: "accessoryhub", sold: 112, rating: 4.6 },
  { name: "Logitech Brio Webcam", category: "Phụ kiện", brand: "Logitech", price: 4790000, discountPrice: 4290000, stock: 14, sellerKey: "accessoryhub", sold: 36, rating: 4.5 },
  { name: "Anker 737 Power Bank", category: "Phụ kiện", brand: "Anker", price: 3490000, discountPrice: 3190000, stock: 30, sellerKey: "accessoryhub", sold: 92, rating: 4.6 },
  { name: "Ugreen 100W GaN Charger", category: "Phụ kiện", brand: "Ugreen", price: 1290000, discountPrice: 1090000, stock: 55, sellerKey: "accessoryhub", sold: 189, rating: 4.5 },
  { name: "Baseus USB-C Cable 100W", category: "Phụ kiện", brand: "Baseus", price: 290000, discountPrice: 229000, stock: 120, sellerKey: "accessoryhub", sold: 340, rating: 4.4 },
  { name: "TP-Link Archer AX55", category: "Phụ kiện", brand: "TP-Link", price: 1890000, discountPrice: 1690000, stock: 28, sellerKey: "accessoryhub", sold: 73, rating: 4.4 },
  { name: "Xiaomi Mi Router AX3000", category: "Phụ kiện", brand: "Xiaomi", price: 1490000, discountPrice: 1290000, stock: 32, sellerKey: "accessoryhub", sold: 94, rating: 4.3 },
  { name: "Dell USB-C Dock WD19", category: "Phụ kiện", brand: "Dell", price: 4290000, discountPrice: 3890000, stock: 12, sellerKey: "accessoryhub", sold: 28, rating: 4.4 },
  { name: "Lenovo 65W USB-C Adapter", category: "Phụ kiện", brand: "Lenovo", price: 890000, discountPrice: 790000, stock: 45, sellerKey: "accessoryhub", sold: 105, rating: 4.3 },
  { name: "Razer Kiyo Webcam", category: "Phụ kiện", brand: "Razer", price: 2490000, discountPrice: 2190000, stock: 16, sellerKey: "accessoryhub", sold: 33, rating: 4.3 },

  { name: "Xiaomi 14", category: "Điện thoại", brand: "Xiaomi", price: 22990000, discountPrice: 20990000, stock: 17, sellerKey: "techzone", sold: 48, rating: 4.5 },
  { name: "Xiaomi Redmi Note 13 Pro", category: "Điện thoại", brand: "Xiaomi", price: 7490000, discountPrice: 6790000, stock: 38, sellerKey: "techzone", sold: 132, rating: 4.4 },
  { name: "Xiaomi Pad 6", category: "Phụ kiện", brand: "Xiaomi", price: 8990000, discountPrice: 7990000, stock: 20, sellerKey: "techzone", sold: 53, rating: 4.4 },
  { name: "TechZone Gaming Mouse", category: "Chuột", brand: "Logitech", price: 890000, discountPrice: 790000, stock: 35, sellerKey: "techzone", sold: 72, rating: 4.3 },
  { name: "TechZone 27 inch IPS Monitor", category: "Màn hình", brand: "MSI", price: 5190000, discountPrice: 4890000, stock: 11, sellerKey: "techzone", sold: 29, rating: 4.2 },
  { name: "TechZone USB-C Hub Pro", category: "Phụ kiện", brand: "Dell", price: 690000, discountPrice: null, stock: 50, sellerKey: "techzone", approvalStatus: ProductApprovalStatus.PENDING, isFeatured: false },
  { name: "TechZone Mechanical Keyboard", category: "Bàn phím", brand: "Asus", price: 1590000, discountPrice: 1390000, stock: 24, sellerKey: "techzone", approvalStatus: ProductApprovalStatus.PENDING, isFeatured: false },
  {
    name: "TechZone Refurbished Laptop",
    category: "Laptop",
    brand: "Lenovo",
    price: 8990000,
    discountPrice: 7990000,
    stock: 4,
    sellerKey: "techzone",
    approvalStatus: ProductApprovalStatus.REJECTED,
    rejectReason: "Can bo sung anh that va thong tin bao hanh ro rang.",
    isFeatured: false
  },

  { name: "Keychron K2 V2", category: "Bàn phím", brand: "Keychron", price: 2190000, discountPrice: 1990000, stock: 28, sellerKey: "techzone", sold: 88, rating: 4.5 },
  { name: "Keychron K8 Pro", category: "Bàn phím", brand: "Keychron", price: 2890000, discountPrice: 2590000, stock: 22, sellerKey: "techzone", sold: 64, rating: 4.5 },
  { name: "Akko 3087 Horizon", category: "Bàn phím", brand: "Akko", price: 1690000, discountPrice: 1490000, stock: 25, sellerKey: "techzone", sold: 59, rating: 4.4 },
  { name: "MSI Vigor GK50", category: "Bàn phím", brand: "MSI", price: 1490000, discountPrice: 1290000, stock: 31, sellerKey: "techzone", sold: 45, rating: 4.2 },
  { name: "Corsair Harpoon RGB", category: "Chuột", brand: "Corsair", price: 790000, discountPrice: 690000, stock: 52, sellerKey: "techzone", sold: 116, rating: 4.2 },
  { name: "Lenovo ThinkPad Bluetooth Mouse", category: "Chuột", brand: "Lenovo", price: 690000, discountPrice: 590000, stock: 33, sellerKey: "techzone", sold: 57, rating: 4.1 },
  { name: "Dell Premier Rechargeable Mouse", category: "Chuột", brand: "Dell", price: 1190000, discountPrice: 990000, stock: 27, sellerKey: "techzone", sold: 38, rating: 4.2 },
  { name: "HP 930 Creator Mouse", category: "Chuột", brand: "HP", price: 1390000, discountPrice: 1190000, stock: 24, sellerKey: "techzone", sold: 36, rating: 4.3 }
];

async function createProduct({
  name,
  categoryId,
  brandId,
  price,
  discountPrice,
  stock,
  sellerId,
  approvalStatus,
  rejectReason,
  isFeatured,
  warrantyMonths,
  sold,
  rating,
  specs,
  approvedById
}: {
  name: string;
  categoryId: number;
  brandId: number;
  price: number;
  discountPrice: number | null;
  stock: number;
  sellerId: number;
  approvalStatus: ProductApprovalStatus;
  rejectReason?: string | null;
  isFeatured?: boolean;
  warrantyMonths?: number;
  sold?: number;
  rating?: number;
  specs?: ProductSpec[];
  approvedById?: number;
}) {
  const imageUrl = productImage(name);
  return prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description: `${name} là sản phẩm công nghệ chính hãng, được bán bởi shop đã duyệt trên ElectroHub.`,
      price,
      discountPrice,
      stock,
      image: imageUrl,
      images: [imageUrl],
      categoryId,
      brandId,
      sellerId,
      approvalStatus,
      rejectReason: rejectReason || null,
      isActive: approvalStatus === ProductApprovalStatus.APPROVED,
      approvedAt: approvalStatus === ProductApprovalStatus.APPROVED ? new Date() : null,
      approvedById: approvalStatus === ProductApprovalStatus.APPROVED ? approvedById : null,
      warrantyMonths: warrantyMonths ?? 12,
      sold: sold ?? 0,
      rating: rating ?? 0,
      isFeatured: isFeatured ?? price > 7000000,
      specifications: {
        create: specs?.length ? specs : defaultSpecs
      }
    }
  });
}

async function main() {
  await prisma.bulkUploadItem.deleteMany();
  await prisma.bulkUploadBatch.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.subOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@gmail.com",
      password,
      role: Role.ADMIN,
      cart: { create: {} }
    }
  });

  const buyers = await Promise.all(
    ["user1@gmail.com", "user2@gmail.com", "user3@gmail.com", "user4@gmail.com"].map((email, index) =>
      prisma.user.create({
        data: {
          name: email.split("@")[0],
          email,
          password,
          role: Role.USER,
          phone: `090000000${index + 1}`,
          cart: { create: {} },
          addresses: {
            create: {
              label: "Nhà",
              fullName: `Khách hàng ${index + 1}`,
              phone: `090000000${index + 1}`,
              address: `${10 + index} Nguyen Hue`,
              city: index % 2 === 0 ? "TP.HCM" : "Ha Noi",
              country: "Vietnam",
              isDefault: true
            }
          }
        }
      })
    )
  );

  const sellerMap = new Map<string, number>();
  for (const seller of sellerSeeds) {
    const user = await prisma.user.create({
      data: {
        name: seller.name,
        email: seller.email,
        password,
        role: Role.SELLER,
        phone: seller.phone,
        cart: { create: {} }
      }
    });

    const profile = await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        shopName: seller.shopName,
        shopSlug: slugify(seller.shopName),
        shopDescription: seller.description,
        shopLogo: image(`${seller.shopName} Logo`),
        shopBanner: image(seller.shopName),
        businessPhone: seller.phone,
        businessEmail: seller.email,
        pickupAddress: seller.address,
        status: SellerStatus.APPROVED
      }
    });
    sellerMap.set(seller.key, profile.id);
  }

  const categoryMap = new Map<string, number>();
  for (const name of categories) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: `Danh mục ${name.toLowerCase()} chính hãng`,
        image: image(name)
      }
    });
    categoryMap.set(name, category.id);
  }

  const brandMap = new Map<string, number>();
  for (const name of brands) {
    const brand = await prisma.brand.create({
      data: {
        name,
        slug: slugify(name),
        description: `Thiết bị công nghệ thương hiệu ${name}`,
        logo: image(name)
      }
    });
    brandMap.set(name, brand.id);
  }

  const createdProducts = [];
  for (const product of products) {
    const categoryId = categoryMap.get(product.category);
    const brandId = brandMap.get(product.brand);
    const sellerId = sellerMap.get(product.sellerKey);

    if (!categoryId) throw new Error(`Missing category ${product.category}`);
    if (!brandId) throw new Error(`Missing brand ${product.brand}`);
    if (!sellerId) throw new Error(`Missing seller ${product.sellerKey}`);

    const approvalStatus = product.approvalStatus ?? ProductApprovalStatus.APPROVED;
    const created = await createProduct({
      name: product.name,
      categoryId,
      brandId,
      price: product.price,
      discountPrice: product.discountPrice,
      stock: product.stock,
      sellerId,
      approvalStatus,
      rejectReason: product.rejectReason,
      isFeatured: product.isFeatured,
      warrantyMonths: product.warrantyMonths,
      sold: product.sold,
      rating: product.rating,
      specs: product.specs,
      approvedById: admin.id
    });
    createdProducts.push(created);
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysLater = new Date(now);
  sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);

  for (const seller of sellerSeeds) {
    const sellerId = sellerMap.get(seller.key)!;
    await prisma.voucher.createMany({
      data: [
        {
          code: `${seller.key.toUpperCase()}10`,
          type: VoucherType.PERCENT,
          value: 10,
          minOrderValue: 1000000,
          maxDiscount: 500000,
          sellerId,
          startDate: thirtyDaysAgo,
          endDate: sixtyDaysLater,
          usageLimit: 200
        },
        {
          code: `${seller.key.toUpperCase()}50K`,
          type: VoucherType.FIXED,
          value: 50000,
          minOrderValue: 500000,
          maxDiscount: null,
          sellerId,
          startDate: thirtyDaysAgo,
          endDate: sixtyDaysLater,
          usageLimit: 300
        }
      ]
    });
  }

  const approvedProducts = createdProducts.filter((product) => product.approvalStatus === ProductApprovalStatus.APPROVED);
  for (const [index, product] of approvedProducts.slice(0, 40).entries()) {
    const reviewer = buyers[index % buyers.length];
    await prisma.review.create({
      data: {
        userId: reviewer.id,
        productId: product.id,
        rating: Math.max(4, Math.round(product.rating || 4)),
        comment: "Sản phẩm đúng mô tả, đóng gói cẩn thận và giao hàng nhanh.",
        isVerified: true
      }
    });
  }

  const carts = await prisma.cart.findMany({ where: { userId: { in: buyers.map((buyer) => buyer.id) } } });
  for (const [index, cart] of carts.entries()) {
    await prisma.cartItem.createMany({
      data: approvedProducts.slice(index * 3, index * 3 + 3).map((product, itemIndex) => ({
        cartId: cart.id,
        productId: product.id,
        quantity: itemIndex + 1
      }))
    });
  }

  for (const [index, buyer] of buyers.entries()) {
    await prisma.wishlist.createMany({
      data: approvedProducts.slice(10 + index * 4, 14 + index * 4).map((product) => ({
        userId: buyer.id,
        productId: product.id
      }))
    });
  }

  console.log(
    `Seed data created successfully: ${sellerSeeds.length} shops, ${products.length} products, ${approvedProducts.length} approved products.`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

