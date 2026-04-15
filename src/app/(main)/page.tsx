import { HeroSection } from '@/components/home/HeroSection';
import { PopularServices } from '@/components/home/PopularServices';
import { TopWorkers } from '@/components/home/TopWorkers';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PremiumBanner } from '@/components/home/PremiumBanner';
import { getSiteContent } from '@/lib/siteContent';

export default async function HomePage() {
  const content = await getSiteContent();

  return (
    <>
      <HeroSection
        badge={content.hero_badge}
        title={content.hero_title}
        subtitle={content.hero_subtitle}
      />
      <PopularServices
        title={content.services_title}
        subtitle={content.services_subtitle}
      />
      <TopWorkers
        title={content.workers_title}
        subtitle={content.workers_subtitle}
      />
      <WhyChooseUs title={content.why_title} />
      <HowItWorks />
      <PremiumBanner />
    </>
  );
}
