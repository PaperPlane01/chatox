import React from "react";
import {HomePage, NotFoundPage, ChatPage, ChatsPage, UserPage, SettingsPage} from "../pages";
import {store} from "../store";
import {getSettingsTabFromString} from "../Settings";

const {Route} = require("mobx-router");

export const Routes = {
    home: new Route({
        path: "/",
        component: <HomePage/>
    }),
    notFound: new Route({
        path: "/404",
        component: <NotFoundPage/>
    }),
    myChats: new Route({
        path: "/chats",
        component: <ChatsPage/>
    }),
    chatPage: new Route({
        path: "/chat/:slug",
        component: <ChatPage/>,
        onEnter: (view: any, params: any, _: any, queryParams: any) => {
            store.chat.setSelectedChat(params.slug);
            store.messageCreation.setEmojiPickerExpanded(`${queryParams.emojiPickerExpanded}` === "true");
        },
        onParamsChange: (view: any, params: any, _: any, queryParams: any) => {
            store.chat.setSelectedChat(params.slug);
            store.messageCreation.setEmojiPickerExpanded(`${queryParams.emojiPickerExpanded}` === "true");
        },
        onExit: () => {
            store.chat.setSelectedChat(undefined)
        }
    }),
    userPage: new Route({
        path: "/user/:slug",
        component: <UserPage/>,
        onEnter: (view: any, params: any) => {
            store.userProfile.setSelectedUser(params.slug)
        },
        onParamsChange: (view: any, params: any) => {
            store.userProfile.setSelectedUser(params.slug)
        }
    }),
    settingsPage: new Route({
        path: "/settings",
        component: <SettingsPage/>
    }),
    settingsTabPage: new Route({
        path: "/settings/:tab",
        component: <SettingsPage/>,
        onEnter: (view: any, params: any) => {
            store.settingsTabs.setActiveTab(getSettingsTabFromString(params.tab as string))
        },
        onParamsChange: (view: any, params: any) => {
            store.settingsTabs.setActiveTab(getSettingsTabFromString(params.tab as string))
        },
        onExit: () => {
            store.settingsTabs.setActiveTab(undefined);
        }
    })
};
