import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import {CircularProgress, Theme} from "@mui/material";
import {CreateUserInteractionButton} from "./CreateUserInteractionButton";
import {commonStyles} from "../../style";
import {useStore} from "../../store";
import {UserInteractionType} from "../../api/types/response";

const useStyles = makeStyles()((theme: Theme) => ({
    userInteractionsCount: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        padding: theme.spacing(2),
        justifyContent: "space-between"
    },
    centered: commonStyles.centered,
}));

export const UserInteractionsCount: FunctionComponent = observer(() => {
    const {
        userInteractionsCount: {
            pending
        }
    } = useStore();
    const {classes} = useStyles();

    if (pending) {
        return <CircularProgress color="primary" size={25} className={classes.centered}/>;
    }

    return (
        <div className={classes.userInteractionsCount}>
            <CreateUserInteractionButton type={UserInteractionType.LIKE}/>
            <CreateUserInteractionButton type={UserInteractionType.DISLIKE}/>
            <CreateUserInteractionButton type={UserInteractionType.LOVE}/>
        </div>
    );
});
