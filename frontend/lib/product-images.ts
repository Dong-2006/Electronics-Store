import { Product } from "@/types";

const localProductSlugs = new Set([
  "iphone-15",
  "samsung-galaxy-s24",
  "macbook-air-m2",
  "dell-xps-13",
  "asus-rog-strix-g16",
  "lenovo-thinkpad-x1-carbon",
  "sony-wh-1000xm5",
  "logitech-mx-master-3s",
  "logitech-g-pro-keyboard",
  "msi-monitor-27-inch",
  "apple-airpods-pro-2",
  "samsung-galaxy-tab-s9",
  "techzone-gaming-mouse",
  "techzone-27-inch-ips-monitor",
  "techzone-usb-c-hub-pro",
  "techzone-mechanical-keyboard",
  "techzone-refurbished-laptop"
]);

export function getProductImage(product: Pick<Product, "slug" | "image">) {
  if (localProductSlugs.has(product.slug)) {
    return `/images/products/${product.slug}.png`;
  }

  return product.image;
}
