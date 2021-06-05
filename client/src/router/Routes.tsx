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
const MessageReportsPage = lazy(() => import("../pages/MessageReportsPage"));
const UserReportsPage = lazy(() => import("../pages/UserReportsPage"));
const ChatReportsPage = lazy(() => import("../pages/ChatReportsPage"));
const GoogleAuthentication = lazy(() => import("../pages/GoogleAuthenticationPage"));
const CreateStickerPackPage = lazy(() => import("../pages/CreateStickerPackPage"));

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
            store.scheduledMessagesOfChat.setReactToChatIdChange(true);
            store.chat.setSelectedChat(params.slug);
            store.scheduledMessagesOfChat.fetchScheduledMessages();
        },
        onParamsChange: (view: any, params: any) => {
            store.chat.setSelectedChat(params.slug);
            store.scheduledMessagesOfChat.setReactToChatIdChange(true);
            store.scheduledMessagesOfChat.fetchScheduledMessages();
        },
        onExit: () => {
            store.scheduledMessagesOfChat.setReactToChatIdChange(false);
            store.chat.setSelectedChat(undefined);
        }
    }),
    reportedMessages: new Route({
        path: "/reports/messages",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <MessageReportsPage/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: () => {
            store.currentReportsList.setCurrentReportsList(store.messageReports);
            store.messageReports.fetchReports();
        },
        onExit: () => {
            store.messageReports.reset();
        }
    }),
    reportedUsers: new Route({
        path: "/reports/users",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <UserReportsPage/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: () => {
            store.currentReportsList.setCurrentReportsList(store.userReports);
            store.userReports.fetchReports();
        },
        onExit: () => {
            store.userReports.reset();
        }
    }),
    reportedChats: new Route({
        path: "/reports/chats",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <ChatReportsPage/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: () => {
            store.currentReportsList.setCurrentReportsList(store.chatReports);
            store.chatReports.fetchReports();
        },
        onExit: () => {
            store.chatReports.reset();
        }
    }),
    googleAuthentication: new Route({
        path: "/oauth/google",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <GoogleAuthentication/>
                </Suspense>
            </ErrorBoundary>
        ),
        onEnter: (route: any, params: any, queryParams: any) => {
            store.googleLogin.setGoogleAccessToken(queryParams.access_token);
            store.googleLogin.loginWithGoogle();
        }
    }),
    createStickerPack: new Route({
        path: "/create-sticker-pack",
        component: (
            <ErrorBoundary>
                <Suspense fallback={fallback}>
                    <CreateStickerPackPage/>
                </Suspense>
            </ErrorBoundary>
        )
    })
};

export const getRouteByPath = (path: string) => {
    let resultRoute = undefined;

    Object.keys(Routes).forEach(route => {
        if (Routes[route as keyof typeof Routes].path === path) {
            resultRoute = Routes[route as keyof typeof Routes];
        }
    });

    return resultRoute;
};
