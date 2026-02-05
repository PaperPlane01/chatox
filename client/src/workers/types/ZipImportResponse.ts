import {ZipImportFile} from "./ZipImportFile";

export interface ZipImportResponse {
	files: ZipImportFile[],
	rootName?: string
}
