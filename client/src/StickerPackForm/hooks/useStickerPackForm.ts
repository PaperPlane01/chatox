import {StickerPackFormContext} from "../types";
import {StickerPackFormStore} from "../stores";
import {useStore} from "../../store/hooks";

export const useStickerPackForm = (context: StickerPackFormContext): StickerPackFormStore => {
	const {
		[context]: currentForm
	} = useStore();

	return currentForm;
};
