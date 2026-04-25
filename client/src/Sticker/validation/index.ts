import {Labels} from "../../localization";

export const validateConsent = (consent: boolean): keyof Labels | undefined => {
	if (!consent) {
		return "common.error.field-required";
	}

	return undefined;
};
