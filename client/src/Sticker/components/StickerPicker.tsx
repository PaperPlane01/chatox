import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Tab, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {useSnackbar} from "notistack";
import {isAfter} from "date-fns";
import {StickersGridList} from "./StickersGridList";
import {StickerPackPreview} from "./StickerPackPreview";
import {useLocalization, useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";
import {useEntitiesByIds, useEntitiesSelector} from "../../entities";

interface StickerPickerProps {
    onStickerPicked?: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    stickerPickerWrapper: {
      overflow: "hidden"
    },
    tabPanelRoot: {
        overflowY: "auto",
        overflowX: "hidden",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        height: 348,
        paddingLeft: 0,
        paddingRight: 0,
        scrollbarWidth: "thin"
    },
    imageWrapper: {
        display: "inline-block",
        position: "relative",
        height: "100%",
        width: "100%",
        cursor: "pointer"
    },
    tabRoot: {
        width: 48,
        height: 48,
        minWidth: 48,
        padding: theme.spacing(1)
    }
}));

export const StickerPicker: FunctionComponent<StickerPickerProps> = observer(({onStickerPicked}) => {
    const {
        installedStickerPacks: {
            installedStickerPacksIds
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
    const stickerPacks = useEntitiesByIds("stickerPacks", installedStickerPacksIds);
    const stickerPackPreviews = useEntitiesSelector(
        "uploads",
        entities => entities.uploads.findStickers(stickerPacks.map(stickerPack => stickerPack.previewId))
    );
    const previewMap = new Map(stickerPackPreviews.map(preview => [preview.id, preview]));

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
        <div className={classes.stickerPickerWrapper}>
            <TabContext value={selectedStickerPackId ?? installedStickerPacksIds[0]}>
                <TabList orientation="horizontal"
                         onChange={(_, newValue) => setSelectedStickerPackId(newValue)}
                >
                    {stickerPacks.map(stickerPack => (
                        <Tab value={stickerPack.id}
                             key={stickerPack.id}
                             icon={
                                 <div className={classes.imageWrapper}>
                                     <StickerPackPreview stickersType={stickerPack.stickersType}
                                                         upload={previewMap.get(stickerPack.previewId)!}
                                                         width="100%"
                                                         height="100%"
                                     />
                                 </div>
                             }
                             classes={{
                                 root: classes.tabRoot
                             }}
                        />
                    ))}
                </TabList>
                {installedStickerPacksIds.map(stickerPackId => (
                    <TabPanel value={stickerPackId}
                              classes={{
                                  root: classes.tabPanelRoot
                              }}
                              key={`${stickerPackId}_tabPanel`}
                    >
                        <StickersGridList stickerPackId={stickerPackId}
                                          onStickerClick={handleStickerSelection}
                                          stickerSize={256}
                        />
                    </TabPanel>
                ))}
            </TabContext>
        </div>
    );
});
