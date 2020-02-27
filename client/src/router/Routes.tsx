import React from "react";
import {HomePage, NotFoundPage, ChatPage} from "../pages";

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
    chatPage: new Route({
        path: "/chat/:slug",
        component: <ChatPage/>
    })
};
