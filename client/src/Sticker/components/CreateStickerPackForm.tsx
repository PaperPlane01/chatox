import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    CircularProgress,
    TextField,
    Typography
} from "@mui/material";
import {EditableStickersList} from "./EditableStickersList";
import {CreateStickerDialog} from "./CreateStickerDialog";
import {useLocalization, useStore} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("sticker.pack.create.error.server-unreachable");
    } else {
        return l("sticker.pack.create.error.unknown", {errorStatus: error.status});
    }
};

export const CreateStickerPackForm: FunctionComponent = observer(() => {
    const {
        stickerPackCreation: {
            stickerContainers,
            formValues,
            formErrors,
            pending,
            error,
            stickerUnderCreation,
            editedStickerId,
            submitForm,
            setFormValue,
        }
    } = useStore();
    const {l} = useLocalization();
    const stickerContainerForDialog = stickerUnderCreation
        ? stickerUnderCreation
        : editedStickerId ? formValues.stickers[editedStickerId] : undefined

    return (
        <Fragment>
            <Card>
                <CardHeader title={l("sticker.pack.create")}/>
                <CardContent>
                    <TextField label={l("sticker.pack.name")}
                               value={formValues.name}
                               onChange={event => setFormValue("name", event.target.value)}
                               fullWidth
                               margin="dense"
                               error={Boolean(formErrors.name)}
                               helperText={formErrors.name && l(formErrors.name)}
                    />
                    <TextField label={l("sticker.pack.author")}
                               value={formValues.author}
                               onChange={event => setFormValue("author", event.target.value)}
                               fullWidth
                               margin="dense"
                               error={Boolean(formErrors.author)}
                               helperText={formErrors.author && l(formErrors.author)}
                    />
                    <TextField label={l("sticker.pack.description")}
                               value={formValues.description}
                               onChange={event => setFormValue("description", event.target.value)}
                               fullWidth
                               margin="dense"
                               error={Boolean(formErrors.description)}
                               helperText={formErrors.description && l(formErrors.description)}
                               multiline
                               rows={4}
                               maxRows={Number.MAX_SAFE_INTEGER}
                    />
                    <EditableStickersList stickerContainers={stickerContainers}/>
                    {error && (
                        <Typography style={{color: "red"}}>
                            {getErrorText(error, l)}
                        </Typography>
                    )}
                </CardContent>
                <CardActions>
                    <Button onClick={submitForm}
                            variant="contained"
                            color="primary"
                            disabled={pending}
                    >
                        {pending && <CircularProgress size={15} color="primary"/>}
                        {l("sticker.pack.create")}
                    </Button>
                </CardActions>
            </Card>
            {stickerContainerForDialog && <CreateStickerDialog stickerContainer={stickerContainerForDialog}/>}
        </Fragment>
    );
});
