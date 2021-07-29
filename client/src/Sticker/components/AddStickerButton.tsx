import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, createStyles, makeStyles, Theme} from "@material-ui/core";
import {useStore, useLocalization} from "../../store";

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
        height: "100%",
    }
}))

export const AddStickerButton: FunctionComponent = observer(() => {
    const {
        stickerPackCreation: {
            initiateStickerCreation
        }
    } = useStore();
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
