import React, {FunctionComponent, ReactNode} from "react";
import {CircularProgress, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {observer} from "mobx-react";
import {HttpStatusCode} from "axios";
import {ChatInviteCard} from "./ChatInviteCard";
import {commonStyles} from "../../style";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";
import {HasAnyRole} from "../../Authorization";

const useStyles = makeStyles(() => createStyles({
    chatInviteWrapper: {
        ...commonStyles.centered,
    }
}));

const getErrorText = (error: ApiError, l: TranslationFunction) => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("server.unreachable");
    } else if (error.status === HttpStatusCode.NotFound) {
        return l("chat.invite.error.not-found");
    } else {
        return l("chat.invite.error.unknown", {errorStatus: error.status});
    }
};

export const ChatInviteCardWrapper: FunctionComponent = observer(() => {
    const {
        chatInvite: {
            pending,
            error
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    let content: ReactNode;

    if (pending) {
        content = <CircularProgress size={25} color="primary"/>;
    } else if (error) {
        content = <Typography variant="h4">{getErrorText(error, l)}</Typography>;
    } else  {
        content = <ChatInviteCard/>;
    }

    return (
       <HasAnyRole roles={["ROLE_ACCESS_TOKEN_PRESENT", "ROLE_USER", "ROLE_ANONYMOUS_USER", "ROLE_ADMIN"]}
                   alternative={(
                       <Typography>
                           {l("common.no-access")}
                       </Typography>
                   )}
       >
           <div className={classes.chatInviteWrapper}>
               {content}
           </div>
       </HasAnyRole>
    );
});
