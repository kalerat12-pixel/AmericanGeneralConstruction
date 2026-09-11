import Link from "next/link";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center py-24">
      <div className="max-w-2xl">
        <Eyebrow>404</Eyebrow>
        <h1 className="type-hero mt-6">
          Nothing
          <br />
          <span className="text-ember">here.</span>
        </h1>
        <p className="type-lead mt-8 max-w-lg">
          Either we moved it or you typed it. Either way, the shop and the rankings
          are both still where you left them.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-primary">
            Shop all flavors
          </Link>
          <Link href="/rankings" className="btn btn-ghost">
            Read the rankings
          </Link>
        </div>
      </div>
    </div>
  );
}
