import React, {FunctionComponent, UIEvent, useEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import {MessagesListItem} from "./MessagesListItem";
import {useStore} from "../../store";

interface MessagesListStylesProps {
    referredMessageId?: string
}

const useStyles = makeStyles(() => createStyles({
    messagesList: {
        height: (props: MessagesListStylesProps) => `calc(100vh - ${props.referredMessageId ? 238 : 154}px)`,
        overflowY: "auto"
    }
}));

export const MessagesList: FunctionComponent = observer(() => {
    const {
        messagesOfChat: {
            messagesOfChat
        },
        messageCreation: {
            referredMessageId
        }
    } = useStore();
    const messagesListBottomRef = useRef<HTMLDivElement>(null);
    const [reachedBottom, setReachedBottom] = useState(true);

    const scrollToBottom = (): void => {
        if (reachedBottom && messagesListBottomRef && messagesListBottomRef.current) {
            messagesListBottomRef.current.scrollIntoView();
        }
    };

    const handleScroll = (event: UIEvent<HTMLElement>): void => {
        const reachedBottom = event.currentTarget.scrollHeight - event.currentTarget.scrollTop === event.currentTarget.clientHeight;
        setReachedBottom(reachedBottom);
    };

    useEffect(scrollToBottom, [messagesOfChat]);

    const classes = useStyles({referredMessageId});

    return (
        <div className={classes.messagesList}
             onScroll={handleScroll}
             id="messagesList"
        >
            {messagesOfChat.map(messageId => (
                <MessagesListItem messageId={messageId}
                                  key={messageId}
                />
            ))}
            <div id="messagesListBottom" ref={messagesListBottomRef}/>
        </div>
    );
});
