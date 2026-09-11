import type { Metadata } from "next";
import { listProducts, listFlavors } from "@/lib/repository";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Shop every Ghost Energy flavor",
  description:
    "Every Ghost Energy and Hydration flavor we stock, filterable by flavor profile, caffeine and pack size. Singles, 12-packs and cases.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ line?: string }>;
}) {
  const [{ line }, products, flavors] = await Promise.all([
    searchParams,
    listProducts(),
    listFlavors(),
  ]);

  return (
    <div className="shell-wide pb-24 pt-16 lg:pt-24">
      <header className="max-w-3xl">
        <Eyebrow>The shelf</Eyebrow>
        <h1 className="type-display mt-5">Everything we stock.</h1>
        <p className="type-lead mt-6 max-w-xl">
          Nineteen products across the energy and caffeine-free lines. Filter by how
          you actually choose — sour or sweet, single or case, caffeinated or not.
        </p>
      </header>

      <div className="mt-14 border-t border-line pt-10 lg:mt-20">
        <ShopBrowser products={products} flavors={flavors} initialLine={line} />
      </div>
    </div>
  );
}
