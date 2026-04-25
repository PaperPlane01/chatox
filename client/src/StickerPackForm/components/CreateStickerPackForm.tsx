import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, CircularProgress} from "@mui/material";
import {CreateStickerDialog} from "./CreateStickerDialog";
import {EditStickerDialog} from "./EditStickerDialog";
import {StickersTypeSelect} from "./StickersTypeSelect";
import {StickerPackFormFields} from "./StickerPackFormFields";
import {getCreateStickerPackText} from "../utils";
import {useLocalization, useStore} from "../../store";

export const CreateStickerPackForm: FunctionComponent = observer(() => {
    const {
        stickerPackCreation: {
            stickersType,
            pending,
            stickerUnderCreation,
            editedSticker,
            setStickersType,
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
                    {!stickersType && (
                        <StickersTypeSelect value={stickersType}
                                            onChange={setStickersType}
                        />
                    )}
                    {stickersType && (
                        <StickerPackFormFields context="stickerPackCreation"
                                               getErrorText={getCreateStickerPackText}
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
                    {stickersType && (
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
