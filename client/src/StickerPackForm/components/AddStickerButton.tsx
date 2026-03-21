import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {StickerPackFormContext} from "../types";
import {useStickerPackForm} from "../hooks";
import {useLocalization} from "../../store";
import {commonStyles} from "../../style";

interface AddStickerButtonProps {
    context: StickerPackFormContext
}

const useStyles = makeStyles()((theme: Theme) => ({
    centered: {
        ...commonStyles.centered,
        flexDirection: "column",
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
    const {classes} = useStyles();

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
