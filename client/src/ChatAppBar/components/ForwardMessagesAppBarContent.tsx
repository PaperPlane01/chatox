import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, darken, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Cancel, Forward} from "@mui/icons-material";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {getForwardMessagesLabel} from "../../Message/utils";

const useStyles = makeStyles((theme: Theme) => createStyles({
    appBarButtonsContainer: {
      display: "flex",
      gap: theme.spacing(1)
    },
    appBarButton: {
        background: theme.palette.getContrastText(theme.palette.text.primary),
        color: theme.palette.text.primary,
        "&:hover": {
            background: darken(theme.palette.getContrastText(theme.palette.text.primary), 0.2)
        }
    }
}));

export const ForwardMessagesAppBarContent: FunctionComponent = observer(() => {
    const {
        messagesForwarding: {
            forwardedMessagesIds,
            reset
        }
    } = useStore();
    const {l} = useLocalization();
    const router = useRouter();
    const classes = useStyles();
    const label = getForwardMessagesLabel(forwardedMessagesIds.length, l);

    return (
       <div className={classes.appBarButtonsContainer}>
           <Button onClick={() => router.goTo(Routes.myChats)}
                   className={classes.appBarButton}
                   disableFocusRipple
                   disableRipple
                   disableTouchRipple
           >
               <Forward/>
               {label}
           </Button>
           <Button onClick={reset}
                   className={classes.appBarButton}
                   disableFocusRipple
                   disableRipple
                   disableTouchRipple
           >
               <Cancel/>
               {l("cancel")}
           </Button>
       </div>
    );
});