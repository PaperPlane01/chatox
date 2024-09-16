import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Tab} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {EmojiData} from "emoji-mart";
import {StickerPicker} from "../../Sticker";
import {useLocalization, useStore} from "../../store";
import {EmojiPicker} from "./EmojiPicker";

interface EmojiAndStickerPickerProps {
    onEmojiPicked: (emoji: EmojiData) => void,
    onStickerPicked: () => void
}

const useStyles = makeStyles(() => createStyles({
    pickerContainer: {
        width: "100%"
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
    const classes = useStyles();

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
