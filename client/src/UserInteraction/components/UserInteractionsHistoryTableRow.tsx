import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TableCell, TableRow, Typography} from "@mui/material";
import {format} from "date-fns";
import {USER_INTERACTIONS_ICONS_MAP} from "./UserInteractionIcons";
import {useEntities, useLocalization} from "../../store";
import {Labels} from "../../localization";
import {UserLink} from "../../UserLink";

interface UserInteractionsTableRowProps {
    userInteractionId: string
}

export const UserInteractionsHistoryTableRow: FunctionComponent<UserInteractionsTableRowProps> = observer(({
    userInteractionId
}) => {
    const {
        userInteractions: {
            findById: findUserInteraction
        },
        users: {
            findById: findUser
        }
    } = useEntities();
    const {l} = useLocalization();
    const userInteraction = findUserInteraction(userInteractionId);
    const user = findUser(userInteraction.userId);

    return (
        <TableRow>
            <TableCell sx={theme => ({
                display: "flex",
                gap: theme.spacing(1)
            })}>
                {USER_INTERACTIONS_ICONS_MAP[userInteraction.type]}
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
                {format(userInteraction.createdAt, "dd-MM-yyyy hh:mm")}
            </TableCell>
        </TableRow>
    )
})