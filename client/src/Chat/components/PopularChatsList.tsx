import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Grid, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {PopularChatsListItem} from "./PopularChatsListItem";
import {commonStyles} from "../../style";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles()(() => ({
    centered: {
        ...commonStyles.centered,
        width: "100%"
    }
}));

export const PopularChatsList: FunctionComponent = observer(() => {
    const {
        popularChats: {
            popularChats,
            paginationState: {
                pending,
                noMoreItems
            },
            fetchPopularChats
        }
    } = useStore();
    const {l} = useLocalization();
    const {classes} = useStyles();

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Typography variant="h6">
                    {l("chats.popular")}
                </Typography>
            </Grid>
            {popularChats.map(popularChatId => (
                <Grid size={12} key={popularChatId}>
                    <PopularChatsListItem chatId={popularChatId}/>
                </Grid>
            ))}
            {!noMoreItems && (
                <Grid size={12}>
                    <Button variant="outlined"
                            color="primary"
                            disabled={pending}
                            onClick={fetchPopularChats}
                    >
                        {l("chats.popular.load-more")}
                    </Button>
                </Grid>
            )}
            {pending && (
                <CircularProgress size={50}
                                  color="primary"
                                  className={classes.centered}
                />
            )}
        </Grid>
    );
});
