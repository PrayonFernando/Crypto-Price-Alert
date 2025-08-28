// apps/mobile/src/types/env.d.ts
type ExpoProcessEnv = {
  [key: string]: string | undefined;
  EXPO_PUBLIC_API_URL?: string;
};

// Provide a minimal "process" type so TS stops complaining in RN.
declare const process: { env: ExpoProcessEnv };
