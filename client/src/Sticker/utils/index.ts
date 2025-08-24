import {HttpStatusCode} from "axios";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

export const getLoadErrorText = (error: ApiError, l: TranslationFunction): string => {
	if (error.status === HttpStatusCode.NotFound) {
		return l("sticker.pack.load.error.not-found");
	} else if (error.status === API_UNREACHABLE_STATUS) {
		return l("common.error.server-unreachable");
	} else {
		return l("sticker.pack.load.error.unknown");
	}
};