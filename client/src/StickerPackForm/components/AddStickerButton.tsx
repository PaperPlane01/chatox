import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {StickerPackFormContext} from "../types";
import {useStickerPackForm} from "../hooks";
import {useLocalization} from "../../store";

interface AddStickerButtonProps {
    context: StickerPackFormContext
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "100%"
    },
    bordered: {
        border: `3px ${theme.palette.divider}`,
        borderRadius: 3,
        borderStyle: "dashed",
        height: "100%"
    }
}));

export const AddStickerButton: FunctionComponent<AddStickerButtonProps> = observer(({
    context
}) => {
    const {initiateStickerCreation} = useStickerPackForm(context);
    const {l} = useLocalization();
    const classes = useStyles();

    return (
        <div className={classes.bordered}>
            <div className={classes.centered}>
                <Button variant="contained"
                        color="primary"
                        onClick={initiateStickerCreation}
                >
                    {l("sticker.add")}
                </Button>
            </div>
        </div>
    );
});
