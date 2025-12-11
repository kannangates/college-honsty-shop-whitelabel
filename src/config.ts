// Shasun College Honesty Shop Configuration
// All branding, messages, and system settings are managed in config.json

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck – JSON modules are provided by Vite and typed as `any`.

import config from '../config.json';
import { CONFIG } from './config/secrets';

export const WHITELABEL_CONFIG = config;
export { CONFIG };
