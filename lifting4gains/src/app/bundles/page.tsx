import type { Metadata } from "next";
import { listFlavors } from "@/lib/repository";
import { BundleBuilder } from "@/components/bundles/BundleBuilder";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Build your own Ghost variety pack",
  description:
    "Mix any Ghost Energy flavors into one pack. The per-can price drops as you add — from $3.49 down to $2.71 at 24 cans.",
  alternates: { canonical: "/bundles" },
};

export default async function BundlesPage() {
  const flavors = await listFlavors();

  return (
    <div className="shell-wide pb-16 pt-16 lg:pt-24">
      <header className="max-w-3xl">
        <Eyebrow>Build your own</Eyebrow>
        <h1 className="type-display mt-5">
          Your pack.
          <br />
          Your call.
        </h1>
        <p className="type-lead mt-6 max-w-xl">
          Nobody should commit to twelve of something they haven&rsquo;t tried. Mix
          any flavors, any quantities — the per-can price drops as the pack gets
          bigger, and you can watch it happen.
        </p>
      </header>

      <div className="mt-14 border-t border-line pt-10 lg:mt-20">
        <BundleBuilder flavors={flavors} />
      </div>
    </div>
  );
}
