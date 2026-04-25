import {useStore} from "../../store";

export const useAnimationData = (stickerId: string): string | undefined => {
	const {
		stickerAnimationData
	} = useStore();

	return stickerAnimationData.getAnimationData(stickerId);
};
