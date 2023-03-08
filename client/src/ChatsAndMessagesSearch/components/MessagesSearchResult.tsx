import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    CircularProgress,
    Divider,
    List,
    Typography
} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {ChatsOfCurrentUserListProps, ChatsOfCurrentUserListItem} from "../../Chat";

export const MessagesSearchResult: FunctionComponent<ChatsOfCurrentUserListProps> = observer(({classes}) => {
    const {
        allChatsMessagesSearch: {
            foundMessages,
            collapsed,
            pending,
            setCollapsed
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Accordion expanded={!collapsed}
                   onChange={() => setCollapsed(!collapsed)}
                   className={classes && classes.accordion}
        >
            <AccordionSummary>
                <Typography>{l("search.result.messages")}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes && classes.accordionDetails}>
                <List className={classes && classes.list}>
                    {foundMessages.map(({chatId, messageId}) => (
                        <Fragment key={`${chatId}-${messageId}`}>
                            <ChatsOfCurrentUserListItem chatId={chatId}
                                                        messageId={messageId}
                                                        linkGenerationStrategy="chatMessage"
                                                        ignoreSelection
                            />
                            <Divider variant="inset"/>
                        </Fragment>
                    ))}
                </List>
                {pending && <CircularProgress size={50} color="primary" className={classes && classes.circularProgress}/>}
            </AccordionDetails>
        </Accordion>
    );
});
