import {FetchOptions} from "../../utils/types";

export interface FetchMessagesOptions extends FetchOptions {
	chatId?: string,
	skipSettingLastMessage?: boolean,
	beforeId?: string
}
