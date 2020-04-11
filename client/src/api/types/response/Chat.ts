export interface Chat {
    avatarUri?: string,
    createdByCurrentUser: boolean,
    description?: string,
    id: string,
    name: string,
    participantsCount: number,
    slug?: string,
    tags: string[],
    createdAt: string
}
