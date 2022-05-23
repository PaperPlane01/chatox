import {ChatLinkPropsGenerationStrategy, ChatOfCurrentUserEntity} from "../types";
import {Routes} from "../../router";

interface ChatLinkProps {
    view: any,
    params: any
}

interface ChatLinkPropsGeneratorParameters {
    chat: ChatOfCurrentUserEntity,
    messageId?: string
}

type ChatLinkPropsGenerator = (parameters: ChatLinkPropsGeneratorParameters) => ChatLinkProps;

type ChatLinkPropsGenerators = {
    [strategy in ChatLinkPropsGenerationStrategy]: ChatLinkPropsGenerator;
};

const chatLinkPropsGenerators: ChatLinkPropsGenerators = {
    chat: ({chat}) => ({
        view: Routes.chatPage,
        params: {
            slug: chat.slug || chat.id
        }
    }),
    chatMessage: ({chat, messageId}) => ({
        view: Routes.chatMessagePage,
        params: {
            slug: chat.slug || chat.id,
            messageId
        }
    })
};

export const getChatLinkProps = (
    strategy: ChatLinkPropsGenerationStrategy,
    parameters: ChatLinkPropsGeneratorParameters
): ChatLinkProps => chatLinkPropsGenerators[strategy](parameters);
