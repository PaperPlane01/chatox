import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, CircularProgress, List} from "@material-ui/core";
import {BlacklistedUsersListItem} from "./BlacklistedUsersListItem";
import {useLocalization, useStore} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getTextFromError = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    }

    return l("blacklist.users.error", {errorStatus: error.status});
}

export const BlacklistedUsersList: FunctionComponent = observer(() => {
    const {
        blacklistedUsers: {
            usersIds,
            pending,
            error,
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("blacklist.users")}/>
            <CardContent> {pending && <CircularProgress size={50} color="primary"/>}
                {error && getTextFromError(error, l)}
                <List>
                    {usersIds.map(userId => <BlacklistedUsersListItem key={userId} userId={userId}/>)}
                </List>
            </CardContent>
        </Card>
    );
});