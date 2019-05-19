const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const {
    exposeHostedApps,
    getAvailableApps,
    getRenderIsolator,
    getRequestResolver,
    launchServer,
    setDefaultApp
} = require('modena');

const mainApp = express();

// TODO Test passport flow with Cypress
// TODO Test session is available in app2 but not in app1
// TODO Add cucumber plugin for Cypress

const defaultConfig = {
    PORT: 3000
};

const importResult = dotenv.config();
if (importResult.error) {
    console.log(`No environment configuration found at ${__dirname}`);
}

// Getting the values from process.env instead of importResult.parsed so that
// they can directly be injected in Docker through process.env
const environmentConfig = {
    PORT: process.env.PORT !== undefined ? process.env.PORT : defaultConfig.PORT
};

const appsPath = path.join(__dirname, 'apps');
const apps = getAvailableApps(appsPath);
setDefaultApp(apps, 'default-app');

mainApp.use(getRequestResolver(apps));
mainApp.use(getRenderIsolator(appsPath));

exposeHostedApps(mainApp, apps)
    .then(_ => launchServer(mainApp, { port: environmentConfig.PORT }))
    .then(_ => {
        console.log(`Server up & running in port ${environmentConfig.PORT}`);
    })
    .catch(error => console.log(error));