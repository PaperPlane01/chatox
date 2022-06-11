import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Grid, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {PopularChatsListItem} from "./PopularChatsListItem";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
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
    const classes = useStyles();

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6">
                    {l("chats.popular")}
                </Typography>
            </Grid>
            {popularChats.map(popularChatId => (
                <Grid item xs={12} key={popularChatId}>
                    <PopularChatsListItem chatId={popularChatId}/>
                </Grid>
            ))}
            {!noMoreItems && (
                <Grid item xs={12}>
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
