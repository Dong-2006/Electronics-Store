import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { slugify } from "../src/utils/slug";

const prisma = new PrismaClient();

const image = (text: string) =>
  `https://placehold.co/900x700/eff6ff/1d4ed8?text=${encodeURIComponent(text)}`;

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

const brands = ["Apple", "Samsung", "Dell", "Asus", "Lenovo", "Sony", "Logitech", "MSI"];

const products = [
  ["iPhone 15", "Điện thoại", "Apple", 22990000, 21490000, 18, "A16 Bionic", "6GB", "128GB", "6.1 inch OLED", "iOS 17"],
  ["Samsung Galaxy S24", "Điện thoại", "Samsung", 21990000, 19990000, 22, "Exynos 2400", "8GB", "256GB", "6.2 inch AMOLED", "Android 14"],
  ["MacBook Air M2", "Laptop", "Apple", 27990000, 25990000, 12, "Apple M2", "8GB", "256GB", "13.6 inch Retina", "macOS"],
  ["Dell XPS 13", "Laptop", "Dell", 32990000, 30990000, 8, "Intel Core i7", "16GB", "512GB", "13.4 inch FHD+", "Windows 11"],
  ["Asus ROG Strix G16", "Laptop", "Asus", 39990000, 36990000, 10, "Intel Core i7", "16GB", "1TB", "16 inch 165Hz", "Windows 11"],
  ["Lenovo ThinkPad X1 Carbon", "Laptop", "Lenovo", 38990000, 35990000, 9, "Intel Core i7", "16GB", "1TB", "14 inch 2.8K", "Windows 11 Pro"],
  ["Sony WH-1000XM5", "Tai nghe", "Sony", 8490000, 7290000, 30, "Bluetooth 5.2", "ANC", "30 giờ", "Over-ear", "USB-C"],
  ["Logitech MX Master 3S", "Chuột", "Logitech", 2490000, 2190000, 40, "Darkfield", "8000 DPI", "70 ngày", "Không dây", "USB-C"],
  ["Logitech G Pro Keyboard", "Bàn phím", "Logitech", 3290000, 2890000, 35, "GX Blue", "TKL", "RGB", "USB-C", "Windows/macOS"],
  ["MSI Monitor 27 inch", "Màn hình", "MSI", 6490000, 5990000, 16, "IPS", "27 inch", "2K", "170Hz", "HDMI/DP"],
  ["Apple AirPods Pro 2", "Tai nghe", "Apple", 6490000, 5790000, 28, "H2", "ANC", "6 giờ", "In-ear", "MagSafe"],
  ["Samsung Galaxy Tab S9", "Phụ kiện", "Samsung", 19990000, 18490000, 14, "Snapdragon 8 Gen 2", "8GB", "128GB", "11 inch AMOLED", "Android"],
  ["Dell UltraSharp U2723QE", "Màn hình", "Dell", 13990000, 12990000, 11, "IPS Black", "27 inch", "4K", "60Hz", "USB-C Hub"],
  ["Asus TUF Gaming Mouse M4", "Chuột", "Asus", 990000, 790000, 45, "Optical", "12000 DPI", "6 nút", "Có dây", "USB-A"],
  ["Lenovo Legion K500", "Bàn phím", "Lenovo", 1790000, 1490000, 24, "Mechanical", "Full-size", "RGB", "Có dây", "Windows"],
  ["MSI GeForce RTX 4060", "Linh kiện PC", "MSI", 8990000, 8390000, 13, "RTX 4060", "8GB GDDR6", "PCIe 4.0", "2 fan", "HDMI/DP"],
  ["Samsung 990 EVO SSD 1TB", "Linh kiện PC", "Samsung", 2690000, 2390000, 50, "NVMe", "1TB", "PCIe 4.0", "5000MB/s", "M.2 2280"],
  ["Sony WF-1000XM5", "Tai nghe", "Sony", 6990000, 6290000, 27, "Bluetooth 5.3", "ANC", "8 giờ", "In-ear", "USB-C"],
  ["Apple Magic Keyboard", "Bàn phím", "Apple", 2890000, null, 20, "Scissor", "Compact", "Bluetooth", "Lightning", "macOS/iPadOS"],
  ["Asus ProArt PA278QV", "Màn hình", "Asus", 7990000, 7290000, 15, "IPS", "27 inch", "2K", "75Hz", "HDMI/DP"]
] as const;

async function main() {
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.product.deleteMany();
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

  for (const email of ["user1@gmail.com", "user2@gmail.com", "user3@gmail.com"]) {
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
        description: `Thiết bị điện tử thương hiệu ${name}`,
        logo: image(name)
      }
    });
    brandMap.set(name, brand.id);
  }

  for (const [name, categoryName, brandName, price, discountPrice, stock, cpu, ram, ssd, screen, os] of products) {
    await prisma.product.create({
      data: {
        name,
        slug: slugify(name),
        description: `${name} là sản phẩm điện tử chính hãng, phù hợp nhu cầu học tập, làm việc và giải trí.`,
        price,
        discountPrice,
        stock,
        image: image(name),
        images: [image(`${name} 1`), image(`${name} 2`)],
        categoryId: categoryMap.get(categoryName)!,
        brandId: brandMap.get(brandName)!,
        warrantyMonths: 12,
        isFeatured: Number(price) > 7000000,
        specifications: {
          create: [
            { key: "CPU", value: String(cpu) },
            { key: "RAM", value: String(ram) },
            { key: "SSD", value: String(ssd) },
            { key: "Màn hình", value: String(screen) },
            { key: "Hệ điều hành", value: String(os) },
            { key: "Bảo hành", value: "12 tháng" }
          ]
        }
      }
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
