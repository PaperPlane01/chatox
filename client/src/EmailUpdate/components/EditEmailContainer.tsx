import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Card, CardHeader, CardContent, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {LinkEmailButton} from "./LinkEmailButton";
import {UpdateEmailButton} from "./UpdateEmailButton";
import {UpdateEmailDialog} from "./UpdateEmailDialog";
import {useAuthorization, useLocalization} from "../../store";

const useStyles = makeStyles(() => createStyles({
    editEmailWrapper: {
        display: "flex"
    }
}));

export const EditEmailContainer: FunctionComponent = observer(() => {
    const {currentUser} = useAuthorization();
    const {l} = useLocalization();
    const classes = useStyles();

    if (!currentUser) {
        return null;
    }

    return (
       <Fragment>
           <Card>
               <CardHeader title={l("email")}/>
               <CardContent className={classes.editEmailWrapper}>
                   {currentUser.email
                       ? (
                           <Fragment>
                               <Typography>{currentUser.email}</Typography>
                               <UpdateEmailButton/>
                           </Fragment>
                       )
                       : (
                           <Fragment>
                               <Typography>
                                   {l("email.no-email")}
                               </Typography>
                               <LinkEmailButton/>
                           </Fragment>
                       )
                   }
               </CardContent>
           </Card>
           <UpdateEmailDialog/>
       </Fragment>
    );
});
