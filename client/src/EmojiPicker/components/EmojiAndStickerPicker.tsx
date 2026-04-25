import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Tab, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {EmojiData} from "emoji-mart";
import {EmojiPicker} from "./EmojiPicker";
import {StickerPicker} from "../../Sticker";
import {useLocalization, useStore} from "../../store";

interface EmojiAndStickerPickerProps {
    onEmojiPicked: (emoji: EmojiData) => void,
    onStickerPicked: () => void
}

const useStyles = makeStyles()((theme: Theme) => ({
    pickerContainer: {
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        [theme.breakpoints.up("lg")]: {
            maxWidth: 500
        }
    },
    tabPanelRoot: {
        padding: 0
    }
}));

export const EmojiAndStickerPicker: FunctionComponent<EmojiAndStickerPickerProps> = observer(({
    onEmojiPicked,
    onStickerPicked
}) => {
    const {
        emojiPickerTabs: {
            selectedTab,
            setSelectedTab
        }
    } = useStore();
    const {l} = useLocalization();
    const {classes} = useStyles();

    return (
        <div className={classes.pickerContainer}>
            <TabContext value={selectedTab}>
                <TabList onChange={(_, newValue) => setSelectedTab(newValue)} centered>
                    <Tab label={l("emoji.picker.tab.emoji")} value="emoji"/>
                    <Tab label={l("emoji.picker.tab.stickers")} value="stickers"/>
                </TabList>
                <TabPanel value="emoji"
                          classes={{
                              root: classes.tabPanelRoot
                          }}
                >
                    <EmojiPicker onEmojiPicked={onEmojiPicked}/>
                </TabPanel>
                <TabPanel value="stickers"
                          classes={{
                              root: classes.tabPanelRoot
                          }}
                >
                    <StickerPicker onStickerPicked={onStickerPicked}/>
                </TabPanel>
            </TabContext>
        </div>
    );
});
