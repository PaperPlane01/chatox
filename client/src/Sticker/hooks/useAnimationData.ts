import {useStore} from "../../store/hooks";

export const useAnimationData = (stickerId: string): string | undefined => {
	const {
		stickerAnimationData
	} = useStore();

	return stickerAnimationData.getAnimationData(stickerId);
};
