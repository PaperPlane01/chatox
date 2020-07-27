import {RecentMessagesDeletionPeriod} from "./RecentMessagesDeletionPeriod";

export interface CreateChatBlockingFormData {
    blockedUserId?: string,
    description?: string,
    blockedUntil?: Date,
    deleteRecentMessages: boolean,
    recentMessagesDeletionPeriod: RecentMessagesDeletionPeriod
}
