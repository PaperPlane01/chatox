import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Grid} from "@material-ui/core";
import {useStore} from "../../store/hooks";
import {PopularChatsListItem} from "./PopularChatsListItem";

export const PopularChatsList: FunctionComponent = observer(() => {
    const {
        popularChats: {
            popularChats
        }
    } = useStore();

    return (
        <Grid container spacing={2} alignItems="stretch">
            {popularChats.map(popularChatId => (
                <Grid item xs={12} key={popularChatId}>
                    <PopularChatsListItem chatId={popularChatId}/>
                </Grid>
            ))}
        </Grid>
    );
});
