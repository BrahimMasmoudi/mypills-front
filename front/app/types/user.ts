export type UserRole = 'normal' | 'super_user';

export interface UserProfile {
    uid: string;
    email?: string | null;
    role: UserRole;
    fcmToken?: string;
    lastTokenUpdate?: any;
}
