export interface Common {
    id: string;
    createdAt: string
}

export interface BusinessType {
    firstname: string,
    lastname: string,
    businessName: string,
    ownerBirthDate: string,
    ownerGender: string,
    address?: string,
    description?: string,
    password: string,
    phone: string
}

export interface User {
    birthDate?: string;
    businessId?: string;
    createdAt?: string;
    firstname: string;
    gender: string;
    id: string;
    lastname: string
    permissionsList: string[];
    phoneNumber: string
    roleName: string
}

export interface Course extends Common {
    name: string,
    description: string,
    isPublished: boolean,
    publishedAt: string,
    businessId: string
    attachmentId?: string | null,
    attachmentUrl?: string,
}

export interface Module extends Common {
    name: string,
    description: string,
    courseId: string
    orderIndex: number | null,
    price: number,
    lessonCount: number,
}

export interface Lesson extends Common {
    name: string,
    description?: string,
    moduleId: string,
    orderIndex: number | null,
    estimatedDuration: number | null,
    videoUrl?: string,
}

export type TrackingOwnerType = "TEACHER" | "BUSINESS_OWNER";

export interface TrackingLinkAnalytics {
    clicks: number;
    uniqueClicks: number;
    leads: number;
    checkoutStarted: number;
    paidPurchases: number;
    failedOrAbandoned: number;
    refunded: number;
    revenue: number;
    conversionRate: number;
    lastActivityAt?: string | null;
}

export interface TrackingLink extends Common {
    courseId?: string;
    name: string;
    code: string;
    trackingUrl?: string;
    courseUrlWithRef?: string;
    isActive: boolean;
    expiresAt?: string | null;
    ownerType: TrackingOwnerType;
    ownerId: string;
    destinationUrl: string;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    updatedAt?: string;
}

export interface TrackingLinkPayload {
    name: string;
    ownerType: TrackingOwnerType;
    ownerId: string;
    destinationUrl: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    expiresAt?: string | null;
}
