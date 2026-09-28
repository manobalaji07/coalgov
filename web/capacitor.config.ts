import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.gov.coal.coalgov',
  appName: 'CoalGov AI Mobile',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
