import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    FormControlLabel,
    Switch
} from "@mui/material";
import {useLocalization, useStore} from "../../store";

export const ChatVisibilityCard: FunctionComponent = observer(() => {
    const {
        chatUpdate: {
            formValues,
            pending,
            setFormValue,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            <CardHeader title={l("chat.visibility")}/>
            <CardContent>
                <FormControlLabel control={
                    <Switch checked={formValues.hideFromSearch}
                            onChange={() => setFormValue("hideFromSearch", !formValues.hideFromSearch)}
                    />
                }
                                  label={l("chat.visibility.hide-from-search")}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={submitForm}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("save-changes")}
                </Button>
            </CardActions>
        </Card>
    );
});
