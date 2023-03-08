import {ChatLinkPropsGenerationStrategy, ChatOfCurrentUserEntity} from "../types";
import {Routes} from "../../router";
import {Route, RouteParams} from "mobx-router";

interface ChatLinkProps {
    route: Route<any>,
    params: RouteParams
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
        route: Routes.chatPage,
        params: {
            slug: chat.slug || chat.id
        }
    }),
    chatMessage: ({chat, messageId}) => ({
        route: Routes.chatMessagePage,
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
