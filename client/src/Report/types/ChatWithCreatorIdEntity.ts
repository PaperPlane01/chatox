export interface ChatWithCreatorIdEntity {
    description?: string,
    id: string,
    name: string,
    slug?: string,
    tags: string[],
    createdAt: Date,
    avatarId?: string,
    createdById: string
}
