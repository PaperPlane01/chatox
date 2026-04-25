import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, DialogContent, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useLocalization} from "../../store";
import {commonStyles} from "../../style";

const useStyles = makeStyles()(() => ({
    centered: commonStyles.centered
}));

export const UpdateEmailPending: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {classes} = useStyles();

    return (
        <DialogContent>
            <Typography>
                {l("email.update.in-progress")}
            </Typography>
            <div className={classes.centered}>
                <CircularProgress size={25} color="primary"/>
            </div>
        </DialogContent>
    );
});