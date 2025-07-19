// Unified Whitelabel / Branding configuration
// This replaces the old src/config/* folder which duplicated data already
// present in branding/<brand>.json. The active brand is determined at build
// time via the Vite env variable `VITE_BRAND`. Default is `default`.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck – JSON modules are provided by Vite and typed as `any`.

import config from '../whitelabel.json';
import { CONFIG } from './config/secrets';

export const WHITELABEL_CONFIG = config;
export { CONFIG };
