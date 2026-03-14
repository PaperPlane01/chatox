import React, {Fragment, FunctionComponent, useLayoutEffect, useRef, useState} from "react";
import {observer} from "mobx-react";
import {Box, Theme, useMediaQuery, useTheme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ChatsOfCurrentUserList} from "./ChatsOfCurrentUserList";
import {CreateChatFloatingActionButton} from "./CreateChatFloatingActionButton";
import {CreateChatDialog} from "./CreateChatDialog";
import {ChatsOfCurrentUserListProps} from "../types";
import {ChatsAndMessagesSearchInput, ChatsAndMessagesSearchResult} from "../../ChatsAndMessagesSearch";
import {usePermissions, useStore} from "../../store";
import {commonStyles} from "../../style";

const useStyles = makeStyles()((theme: Theme) => ({
    centered: commonStyles.centered,
    chatListWrapper: {
        [theme.breakpoints.up("lg")]: {
            height: `calc(100vh - 64px)`,
            width: 300,
            overflow: "auto"
        },
        [theme.breakpoints.up("xl")]: {
            height: `calc(100vh - 64px)`,
            width: 480,
            overflow: "auto"
        },
        [theme.breakpoints.down("lg")]: {
            width: "100%"
        },
        position: "relative"
    },
    chatList: {
        width: "100%"
    },
    noTopBottomPadding: {
        paddingTop: 0,
        paddingBottom: 0
    },
    noLeftRightPadding: {
        paddingLeft: 0,
        paddingRight: 0
    }
}));

export const ChatsOfCurrentUserListWrapper: FunctionComponent = observer(() => {
    const {
        chatsAndMessagesSearchQuery: {
            searchModeActive
        },
    } = useStore();
    const {
        chats: {
            canCreateChat
        }
    } = usePermissions();

    const {classes, cx} = useStyles();
    const [hovered, setHovered] = useState(false);
    const [createChatButtonRight, setCreateChatButtonRight] = useState<number | undefined>();
    const theme = useTheme<Theme>();
    const onLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
    const listRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(
        () => {
            if (onLargeScreen && listRef && listRef.current) {
                const right = window.innerWidth - listRef.current?.getBoundingClientRect().width
                    + Number(theme.spacing(2).replace("px", ""))
                setCreateChatButtonRight(right);
            }
        },
        [listRef]
    );

    const listProps: ChatsOfCurrentUserListProps = {
        classes: {
            circularProgress: classes.centered,
            list: cx({
                [classes.noTopBottomPadding]: true,
                [classes.chatList]: true
            }),
            accordion: classes.noLeftRightPadding,
            accordionDetails: classes.noLeftRightPadding
        }
    };

    return (
        <Fragment>
            <div className={classes.chatListWrapper}
                 onMouseEnter={() => setHovered(true)}
                 onMouseLeave={() => setHovered(false)}
            >
                <Box sx={{
                    display: {
                        xs: "none",
                        lg: "block"
                    }
                }}>
                    <div style={{
                        flex: 1,
                        position: "sticky",
                        backgroundColor: theme.palette.background.default,
                        zIndex: 100,
                        top: 0
                    }}>
                        <ChatsAndMessagesSearchInput style={{padding: theme.spacing(1)}}/>
                    </div>
                </Box>
                <div ref={listRef}>
                    {searchModeActive
                        ? <ChatsAndMessagesSearchResult {...listProps}/>
                        : <ChatsOfCurrentUserList {...listProps}/>
                    }
                </div>
                <Box sx={{
                    display: {
                        lg: "none",
                        xs: "block"
                    }
                }}>
                    {canCreateChat && <CreateChatFloatingActionButton/>}
                </Box>
                <Box sx={{
                    display: {
                        xs: "none",
                        lg: "block"
                    }
                }}>
                    {hovered && canCreateChat && <CreateChatFloatingActionButton right={createChatButtonRight}/>}
                </Box>
            </div>
            <CreateChatDialog/>
        </Fragment>
    );
});
