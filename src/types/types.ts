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

export interface UserDeviceSession {
    sessionId: string;
    deviceId: string;
    deviceName: string;
    platform?: string;
    browser?: string;
    ipAddress?: string;
    lastSeenAt?: string;
}

export interface DeviceLimitExceededDetails {
    maxDevices: number;
    activeDevices: UserDeviceSession[];
}

export interface ApiErrorResponse<TDetails = unknown> {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    path?: string;
    details?: TDetails;
}

export interface BusinessWalletTopUpCheckoutRequest {
    phoneNumber: string;
    amount: number;
}

export interface PaymentOrderResponse {
    orderId: string;
}

export interface PaymentCheckoutUrlResponse {
    checkoutUrl: string;
}

export interface BusinessWalletSummary {
    balance: number;
    currency?: string;
    salesBlocked?: boolean;
}

export interface BusinessWalletTransaction {
    transactionId: string;
    orderId?: string;
    phoneNumber?: string;
    studentId?: string;
    studentName?: string;
    courseId?: string;
    courseName?: string;
    moduleNames: string[];
    saleAmount: number;
    feeAmount: number;
    amount: number;
    provider?: string;
    currency?: string;
    status?: string;
    displayName?: string;
    sourceType?: string;
    paidAt?: string;
    createdAt?: string;
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
    freeEnrolls?: number;
    paidAmount?: number;
    failedOrAbandoned: number;
    refunded: number;
    refundedAmount?: number;
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

export type TrackingLinkResponse = TrackingLink;
export type TrackingLinkCreateRequest = TrackingLinkPayload;
export type TrackingLinkUpdateRequest = Partial<TrackingLinkPayload & { isActive: boolean }>;
export type TrackingLinkAnalyticsResponse = TrackingLinkAnalytics;
export type CourseTrackingAnalyticsResponse = TrackingLinkAnalytics;

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

export interface CourseShortInfo {
    courseId: string;
    courseName: string;
}

export interface BusinessMember {
    id: string;
    fullName: string;
    phone: string;
    role: string;
    courseNames: string[];
    assignedCourses: CourseShortInfo[];
    avatarAttachmentId?: string;
    avatarUrl?: string;
}

export interface BusinessResponse {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    description?: string;
    studentsCount?: number | null;
    ownerId: string;
    ownerFullName: string;
    ownerAvatarAttachmentId?: string;
    ownerAvatarUrl?: string;
    assistants: Record<string, string>;
    members: BusinessMember[];
}

export interface CourseStaffMember {
    userId: string;
    fullName: string;
    phone: string;
    role: string;
    avatarAttachmentId?: string;
    avatarUrl?: string;
}

export interface BusinessMemberCourseAssignmentRequest {
    courseIds: string[];
}
