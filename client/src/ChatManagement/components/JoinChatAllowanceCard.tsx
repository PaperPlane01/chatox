import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, CardActions, CircularProgress, Button} from "@mui/material";
import {JoinChatAllowanceForm} from "../../JoinChatAllowanceForm";
import {useLocalization, useStore} from "../../store";
import {BaseSettingsTabProps} from "../../utils/types";

export const JoinChatAllowanceCard: FunctionComponent<BaseSettingsTabProps> = observer(({
    hideHeader
}) => {
    const {
        chatUpdate: {
            formValues,
            pending,
            error,
            setJoinAllowance,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            {!hideHeader && (
                <CardHeader title={l("join.chat.allowance")}/>
            )}
            <CardContent>
                <JoinChatAllowanceForm formValues={formValues.joinAllowanceSettings}
                                       setValue={setJoinAllowance}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={submitForm}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("chat.update.save-changes")}
                </Button>
            </CardActions>
        </Card>
    );
});
