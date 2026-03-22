import { Header } from './Header';
import { Footer } from './Footer';
import { AdBlockDetector } from '@/components/ads/AdBlockDetector';
import { AdSlot } from '@/components/ads/AdSlot';

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdBlockDetector />
      <Header />

      {/* Lateral ads (desktop xl+ only) */}
      <div className="hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-40">
        <AdSlot width={160} height={600} format="vertical" slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} />
      </div>
      <div className="hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-40">
        <AdSlot width={160} height={600} format="vertical" slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR} />
      </div>

      {/* Main content with spacing for fixed ads */}
      <main className="min-h-screen pt-[64px] lg:pt-[170px] pb-[100px] xl:mx-[176px]">
        {children}
      </main>

      <Footer />

      {/* Bottom sticky ads */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center gap-4 py-2 bg-surface-900/95 backdrop-blur-sm border-t border-surface-700">
        <AdSlot width={728} height={90} format="horizontal" slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER} />
        <div className="hidden lg:block">
          <AdSlot width={728} height={90} format="horizontal" slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER} />
        </div>
      </div>
    </>
  );
}
