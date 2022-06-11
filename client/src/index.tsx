import React from "react";
import {createRoot} from "react-dom/client";
import {Provider} from "mobx-react";
import {parse} from "query-string";
import {App} from "./App";
import {store, routerStore} from "./store";
import {Routes} from "./router";
import * as serviceWorker from "./serviceWorker";

const {startRouter} = require("mobx-router");

const injectRouterStore = (): void => {
    store.messageCreation.setRouterStore(routerStore);
};

injectRouterStore();

startRouter(Routes, routerStore, {
    notfound: () => {
        if (window.location.href.includes(`${process.env.REACT_APP_PUBLIC_URL}/oauth/google/`)) {
            const queryStringParameters = parse(window.location.href.substring(`${process.env.REACT_APP_PUBLIC_URL}/oauth/google/`.length));
            console.log(queryStringParameters);
            routerStore.router.goTo(Routes.googleAuthentication, {}, {access_token: queryStringParameters.access_token});
        } else {
            routerStore.router.goTo(Routes.notFound);
        }
    }
});

const root = createRoot(document.getElementById("root")!);
root.render(
    <Provider store={routerStore} {...store}>
        <App/>
    </Provider>,
);

if (localStorage.getItem("accessToken")) {
    store.authorization.fetchCurrentUser()
        .then(() => {
            store.chatsOfCurrentUser.fetchChatsOfCurrentUser();
            store.blacklistedUsers.fetchBlacklistedUsers();
        });
} else {
    store.websocket.startListening();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
