import React, {FunctionComponent, useState, useEffect, useRef} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, makeStyles} from "@material-ui/core";
import {MessagesListItem} from "./MessagesListItem";
import {MapMobxToProps} from "../../store";

interface MessagesListMobxProps {
    messagesOfChat: string[]
}

const useStyles = makeStyles(() => createStyles({
    messagesList: {
        height: "calc(100vh - 154px)",
        overflowY: "auto"
    }
}));

const _MessagesList: FunctionComponent<MessagesListMobxProps> = ({messagesOfChat}) => {
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

    const classes = useStyles();

    return (
        <div className={classes.messagesList}
             onScroll={handleScroll}
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

const mapMobxToProps: MapMobxToProps<MessagesListMobxProps> = ({messagesOfChat}) => ({
    messagesOfChat: messagesOfChat.messagesOfChat
});

export const MessagesList = inject(mapMobxToProps)(observer(_MessagesList) as FunctionComponent);
