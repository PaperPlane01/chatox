import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, CircularProgress} from "@mui/material";
import {CreateStickerDialog} from "./CreateStickerDialog";
import {EditStickerDialog} from "./EditStickerDialog";
import {StickersTypeSelect} from "./StickersTypeSelect";
import {StickerPackFormFields} from "./StickerPackFormFields";
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
            formValues,
            pending,
            stickerUnderCreation,
            editedSticker,
            submitForm,
            reset
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <Card>
                <CardHeader title={l("sticker.pack.create")}/>
                <CardContent>
                    {!formValues.stickersType && (
                        <StickersTypeSelect/>
                    )}
                    {formValues.stickersType && (
                        <StickerPackFormFields context="stickerPackCreation"
                                               getErrorText={getErrorText}
                        />
                    )}
                </CardContent>
                <CardActions>
                    <Button onClick={reset}
                            color="secondary"
                            variant="outlined"
                    >
                        {l("cancel")}
                    </Button>
                    {formValues.stickersType && (
                        <Button onClick={submitForm}
                                variant="contained"
                                color="primary"
                                disabled={pending}
                        >
                            {pending && <CircularProgress size={15} color="primary"/>}
                            {l("sticker.pack.create")}
                        </Button>
                    )}
                </CardActions>
            </Card>
            {stickerUnderCreation && (
                <CreateStickerDialog stickerContainer={stickerUnderCreation} context="stickerPackCreation"/>
            )}
            {editedSticker && <EditStickerDialog stickerContainer={editedSticker} context="stickerPackCreation"/>}
        </Fragment>
    );
});
