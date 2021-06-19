import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, Tab, useMediaQuery, useTheme} from "@material-ui/core";
import {TabContext, TabList, TabPanel} from "@material-ui/lab";
import {EmojiData, Picker} from "emoji-mart";
import {StickerPicker} from "../../Sticker";
import {useLocalization, useStore} from "../../store";
import {makeStyles} from "@material-ui/core/styles";

interface EmojiAndStickerPickerProps {
    onEmojiPicked: (emoji: EmojiData) => void,
    onStickerPicked: () => void
}

const useStyles = makeStyles(() => createStyles({
    pickerContainer: {
        width: 350
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
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
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
