export interface Chat {
    avatarUri?: string,
    createdByCurrentUser: boolean,
    description?: string,
    id: string,
    name: string,
    numberOfParticipants: number,
    slug?: number,
    tags: string[]
}
