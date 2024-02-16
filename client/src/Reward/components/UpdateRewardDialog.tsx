import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {RewardForm} from "./RewardForm";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {UserSelect} from "../../UserSelect";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    } else {
        return l("reward.update.error.unknown", {errorStatus: error.status});
    }
};

export const UpdateRewardDialog: FunctionComponent = observer(() => {
    const {
        rewardUpdate: {
            formValues,
            formErrors,
            updateRewardDialogOpen,
            error,
            pending,
            setFormValue,
            setRewardId,
            submitForm
        },
        rewardUpdateUserSelect: {
            formValues: userSelectFormValues,
            formErrors: userSelectFormErrors,
            pending: userPending,
            error: userError,
            selectedUser,
            setFormValue: setUserFormValue,
            submitForm: fetchUser,
            setSelectedUser
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    const {l} = useLocalization();

    return (
        <Dialog open={updateRewardDialogOpen}
                onClose={() => setRewardId(undefined)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            <DialogTitle>
                {l("reward.create")}
            </DialogTitle>
            <DialogContent>
                <RewardForm formValues={formValues}
                            formErrors={formErrors}
                            setFormValue={setFormValue}
                            rewardedUserSelect={(
                                <UserSelect formValues={userSelectFormValues}
                                            formErrors={userSelectFormErrors}
                                            pending={userPending}
                                            error={userError}
                                            selectedUser={selectedUser}
                                            setFormValue={setUserFormValue}
                                            submitForm={fetchUser}
                                            onClear={() => setSelectedUser(undefined)}
                                />
                            )}
                />
                {error && (
                    <Typography style={{color: "red"}}>
                        {getErrorText(error, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setRewardId(undefined)}
                        disabled={pending}
                        variant="outlined"
                        color="secondary"
                >
                    {l("cancel")}
                </Button>
                <Button onClick={submitForm}
                        disabled={pending}
                        variant="contained"
                        color="primary"
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("common.update")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
