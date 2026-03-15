import React, {Fragment, FunctionComponent} from "react";
import {Box, Grid} from "@mui/material";
import {ChatAppBar} from "../ChatAppBar";
import {MessagesListWrapper} from "../Message";
import {ChatsOfCurrentUserList} from "../Chat";
import {DeleteStickerPackDialog, StickerPackDialog} from "../Sticker/components";

export const NewPrivateChatPage: FunctionComponent = () => (
    <Fragment>
        <Grid container>
            <Grid size={12}>
                <ChatAppBar/>
            </Grid>
            <Grid size={12}
                  style={{display: "flex"}}
                  justifyContent="space-between"
            >
                <Box sx={{
                    display: {
                        xs: "none",
                        lg: "block"
                    }
                }}>
                    <ChatsOfCurrentUserList/>
                </Box>
                <Grid container>
                    <Grid size={12}>
                        <MessagesListWrapper/>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        <StickerPackDialog/>
        <DeleteStickerPackDialog/>
        <StickerPackDialog/>
    </Fragment>
);

export default NewPrivateChatPage;
