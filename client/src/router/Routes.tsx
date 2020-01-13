import React from "react";
import {HomePage, NotFoundPage} from "../pages";

const {Route} = require("mobx-router");

export const Routes = {
    home: new Route({
        path: "/",
        component: <HomePage/>
    }),
    notFound: new Route({
        path: "/404",
        component: <NotFoundPage/>
    })
};
