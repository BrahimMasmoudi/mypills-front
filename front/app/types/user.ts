export type UserRole = 'normal' | 'super_user';

export interface UserProfile {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    role: UserRole;
    fcmToken?: string;
    lastTokenUpdate?: any;
    lastUpdated?: any;
}
