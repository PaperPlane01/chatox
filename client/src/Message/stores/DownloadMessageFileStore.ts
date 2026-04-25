import {action, makeAutoObservable, observable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import downloadFile from "js-file-download";
import {DownloadProgress} from "../types";
import {UploadApi} from "../../api";
import {Upload} from "../../api/types/response";

export class DownloadMessageFileStore {
    downloadProgressMap = observable.map<string, DownloadProgress>();

    constructor() {
        makeAutoObservable<DownloadMessageFileStore, "finishDownload">(
            this,
            {finishDownload: action},
            {autoBind: true}
        );
    }

    getDownloadProgress = computedFn((id: string): DownloadProgress => this.downloadProgressMap.get(id) ?? {
        downloading: false,
        percentage: 0
    })

    downloadFile(upload: Upload<any>): void {
        if (this.getDownloadProgress(upload.id).downloading) {
            return;
        }

        this.downloadProgressMap.set(upload.id, {
            percentage: 0,
            downloading: true
        });

        UploadApi.downloadFile(upload.name, percentage => runInAction(() => {
            this.downloadProgressMap.set(upload.id, {
                percentage,
                downloading: true
            });

            if (percentage === 100) {
                setTimeout(() => this.finishDownload(upload.id), 300);
            }
        }))
            .then(({data}) => downloadFile(data, upload.originalName))
    }

    private finishDownload(id: string): void {
        this.downloadProgressMap.set(id, {
            percentage: 0,
            downloading: false
        });
    }
}
