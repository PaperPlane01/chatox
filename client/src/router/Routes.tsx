import React from "react";
import {HomePage, NotFoundPage, ChatPage, ChatsPage, UserPage} from "../pages";
import {store} from "../store";

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
        onEnter: (view: any, params: any) => {
            store.chat.setSelectedChat(params.slug)
        },
        onParamsChange: (view: any, params: any) => {
            store.chat.setSelectedChat(params.slug);
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
    })
};
