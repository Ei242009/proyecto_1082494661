import { readHomeData } from '@/lib/dataService';
import HolaMundo from '@/components/HolaMundo';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const homeData = await readHomeData();
  return {
    title: homeData.meta.pageTitle,
    description: homeData.meta.description,
  };
}

export default async function Home() {
  const homeData = await readHomeData();

  return (
    <HolaMundo
      title={homeData.hero.title}
      subtitle={homeData.hero.subtitle}
      description={homeData.hero.description}
    />
  );
}
