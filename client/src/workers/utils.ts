import {DirectoryEntry, Entry, FileEntry} from "@zip.js/zip.js";

export const isFileEntry = (entry: Entry): entry is FileEntry => typeof (entry as any).getData === "function";

export const isDirectoryEntry = (entry: Entry): entry is DirectoryEntry => entry.directory;
