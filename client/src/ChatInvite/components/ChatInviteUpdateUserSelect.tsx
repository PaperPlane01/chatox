import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {UserSelect} from "../../UserSelect";
import {useStore} from "../../store";

export const ChatInviteUpdateUserSelect: FunctionComponent = observer(() => {
    const {
        chatInviteUpdateUserSelect: {
            formValues,
            formErrors,
            selectedUser,
            error,
            pending,
            setFormValue,
            submitForm,
            reset,
        }
    } = useStore();

    return (
        <UserSelect formValues={formValues}
                    formErrors={formErrors}
                    pending={pending}
                    selectedUser={selectedUser}
                    error={error}
                    setFormValue={setFormValue}
                    submitForm={submitForm}
                    onClear={reset}
        />
    );
});
