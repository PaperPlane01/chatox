import React, {FunctionComponent, useState, useEffect, useRef} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import {MessagesListItem} from "./MessagesListItem";
import {MapMobxToProps} from "../../store";

interface MessagesListMobxProps {
    messagesOfChat: string[],
    referredMessageId?: string
}

const useStyles = makeStyles(() => createStyles({
    messagesList: {
        height: (props: Omit<MessagesListMobxProps, "messagesOfChat">) => `calc(100vh - ${props.referredMessageId ? 238 : 154}px)`,
        overflowY: "auto"
    }
}));

const _MessagesList: FunctionComponent<MessagesListMobxProps> = ({messagesOfChat, referredMessageId}) => {
    const messagesListBottomRef = useRef<HTMLDivElement>(null);
    const [reachedBottom, setReachedBottom] = useState(true);

    const scrollToBottom = (): void => {
        if (reachedBottom && messagesListBottomRef && messagesListBottomRef.current) {
            messagesListBottomRef.current.scrollIntoView();
        }
    };

    const handleScroll = (event: React.UIEvent<HTMLElement>): void => {
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
};

const mapMobxToProps: MapMobxToProps<MessagesListMobxProps> = ({messagesOfChat, messageCreation}) => ({
    messagesOfChat: messagesOfChat.messagesOfChat,
    referredMessageId: messageCreation.referredMessageId
});

export const MessagesList = inject(mapMobxToProps)(observer(_MessagesList) as FunctionComponent);
