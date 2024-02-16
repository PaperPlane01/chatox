import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Tab, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {useSnackbar} from "notistack";
import {isAfter} from "date-fns";
import {StickersGridList} from "./StickersGridList";
import {useLocalization, useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

interface StickerPickerProps {
    onStickerPicked?: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    imageWrapper: {
        display: "inline-block",
        position: "relative",
        height: "100%",
        width: "100%",
        cursor: "pointer"
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%",
        height: "inherit",
        objectFit: "contain"
    },
    tabRoot: {
        width: 48,
        height: 48,
        minWidth: 48,
        padding: theme.spacing(1)
    },
    tabPanelRoot: {
        overflowY: "auto",
        overflowX: "hidden",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        height: 348,
        paddingLeft: 0,
        paddingRight: 0,
    }
}));

export const StickerPicker: FunctionComponent<StickerPickerProps> = observer(({onStickerPicked}) => {
    const {
        installedStickerPacks: {
            installedStickerPacksIds
        },
        entities: {
            stickerPacks: {
                findById: findStickerPack
            },
            uploads: {
                findById: findImage
            }
        },
        stickerPicker: {
            selectedStickerPackId,
            setSelectedStickerPackId
        },
        messageCreation: {
            selectedChatId,
            getNextMessageDate,
            sendSticker
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    if (installedStickerPacksIds.length === 0) {
        return null;
    }

    const handleStickerSelection = (stickerId: string): void => {
        if (!selectedChatId) {
            return;
        }

        const nextDate = getNextMessageDate(selectedChatId);

        if (isDefined(nextDate) && isAfter(nextDate, new Date())) {
            enqueueSnackbar(l("message.send.wait"), {variant: "error"});
            return;
        }

        sendSticker(stickerId);

        if (onStickerPicked) {
            onStickerPicked();
        }
    };

    return (
        <div style={{overflow: "hidden"}}>
            <TabContext value={selectedStickerPackId || installedStickerPacksIds[0]}>
                <TabList orientation="horizontal"
                         onChange={(_, newValue) => setSelectedStickerPackId(newValue)}
                >
                    {installedStickerPacksIds.map(stickerPackId => {
                        const stickerPack = findStickerPack(stickerPackId);
                        const preview = findImage(stickerPack.previewId);

                        return (
                            <Tab value={stickerPackId}
                                 icon={
                                     <div className={classes.imageWrapper}>
                                         <img src={`${preview.uri}?size=64`}
                                              className={classes.image}
                                         />
                                     </div>
                                 }
                                 classes={{
                                     root: classes.tabRoot
                                 }}
                            />
                        )
                    })}
                </TabList>
                {installedStickerPacksIds.map(stickerPackId => (
                    <TabPanel value={stickerPackId}
                              classes={{
                                  root: classes.tabPanelRoot
                              }}
                    >
                        <StickersGridList stickerPackId={stickerPackId}
                                          onStickerClick={handleStickerSelection}
                                          gridListTileHeight={64}
                                          gridListTileWidth={64}
                        />
                    </TabPanel>
                ))}
            </TabContext>
        </div>
    );
});
