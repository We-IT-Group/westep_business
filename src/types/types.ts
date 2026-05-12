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
    fullDescription?: string,
    price?: number,
    isPublished: boolean,
    published?: boolean,
    status?: string,
    active: boolean,
    publishedAt: string,
    businessId: string
    attachmentId?: string | null,
    attachmentUrl?: string,
    primaryCategoryId?: string,
    primaryCategoryName?: string,
    subcategoryId?: string,
    subcategoryName?: string,
    skillTagIds?: string[],
    languageId?: string,
    languageName?: string,
    languageCode?: string,
    trailerVideoUrl?: string,
    createdBy?: string,
    createdByFullName?: string,
}

export interface TaxonomyOption {
    id: string;
    name: string;
    code?: string;
    parentId?: string;
    categoryId?: string;
}

export interface Module extends Common {
    name: string,
    description?: string,
    courseId: string
    orderIndex: number | null,
    price: number,
    lessonCount: number,
    active?: boolean,
}

export type LessonType = "LESSON" | "PRACTICE";

export interface Lesson extends Common {
    name: string,
    description?: string,
    moduleId: string,
    type?: LessonType,
    orderIndex: number | null,
    estimatedDuration: number | null,
    watchCompletionPercent?: number | null,
    videoUrl?: string,
    active?: boolean,
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

export interface NotificationItem extends Common {
    title: string;
    message: string;
    type?: string;
    isRead: boolean;
}

export interface HomeworkStudent {
    id: string;
    fullName: string;
}

export interface CourseHomeworkInboxItem {
    submissionId: string;
    lessonId: string;
    lessonName: string;
    taskId: string;
    taskTitle: string;
    student: HomeworkStudent;
    previewComment: string;
    submittedAt?: string;
    unread: boolean;
    reviewed: boolean;
    revisionRequested: boolean;
    hasAttachments: boolean;
}

export interface CourseHomeworkInboxResponse {
    courseId: string;
    courseName: string;
    page: number;
    size: number;
    totalSubmissions: number;
    unreadCount: number;
    items: CourseHomeworkInboxItem[];
}

export interface CourseHomeworkSubmissionDetail {
    submissionId: string;
    courseId: string;
    lessonId: string;
    lessonName: string;
    taskId: string;
    taskTitle: string;
    student: HomeworkStudent;
    comment?: string;
    externalUrl?: string;
    attachmentIds: string[];
    submittedAt?: string;
    reviewedAt?: string | null;
    score?: number | null;
    feedback?: string | null;
    revisionRequested: boolean;
    unread: boolean;
}

export interface CourseHomeworkStatusSummary {
    courseId: string;
    newCount: number;
    reviewedCount: number;
    revisionRequestedCount: number;
}

export interface MarkHomeworkReadResponse {
    submissionId: string;
    lastReadAt?: string;
}

export interface LessonHomeworkReviewRequest {
    score: number;
    feedback: string;
    revisionRequested: boolean;
}

export interface BusinessStudentOverview {
    studentId: string;
    studentName: string;
    courseNames: string[];
    totalPaidAmount: number;
    completedCoursesCount: number;
    ongoingCoursesCount: number;
}
