import React, {lazy, Suspense} from "react";
import {CircularProgress} from "@material-ui/core";
import {store} from "../store";
import {getSettingsTabFromString} from "../Settings";
import {ErrorBoundary} from "../ErrorBoundary";

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
const GlobalBansPage = lazy(() => import("../pages/GlobalBansPage"));
const ScheduledMessagesPage = lazy(() => import("../pages/ScheduledMessagesPage"));

const {Route} = require("mobx-router");

export const Routes = {
    home: new Route({
        path: "/",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <HomePage/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: () => {
            store.popularChats.fetchPopularChats();
        },
        onExit: () => {
            store.popularChats.reset();
        }
    }),
    notFound: new Route({
        path: "/404",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <NotFoundPage/>
                </Suspense>
            </ErrorBoundary>
        )
    }),
    myChats: new Route({
        path: "/chats",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <ChatsPage/>
                </Suspense>
            </ErrorBoundary>
        )
    }),
    chatPage: new Route({
        path: "/chat/:slug",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <ChatPage/>
                </Suspense>
            </ErrorBoundary>
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
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <UserPage/>
                </Suspense>
            </ErrorBoundary>
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
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <SettingsPage/>
                </Suspense>
            </ErrorBoundary>
        )
    }),
    settingsTabPage: new Route({
        path: "/settings/:tab",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <SettingsPage/>
                </Suspense>
            </ErrorBoundary>
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
    }),
    globalBans: new Route({
        path: "/bans",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <GlobalBansPage/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: () => {
            store.globalBansList.fetchGlobalBans();
        },
        onExit: () => {
            store.globalBansList.reset();
        }
    }),
    scheduledMessagesPage: new Route({
        path: "/chat/:slug/scheduled-messages",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <ScheduledMessagesPage/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: (view: any, params: any) => {
            store.chat.setSelectedChat(params.slug);
        },
        onParamsChange: (view: any, params: any) => {
            store.chat.setSelectedChat(params.slug);
        },
        onExit: () => {
            store.chat.setSelectedChat(undefined)
        }
    })
};
