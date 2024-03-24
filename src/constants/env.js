import { config } from "dotenv";
config();

export const FIRE_BASE_API_KEY = process.env.FIRE_BASE_API_KEY;
export const FIRE_BASE_AUTH_DOMAIN = process.env.FIRE_BASE_AUTH_DOMAIN;
export const FIRE_BASE_PROJECT_ID = process.env.FIRE_BASE_PROJECT_ID;
export const FIRE_BASE_STORAGE_BUCKET = process.env.FIRE_BASE_STORAGE_BUCKET;
export const FIRE_BASE_MESSAGING_SENDER_ID =
  process.env.FIRE_BASE_MESSAGING_SENDER_ID;
export const FIRE_BASE_APP_ID = process.env.FIRE_BASE_APP_ID;
export const FIRE_BASE_MEASUREMENT_ID = process.env.FIRE_BASE_MEASUREMENT_ID;
