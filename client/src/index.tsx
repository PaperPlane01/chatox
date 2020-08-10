import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "mobx-react";
import {App} from "./App";
import {store, routerStore} from "./store";
import {Routes} from "./router";
import * as serviceWorker from "./serviceWorker";

const {startRouter} = require("mobx-router");

startRouter(Routes, routerStore, {
    notfound: () => {
        routerStore.router.goTo(Routes.notFound);
    }
});

ReactDOM.render(
    <Provider store={routerStore} {...store}>
        <App/>
    </Provider>,
    document.getElementById("root")
);

if (localStorage.getItem("accessToken")) {
    store.authorization.fetchCurrentUser()
        .then(() => store.chatsOfCurrentUser.fetchChatsOfCurrentUser())
        .then(() => store.websocket.startListening());
} else {
    store.websocket.startListening();
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
