export interface GlobalBanFilters {
    excludeExpired: boolean,
    excludeCanceled: boolean,
    bannedUserId?: string,
    bannedById?: string
}