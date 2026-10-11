import React, {FunctionComponent, Fragment} from "react";
import {ChatsSearchResult} from "./ChatsSearchResult";
import {MessagesSearchResult} from "./MessagesSearchResult";
import {ChatsOfCurrentUserListProps} from "../../Chat/types";

export const ChatsAndMessagesSearchResult: FunctionComponent<ChatsOfCurrentUserListProps> = ({classes}) => (
    <Fragment>
        <ChatsSearchResult classes={classes}/>
        <MessagesSearchResult classes={classes}/>
    </Fragment>
);