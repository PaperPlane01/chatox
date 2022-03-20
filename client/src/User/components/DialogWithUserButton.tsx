import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button} from "@material-ui/core";
import {ChatBubble} from "@material-ui/icons";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";

export const DialogWithUserButton: FunctionComponent = observer(() => {
    const {
        userProfile: {
            selectedUserId
        },
        messageCreation: {
            setUserId
        },
        entities: {
            chats: {
                privateChats
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();

    if (!selectedUserId) {
        return null;
    }

    const handleClick = (): void => {
        if (privateChats[selectedUserId]) {
            routerStore.router.goTo(Routes.chatPage, {slug: privateChats[selectedUserId]}, {}, {});
        } else {
            setUserId(selectedUserId);
            routerStore.router.goTo(Routes.newPrivateChat);
        }
    };

    return (
        <Button variant="text"
                color="primary"
                onClick={handleClick}
        >
            <ChatBubble/>
            {l("message.list")}
        </Button>
    );
});
