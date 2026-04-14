import { HeroSection } from '@/components/home/HeroSection';
import { PopularServices } from '@/components/home/PopularServices';
import { TopWorkers } from '@/components/home/TopWorkers';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PremiumBanner } from '@/components/home/PremiumBanner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularServices />
      <TopWorkers />
      <WhyChooseUs />
      <HowItWorks />
      <PremiumBanner />
    </>
  );
}
