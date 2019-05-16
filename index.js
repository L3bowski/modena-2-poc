const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mainApp = express();
const { exposeHostedApps, getAvailableApps, getRenderIsolator, getRequestResolver, loadEnvironmentVariables } = require('./modena');

/*
    Modena should expose the following functions:
        - A function to launch the express app, optionally enabling HTTPS
*/

const defaultConfig = {
    CONFIG_PARAMETER: 'Value placeholder'
};

const importResult = dotenv.config();
if (importResult.error) {
    console.log(`No environment configuration found at ${__dirname}`);
}

// Getting the values from process.env instead of importResult.parsed so that they can easily be injected in Docker
const environmentConfig = {
    CONFIG_PARAMETER: process.env.CONFIG_PARAMETER !== undefined ? process.env.CONFIG_PARAMETER : defaultConfig.CONFIG_PARAMETER
};

const appsPath = path.join(__dirname, 'apps');
const apps = getAvailableApps(appsPath);
const loadedApps = loadEnvironmentVariables(apps);

mainApp.use(getRequestResolver(apps)); // TODO Pass a default app
mainApp.use(getRenderIsolator(appsPath));

exposeHostedApps(mainApp, loadedApps);

mainApp.use(/^\/$/, (req, res, next) => res.send('Main app'));

mainApp.listen(3000, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(`Server up & running in port 3000 (with CONFIG_PARAMETER="${environmentConfig.CONFIG_PARAMETER}")`);
    }
});