import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableCell, TableRow, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {format} from "date-fns";
import {USER_INTERACTIONS_ICONS_MAP} from "./UserInteractionIcons";
import {useLocalization} from "../../store";
import {useEntityById} from "../../entities";
import {Labels} from "../../localization";
import {UserLink} from "../../UserLink";

interface UserInteractionsTableRowProps {
    userInteractionId: string
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    interactionTypeCell: {
        display: "flex",
        gap: theme.spacing(2)
    },
    interactionIconWrapper: {
        color: theme.palette.primary.main
    }
}));

export const UserInteractionsHistoryTableRow: FunctionComponent<UserInteractionsTableRowProps> = observer(({
    userInteractionId
}) => {
    const {l} = useLocalization();
    const classes = useStyles();
    const userInteraction = useEntityById("userInteractions", userInteractionId);
    const user = useEntityById("users", userInteraction.userId);

    return (
        <TableRow>
            <TableCell className={classes.interactionTypeCell}>
                <div className={classes.interactionIconWrapper}>
                    {USER_INTERACTIONS_ICONS_MAP[userInteraction.type]}
                </div>
                <Typography>
                    {l(`user.interaction.${userInteraction.type}` as keyof Labels)}
                </Typography>
            </TableCell>
            <TableCell>
                <UserLink user={user}
                          displayAvatar
                />
            </TableCell>
            <TableCell>
                {format(userInteraction.createdAt, "dd-MM-yyyy HH:mm")}
            </TableCell>
        </TableRow>
    );
});
