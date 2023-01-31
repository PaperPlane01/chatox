import {makeAutoObservable} from "mobx";
import downloadFile from "js-file-download";
import {UploadApi} from "../../api/clients";

interface DownloadProgressMap {
    [fileId: string]: {
        percentage: number,
        downloading: boolean
    }
}

export class DownloadMessageFileStore {
    downloadProgressMap: DownloadProgressMap = {};

    constructor() {
        makeAutoObservable(this);
    }

    downloadFile = (fileName: string, originalFileName: string): void => {
        this.downloadProgressMap[fileName] = {
            percentage: 0,
            downloading: true
        }

        UploadApi.downloadFile(fileName, percentage => {
            this.downloadProgressMap[fileName].percentage = percentage;

            if (percentage === 100) {
                setTimeout(() => {
                    this.downloadProgressMap[fileName] = {
                        percentage: 0,
                        downloading: false
                    }
                }, 300);
            }
        })
            .then(({data}) => downloadFile(data, originalFileName))
    };
}

