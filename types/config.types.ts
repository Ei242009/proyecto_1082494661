/**
 * Tipos TypeScript para config.json
 * Configuración global de la aplicación
 */

export interface AppConfig {
  appName: string;
  version: string;
  locale: string;
  theme: 'dark' | 'light' | 'auto';
}

export default AppConfig;
