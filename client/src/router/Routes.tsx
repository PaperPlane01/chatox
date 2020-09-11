import React, {lazy, Suspense} from "react";
import {CircularProgress} from "@material-ui/core";
import {store} from "../store";
import {getSettingsTabFromString} from "../Settings";

const fallback = (
    <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%"
    }}>
        <CircularProgress size={50} color="primary"/>
    </div>
)

const HomePage = lazy(() => import("../pages/HomePage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const ChatsPage = lazy(() => import("../pages/ChatsPage"));
const ChatPage = lazy(() => import("../pages/ChatPage"));
const UserPage = lazy(() => import("../pages/UserPage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));

const {Route} = require("mobx-router");

export const Routes = {
    home: new Route({
        path: "/",
        component: (
            <Suspense fallback={fallback}>
                <HomePage/>
            </Suspense>
        )
    }),
    notFound: new Route({
        path: "/404",
        component: (
            <Suspense fallback={fallback}>
                <NotFoundPage/>
            </Suspense>
        )
    }),
    myChats: new Route({
        path: "/chats",
        component: (
            <Suspense fallback={fallback}>
                <ChatsPage/>
            </Suspense>
        )
    }),
    chatPage: new Route({
        path: "/chat/:slug",
        component: (
          <Suspense fallback={fallback}>
              <ChatPage/>
          </Suspense>
        ),
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
        component: (
            <Suspense fallback={fallback}>
                <UserPage/>
            </Suspense>
        ),
        onEnter: (view: any, params: any) => {
            store.userProfile.setSelectedUser(params.slug)
        },
        onParamsChange: (view: any, params: any) => {
            store.userProfile.setSelectedUser(params.slug)
        }
    }),
    settingsPage: new Route({
        path: "/settings",
        component: (
            <Suspense fallback={fallback}>
                <SettingsPage/>
            </Suspense>
        )
    }),
    settingsTabPage: new Route({
        path: "/settings/:tab",
        component: (
            <Suspense fallback={fallback}>
                <SettingsPage/>
            </Suspense>
        ),
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
