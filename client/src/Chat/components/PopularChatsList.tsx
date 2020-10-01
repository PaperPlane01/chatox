import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, createStyles, Grid, makeStyles} from "@material-ui/core";
import {PopularChatsListItem} from "./PopularChatsListItem";
import {useStore} from "../../store/hooks";

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
                pending
            }
        }
    } = useStore();
    const classes = useStyles();

    return (
        <Grid container spacing={2} alignItems="stretch">
            {popularChats.map(popularChatId => (
                <Grid item xs={12} key={popularChatId}>
                    <PopularChatsListItem chatId={popularChatId}/>
                </Grid>
            ))}
            {pending && (
                <CircularProgress size={50}
                                  color="primary"
                                  className={classes.centered}
                />
            )}
        </Grid>
    );
});
