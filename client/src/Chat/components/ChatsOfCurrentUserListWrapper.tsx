import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {createStyles, Hidden, makeStyles, Theme} from "@material-ui/core";
import clsx from "clsx";
import {ChatsOfCurrentUserList} from "./ChatsOfCurrentUserList";
import {CreateChatFloatingActionButton} from "./CreateChatFloatingActionButton";
import {CreateChatDialog} from "./CreateChatDialog";
import {ChatsOfCurrentUserListProps} from "../types";
import {canCreateChat} from "../permissions";
import {ChatsAndMessagesSearchInput, ChatsAndMessagesSearchResult} from "../../ChatsAndMessagesSearch";
import {useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    chatListWrapper: {
        [theme.breakpoints.up("lg")]: {
            height: `calc(100vh - 64px)`,
            width: 480,
            overflow: "auto"
        },
        [theme.breakpoints.down("md")]: {
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
        authorization
    } = useStore();
    const classes = useStyles();
    const [hovered, setHovered] = useState(false);

    const listProps: ChatsOfCurrentUserListProps = {
        classes: {
            circularProgress: classes.centered,
            list: clsx({
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
               <Hidden mdDown>
                   <div style={{flex: 1}}>
                       <ChatsAndMessagesSearchInput style={{padding: "8px"}}/>
                   </div>
               </Hidden>
               {searchModeActive
                   ? <ChatsAndMessagesSearchResult {...listProps}/>
                   : <ChatsOfCurrentUserList {...listProps}/>
               }
               <Hidden lgUp>
                   {canCreateChat(authorization) && <CreateChatFloatingActionButton/>}
               </Hidden>
               <Hidden mdDown>
                   {hovered && (authorization) && <CreateChatFloatingActionButton/>}
               </Hidden>
           </div>
           <CreateChatDialog/>
       </Fragment>
    )
})