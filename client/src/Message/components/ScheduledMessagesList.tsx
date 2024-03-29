import React, {FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@mui/material";
import {MessagesListItem} from "./MessagesListItem";
import {useStore} from "../../store";

interface ScheduledMessagesListStyles {
    height: string | number | undefined,
}

export const ScheduledMessagesList: FunctionComponent = observer(() => {
    const {
        scheduledMessagesOfChat: {
            scheduledMessagesOfChat
        }
    } = useStore();
    const [styles, setStyles] = useState<ScheduledMessagesListStyles>({height: "100%"});
    const onSmallScreen = useMediaQuery("md");
    const theme = useTheme();

    const calculateStyles = (): ScheduledMessagesListStyles => {
        if (onSmallScreen) {
            return {height: "100%"};
        } else {
            return {
                height: window.innerHeight - Number(theme.spacing(10).replace("px", ""))
            }
        }
    };

    useEffect(
        () => {
            const handleResize = (): void => setStyles(calculateStyles());
            window.addEventListener("resize", handleResize);

            return window.removeEventListener("resize", handleResize);
        }
    );

    return (
        <div style={styles}>
            {scheduledMessagesOfChat.map(messageId => (
                <MessagesListItem messageId={messageId}
                                  key={messageId}
                                  scheduledMessage
                />
            ))}
        </div>
    );
});
