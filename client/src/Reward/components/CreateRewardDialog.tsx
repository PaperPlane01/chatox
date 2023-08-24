import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {RewardForm} from "./RewardForm";
import {RewardedUserSelect} from "./RewardedUserSelect";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    } else {
        return l("reward.create.error.unknown", {errorStatus: error.status});
    }
};

export const CreateRewardDialog: FunctionComponent = observer(() => {
    const {
        rewardCreation: {
            formValues,
            formErrors,
            createRewardDialogOpen,
            error,
            pending,
            setFormValue,
            setCreateRewardDialogOpen,
            submitForm
        },
        rewardCreationUserSelect: {
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
        <Dialog open={createRewardDialogOpen}
                onClose={() => setCreateRewardDialogOpen(false)}
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
                                <RewardedUserSelect formValues={userSelectFormValues}
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
                <Button onClick={submitForm}
                        disabled={pending}
                        variant="contained"
                        color="primary"
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("common.create")}
                </Button>
                <Button onClick={() => setCreateRewardDialogOpen(false)}
                        disabled={pending}
                        variant="outlined"
                        color="secondary"
                >
                    {l("cancel")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
