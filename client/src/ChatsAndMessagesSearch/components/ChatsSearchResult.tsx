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

export const ChatsSearchResult: FunctionComponent<ChatsOfCurrentUserListProps> = observer(({classes}) => {
    const {
        chatsOfCurrentUserSearch: {
            foundChats,
            collapsed,
            pending,
            setCollapsed
        },
        chatsAndMessagesSearchQuery: {
            searchModeActive
        }
    } = useStore();
    const {l} = useLocalization();

    if (!pending && foundChats.length === 0 && searchModeActive) {
        return null;
    }

    return (
        <Accordion expanded={!collapsed}
                   onChange={() => setCollapsed(!collapsed)}
                   className={classes && classes.accordion}
        >
            <AccordionSummary>
                <Typography>{l("search.result.chats")}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes && classes.accordionDetails}>
                <List className={classes && classes.list}>
                    {foundChats.map(chatId => (
                        <Fragment key={chatId}>
                            <ChatsOfCurrentUserListItem chatId={chatId}
                                                        linkGenerationStrategy="chat"
                                                        ignoreSelection
                            />
                            <Divider variant="inset"/>
                        </Fragment>
                    ))}
                </List>
                {pending && <CircularProgress size={15} color="primary" className={classes && classes.circularProgress}/>}
            </AccordionDetails>
        </Accordion>
    );
});
