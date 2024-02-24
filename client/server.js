import {config} from "dotenv";

config();

import express from "express";
import * as path from "path";

const BUILD_DIRECTORY = "dist";
const staticDirectory = path.join(process.cwd(), BUILD_DIRECTORY);

const expressServer = express();

expressServer.use(express.static(staticDirectory));

expressServer.get("/*", (request, response) => {
    response.sendFile(path.resolve(staticDirectory, "index.html"));
});

expressServer.listen(process.env.PRODUCTION_PORT, () => {
    console.log(`Started express server at ${process.env.PRODUCTION_PORT}`);
});
