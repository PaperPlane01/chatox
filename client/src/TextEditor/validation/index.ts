import {Labels} from "../../localization";
import {isDefined} from "../../utils/object-utils";

export const URL_REGEX =
	/((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

export const validateUrl = (url: string | null | undefined): keyof Labels | undefined => {
	if (!isDefined(url)) {
		return "editor.create-link.url.invalid";
	}

	if (!URL_REGEX.exec(url)) {
		return "editor.create-link.url.invalid";
	}

	return undefined;
};
