export type Theme = "light" | "dark" | "system";

export interface FamilyMember {
  name: string;
  color: string;
}

export interface GoogleAuth {
  accessToken: string;
  refreshToken: string;
  /** Unix timestamp (ms) when the access token expires. */
  expiresAt: number;
  email: string;
  name: string;
}

export interface AppConfig {
  theme: Theme;
  familyMembers: FamilyMember[];
  googleAuth?: GoogleAuth;
}
