import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Tab, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import {EmojiData} from "emoji-mart";
import {StickerPicker} from "../../Sticker";
import {useLocalization, useStore} from "../../store";

//FIXME Temporary fix due to broken type definitions
const {Picker} = require("emoji-mart");

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
}))

export const EmojiAndStickerPicker: FunctionComponent<EmojiAndStickerPickerProps> = observer(({
    onEmojiPicked,
    onStickerPicked
}) => {
    const {
        emoji: {
            selectedEmojiSet
        },
        emojiPickerTabs: {
            selectedTab,
            setSelectedTab
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const pickerStyles = onSmallScreen
        ? {width: "100%", backgroundColor: theme.palette.background.paper}
        : {};

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
                    <Picker set={selectedEmojiSet === "native" ? undefined : selectedEmojiSet}
                            onSelect={onEmojiPicked}
                            autoFocus={false}
                            native={selectedEmojiSet === "native"}
                            style={pickerStyles}
                    />
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
