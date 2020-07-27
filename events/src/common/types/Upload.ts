export interface Upload {
    id: string,
    name: string,
    uri: string,
    extension?: string,
    originalName: string,
    meta: any,
    mimeType: string,
    type: string,
    preview?: Upload,
    thumbnail?: Upload
}
