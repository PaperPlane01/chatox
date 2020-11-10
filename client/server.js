const {config} = require("dotenv");

config();
const express = require("express");
const path = require("path");

const BUILD_DIRECTORY = "build";

const expressServer = express();

expressServer.use(express.static(path.join(__dirname, BUILD_DIRECTORY)));

expressServer.get("/*", (request, response) => {
    response.sendFile(path.resolve(__dirname, `${BUILD_DIRECTORY}/index.html`));
})

expressServer.listen(process.env.REACT_APP_PRODUCTION_PORT, () => {
    console.log(`Started express server at ${process.env.REACT_APP_PRODUCTION_PORT}`);
});
