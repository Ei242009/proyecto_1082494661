export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  animationStyle: 'typewriter' | 'fadeIn' | 'slideUp';
}

export interface MetaData {
  pageTitle: string;
  description: string;
}

export interface HomeData {
  hero: HeroContent;
  meta: MetaData;
}

export interface AppConfig {
  appName: string;
  version: string;
  locale: string;
  theme: 'light' | 'dark';
}
