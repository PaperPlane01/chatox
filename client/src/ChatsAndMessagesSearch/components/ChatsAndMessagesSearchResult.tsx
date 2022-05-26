import React, {FunctionComponent, Fragment} from "react";
import {ChatsSearchResult} from "./ChatsSearchResult";
import {MessagesSearchResult} from "./MessagesSearchResult";
import {ChatsOfCurrentUserListProps} from "../../Chat";

export const ChatsAndMessagesSearchResult: FunctionComponent<ChatsOfCurrentUserListProps> = ({classes}) => (
    <Fragment>
        <ChatsSearchResult classes={classes}/>
        <MessagesSearchResult classes={classes}/>
    </Fragment>
);