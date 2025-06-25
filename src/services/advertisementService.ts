
import { AdvertisementConfig } from '../types';

const ADVERTISEMENT_CONFIG_KEY = 'scamguard_advertisement_config';

const DEFAULT_AD_CONFIG: AdvertisementConfig = {
  imageUrl: undefined,
  targetUrl: '#',
  isEnabled: false,
};

export const getAdvertisementConfig = (): AdvertisementConfig => {
  const configJson = localStorage.getItem(ADVERTISEMENT_CONFIG_KEY);
  if (configJson) {
    try {
      return JSON.parse(configJson) as AdvertisementConfig;
    } catch (error) {
      console.error("Error parsing advertisement config from localStorage", error);
      return DEFAULT_AD_CONFIG;
    }
  }
  return DEFAULT_AD_CONFIG;
};

export const saveAdvertisementConfig = (config: AdvertisementConfig): void => {
  localStorage.setItem(ADVERTISEMENT_CONFIG_KEY, JSON.stringify(config));
};