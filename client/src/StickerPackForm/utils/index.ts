import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

export const getCreateStickerPackText = (error: ApiError, l: TranslationFunction): string => {
	if (error.status === API_UNREACHABLE_STATUS) {
		return l("sticker.pack.create.error.server-unreachable");
	} else {
		return l("sticker.pack.create.error.unknown", {errorStatus: error.status});
	}
};
