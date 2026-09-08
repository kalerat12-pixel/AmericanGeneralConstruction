import type { Metadata } from 'next';
import { PageHeader } from '@/components/section';
import { CartView } from '@/components/cart/cart-view';
import { RuoNotice } from '@/components/compliance/ruo-notice';
import { SITE } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Cart & Order Request',
  description:
    'Review your selected materials and send an order request. Every order is confirmed by hand before payment. Research use only.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: true },
  openGraph: {
    url: `${SITE.url}/cart`,
    title: `Cart & Order Request — ${SITE.name}`,
    description: 'Review your selected materials and send an order request.',
  },
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow="Order Request"
        title="Confirm the details, and we will take it from here."
        lede="We do not run an automated checkout. Send the request and a person reviews availability, lot assignment and shipping before anything is charged."
      />
      <RuoNotice variant="bar" />
      <CartView />
    </>
  );
}
