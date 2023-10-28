import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Button,
    CircularProgress,
    TextField,
    Switch,
    FormControlLabel
} from "@mui/material";
import {useStore, useLocalization} from "../../store";
import {TimeUnitSelect} from "../../TimeUnitSelect";
import {TimeUnit} from "../../api/types/response";
import {BaseSettingsTabProps} from "../../utils/types";

export const SlowModeForm: FunctionComponent<BaseSettingsTabProps> = observer(({
    hideHeader = false
}) => {
    const {
        chatUpdate: {
            formValues,
            formErrors,
            pending,
            setFormValue,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("chat.management.tab.SLOW_MODE")}/>}
            <CardContent>
                <FormControlLabel control={
                    <Switch checked={formValues.slowModeEnabled}
                            onChange={event => setFormValue("slowModeEnabled", event.target.checked)}
                    />
                }
                                  label={l("chat.slow-mode.enabled")}
                />
                <TextField label={l("chat.slow-mode.interval")}
                           value={formValues.slowModeInterval}
                           fullWidth
                           margin="dense"
                           error={Boolean(formErrors.slowModeInterval)}
                           helperText={formErrors.slowModeInterval && l(formErrors.slowModeInterval)}
                           onChange={event => setFormValue("slowModeInterval", event.target.value)}
                />
                <TimeUnitSelect value={formValues.slowModeUnit}
                                onSelect={timeUnit => setFormValue("slowModeUnit", timeUnit)}
                                onClear={() => setFormValue("slowModeUnit", undefined)}
                                allowedUnits={[TimeUnit.SECONDS, TimeUnit.MINUTES, TimeUnit.HOURS]}
                                error={Boolean(formErrors.slowModeUnit)}
                                errorText={formErrors.slowModeUnit && l(formErrors.slowModeUnit)}
                />
            </CardContent>
            <CardActions>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={submitForm}
                >
                    {pending && <CircularProgress size={15} color="secondary"/>}
                    {l("save-changes")}
                </Button>
            </CardActions>
        </Card>
    );
});
