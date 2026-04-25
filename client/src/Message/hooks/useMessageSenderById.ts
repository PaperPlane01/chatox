import {FindMessageSenderFunction} from "../types";
import {UserEntity} from "../../User";
import {useEntityById} from "../../entities";

export function useMessageSenderById(senderId: string, override?: FindMessageSenderFunction): UserEntity;
export function useMessageSenderById(senderId?: string, override?: FindMessageSenderFunction): UserEntity | undefined;

export function useMessageSenderById(senderId?: string, override?: FindMessageSenderFunction): UserEntity | undefined {
	const user = useEntityById("users", senderId);

	if (senderId) {
		if (override) {
			return override(senderId)
		}
	}

	return user;
}
