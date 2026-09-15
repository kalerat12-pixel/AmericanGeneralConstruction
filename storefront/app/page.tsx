import Hero from "@/components/sections/Hero";
import CredentialStrip from "@/components/sections/CredentialStrip";
import TikTokShowcase from "@/components/sections/TikTokShowcase";
import Catalog from "@/components/sections/Catalog";
import TrustCompliance from "@/components/sections/TrustCompliance";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CredentialStrip />
      <TikTokShowcase />
      <Catalog />
      <TrustCompliance />
    </>
  );
}
