/**
 * Tipos TypeScript para home.json
 * Contenido de la página de inicio
 */

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  animationStyle: 'typewriter' | 'fade-in' | 'slide-up' | 'bounce';
}

export interface MetaData {
  pageTitle: string;
  description: string;
}

export interface HomeData {
  hero: HeroContent;
  meta: MetaData;
}

export default HomeData;
