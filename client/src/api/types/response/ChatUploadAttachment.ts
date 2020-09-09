import {Message} from "./Message";
import {User} from "./User";
import {Upload} from "./Upload";
import {UploadType} from "./UploadType";

export interface ChatUploadAttachment<T = any> {
    id: string,
    createdAt: string,
    message?: Message,
    uploadCreator?: User,
    uploadSender: User,
    upload: Upload<T>,
    type: UploadType
}
