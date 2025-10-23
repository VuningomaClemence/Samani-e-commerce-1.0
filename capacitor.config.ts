import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.samani.vuningomaApp',
  appName: 'samani',
  webDir: 'dist/samani/browser',
  plugins: {
    StatusBar: {
      backgroundColor: '#2c3e50',
      style: 'DARK',
    },
  },
};

export default config;
