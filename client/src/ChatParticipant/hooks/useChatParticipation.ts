import {useEffect} from "react";
import {useStore} from "../../store";
import {ChatParticipationEntity} from "../types";

export const useChatParticipation = (chatId?: string, userId?: string): ChatParticipationEntity | undefined => {
	const {
		entities: {
			chatParticipations: {
				findByUserAndChat
			}
		},
		referencedEntities: {
			increaseReferenceCount,
			decreaseReferenceCount
		}
	} = useStore();

	const chatParticipation = (chatId && userId)
		? findByUserAndChat({chatId, userId})
		: undefined;

	useEffect(() => {
		if (chatParticipation) {
			increaseReferenceCount("chatParticipations", chatParticipation.id);
		}

		return () => {
			if (chatParticipation) {
				decreaseReferenceCount("chatParticipations", chatParticipation.chatId);
			}
		}
	}, [chatId, userId]);

	return chatParticipation;
};
