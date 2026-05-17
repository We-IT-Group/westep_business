import type {
    TrackingLink,
    TrackingLinkAnalytics,
    TrackingOwnerType,
    TrackingSourceType,
} from "../../../types/types.ts";

export type AnalyticsFilterValue = "ALL" | TrackingSourceType;

export type LinkStats = TrackingLinkAnalytics;

export interface CourseAnalyticsLink extends TrackingLink {
    ownerType: TrackingOwnerType;
    sourceType?: TrackingSourceType;
}

export interface CopyUrlItem {
    key: string;
    label: string;
    description: string;
    value: string;
}
