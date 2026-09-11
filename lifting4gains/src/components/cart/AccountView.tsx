"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";
import { site } from "@/lib/config";
import { ordersStore } from "@/lib/orders-store";
import { hydratedStore } from "@/lib/browser-store";

export function AccountView() {
  const orders = useSyncExternalStore(
    ordersStore.subscribe,
    ordersStore.getSnapshot,
    ordersStore.getServerSnapshot,
  );
  const ready = useSyncExternalStore(
    hydratedStore.subscribe,
    hydratedStore.getSnapshot,
    hydratedStore.getServerSnapshot,
  );

  return (
    <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-14">
      <section aria-labelledby="orders-heading">
        <h2 id="orders-heading" className="type-eyebrow">
          Order history
        </h2>

        {!ready ? (
          <p className="mt-6 text-sm text-ash">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="mt-6 border border-line p-10 text-center">
            <p className="font-display text-xl font-extrabold uppercase tracking-[-0.03em]">
              No orders on this device
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ash">
              Order history is tied to this browser. If you ordered somewhere else,
              use the order reference from your receipt email and we&rsquo;ll pull it
              up for you.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn btn-primary">
                Start an order
              </Link>
              <Link href="/contact" className="btn btn-ghost">
                Look up an order
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-6 border-t border-line">
            {orders.map((order) => (
              <li
                key={order.reference}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5"
              >
                <div>
                  <p className="type-mono text-base">{order.reference}</p>
                  <p className="mt-1 text-sm text-ash">
                    <time dateTime={order.createdAt}>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    {" · "}
                    {order.email}
                  </p>
                </div>
                <p className="type-mono text-base">{formatPrice(order.totalCents)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="mt-12 space-y-6 lg:mt-0">
        <div className="panel p-7">
          <h2 className="type-eyebrow">Managing a subscription</h2>
          <p className="mt-4 text-sm leading-relaxed text-ash">
            Skip, pause, change flavors or cancel from the link at the bottom of any
            subscription receipt. No phone call, no retention flow, no three-step
            &ldquo;are you sure&rdquo;.
          </p>
          <a href={`mailto:${site.email}`} className="btn btn-ghost mt-6 w-full">
            Email us instead
          </a>
        </div>

        <div className="panel p-7">
          <h2 className="type-eyebrow">Where&rsquo;s my order?</h2>
          <p className="mt-4 text-sm leading-relaxed text-ash">
            Tracking goes out by email as soon as your order leaves us. Most arrive
            in 2–4 working days.
          </p>
          <Link href="/shipping-returns" className="link-slide mt-5 inline-block text-sm">
            Shipping &amp; returns
          </Link>
        </div>
      </aside>
    </div>
  );
}
