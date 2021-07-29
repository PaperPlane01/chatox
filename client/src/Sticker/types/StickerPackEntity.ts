export interface StickerPackEntity {
    id: string,
    author?: string,
    description: string,
    name: string,
    stickersIds: string[],
    previewId: string
}
