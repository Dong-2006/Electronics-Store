import bcrypt from "bcryptjs";
import { PrismaClient, ProductApprovalStatus, Role, SellerStatus } from "@prisma/client";
import { slugify } from "../src/utils/slug";

const prisma = new PrismaClient();

const image = (text: string) =>
  `https://placehold.co/900x700/eff6ff/1d4ed8?text=${encodeURIComponent(text)}`;

const categories = [
  "Dien thoai",
  "Laptop",
  "Tai nghe",
  "Ban phim",
  "Chuot",
  "Man hinh",
  "Linh kien PC",
  "Phu kien"
];

const brands = ["Apple", "Samsung", "Dell", "Asus", "Lenovo", "Sony", "Logitech", "MSI"];

const products = [
  ["iPhone 15", "Dien thoai", "Apple", 22990000, 21490000, 18, "A16 Bionic", "6GB", "128GB", "6.1 inch OLED", "iOS 17"],
  ["Samsung Galaxy S24", "Dien thoai", "Samsung", 21990000, 19990000, 22, "Exynos 2400", "8GB", "256GB", "6.2 inch AMOLED", "Android 14"],
  ["MacBook Air M2", "Laptop", "Apple", 27990000, 25990000, 12, "Apple M2", "8GB", "256GB", "13.6 inch Retina", "macOS"],
  ["Dell XPS 13", "Laptop", "Dell", 32990000, 30990000, 8, "Intel Core i7", "16GB", "512GB", "13.4 inch FHD+", "Windows 11"],
  ["Asus ROG Strix G16", "Laptop", "Asus", 39990000, 36990000, 10, "Intel Core i7", "16GB", "1TB", "16 inch 165Hz", "Windows 11"],
  ["Lenovo ThinkPad X1 Carbon", "Laptop", "Lenovo", 38990000, 35990000, 9, "Intel Core i7", "16GB", "1TB", "14 inch 2.8K", "Windows 11 Pro"],
  ["Sony WH-1000XM5", "Tai nghe", "Sony", 8490000, 7290000, 30, "Bluetooth 5.2", "ANC", "30 gio", "Over-ear", "USB-C"],
  ["Logitech MX Master 3S", "Chuot", "Logitech", 2490000, 2190000, 40, "Darkfield", "8000 DPI", "70 ngay", "Khong day", "USB-C"],
  ["Logitech G Pro Keyboard", "Ban phim", "Logitech", 3290000, 2890000, 35, "GX Blue", "TKL", "RGB", "USB-C", "Windows/macOS"],
  ["MSI Monitor 27 inch", "Man hinh", "MSI", 6490000, 5990000, 16, "IPS", "27 inch", "2K", "170Hz", "HDMI/DP"],
  ["Apple AirPods Pro 2", "Tai nghe", "Apple", 6490000, 5790000, 28, "H2", "ANC", "6 gio", "In-ear", "MagSafe"],
  ["Samsung Galaxy Tab S9", "Phu kien", "Samsung", 19990000, 18490000, 14, "Snapdragon 8 Gen 2", "8GB", "128GB", "11 inch AMOLED", "Android"]
] as const;

const sellerProducts = [
  ["TechZone Gaming Mouse", "Chuot", "Logitech", 890000, 790000, 35, ProductApprovalStatus.APPROVED, null],
  ["TechZone 27 inch IPS Monitor", "Man hinh", "MSI", 5190000, 4890000, 11, ProductApprovalStatus.APPROVED, null],
  ["TechZone USB-C Hub Pro", "Phu kien", "Dell", 690000, null, 50, ProductApprovalStatus.PENDING, null],
  ["TechZone Mechanical Keyboard", "Ban phim", "Asus", 1590000, 1390000, 24, ProductApprovalStatus.PENDING, null],
  ["TechZone Refurbished Laptop", "Laptop", "Lenovo", 8990000, 7990000, 4, ProductApprovalStatus.REJECTED, "Can bo sung anh that va thong tin bao hanh ro rang."]
] as const;

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
  isFeatured
}: {
  name: string;
  categoryId: number;
  brandId: number;
  price: number;
  discountPrice: number | null;
  stock: number;
  sellerId?: number;
  approvalStatus: ProductApprovalStatus;
  rejectReason?: string | null;
  isFeatured?: boolean;
}) {
  await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description: `${name} la san pham dien tu chinh hang, phu hop nhu cau hoc tap, lam viec va giai tri.`,
      price,
      discountPrice,
      stock,
      image: image(name),
      images: [image(`${name} 1`), image(`${name} 2`)],
      categoryId,
      brandId,
      sellerId,
      approvalStatus,
      rejectReason: rejectReason || null,
      isActive: approvalStatus === ProductApprovalStatus.APPROVED,
      approvedAt: approvalStatus === ProductApprovalStatus.APPROVED ? new Date() : null,
      warrantyMonths: 12,
      isFeatured: isFeatured ?? Number(price) > 7000000,
      specifications: {
        create: [
          { key: "CPU", value: "Dang cap nhat" },
          { key: "RAM", value: "Dang cap nhat" },
          { key: "Luu tru", value: "Dang cap nhat" },
          { key: "Man hinh", value: "Dang cap nhat" },
          { key: "Bao hanh", value: "12 thang" }
        ]
      }
    }
  });
}

async function main() {
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("123456", 10);
  await prisma.user.create({
    data: {
      name: "Administrator",
      email: "admin@gmail.com",
      password,
      role: Role.ADMIN,
      cart: { create: {} }
    }
  });

  for (const email of ["user1@gmail.com", "user2@gmail.com"]) {
    await prisma.user.create({
      data: {
        name: email.split("@")[0],
        email,
        password,
        role: Role.USER,
        phone: "0900000000",
        cart: { create: {} }
      }
    });
  }

  const sellerUser = await prisma.user.create({
    data: {
      name: "TechZone Seller",
      email: "seller1@gmail.com",
      password,
      role: Role.SELLER,
      phone: "0911111111",
      cart: { create: {} }
    }
  });

  const sellerProfile = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      shopName: "TechZone Store",
      shopSlug: "techzone-store",
      shopDescription: "Cua hang thiet bi cong nghe va phu kien chon loc.",
      shopLogo: image("TechZone Logo"),
      shopBanner: image("TechZone Store"),
      businessPhone: "0911111111",
      businessEmail: "seller1@gmail.com",
      pickupAddress: "123 Nguyen Trai, Quan 1, TP.HCM",
      status: SellerStatus.APPROVED
    }
  });

  const categoryMap = new Map<string, number>();
  for (const name of categories) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: `Danh muc ${name.toLowerCase()} chinh hang`,
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
        description: `Thiet bi dien tu thuong hieu ${name}`,
        logo: image(name)
      }
    });
    brandMap.set(name, brand.id);
  }

  for (const [name, categoryName, brandName, price, discountPrice, stock] of products) {
    await createProduct({
      name,
      categoryId: categoryMap.get(categoryName)!,
      brandId: brandMap.get(brandName)!,
      price,
      discountPrice,
      stock,
      approvalStatus: ProductApprovalStatus.APPROVED
    });
  }

  for (const [name, categoryName, brandName, price, discountPrice, stock, approvalStatus, rejectReason] of sellerProducts) {
    await createProduct({
      name,
      categoryId: categoryMap.get(categoryName)!,
      brandId: brandMap.get(brandName)!,
      price,
      discountPrice,
      stock,
      sellerId: sellerProfile.id,
      approvalStatus,
      rejectReason,
      isFeatured: approvalStatus === ProductApprovalStatus.APPROVED
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed data created successfully");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
