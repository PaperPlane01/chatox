const {config} = require("dotenv");

config();
const express = require("express");
const path = require("path");

const BUILD_DIRECTORY = "dist";

const expressServer = express();

expressServer.use(express.static(path.join(__dirname, BUILD_DIRECTORY)));

expressServer.get("/*", (request, response) => {
    response.sendFile(path.resolve(__dirname, `${BUILD_DIRECTORY}/index.html`));
});

expressServer.listen(process.env.PRODUCTION_PORT, () => {
    console.log(`Started express server at ${process.env.PRODUCTION_PORT}`);
});
