import {_SocketIoWorker} from "./internal";

export type {ISocketIoWorker} from "./internal";

const SocketIoWorker = _SocketIoWorker;

// Hack for Webpack.
// Classes exported by this module are never imported by Webpack loader anywhere (we use custom loader),
// so technically they are never used, which triggers Webpack tree shaking.
// @ts-ignore
__webpack_exports__ = { SocketIoWorker };
