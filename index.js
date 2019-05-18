const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const {
    exposeHostedApps,
    getAvailableApps,
    getRenderIsolator,
    getRequestResolver,
    setDefaultApp
} = require('modena');

const mainApp = express();

// TODO Create Cypress automation tests
// TODO Add cucumber plugin for Cypress

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
setDefaultApp(apps, 'default-app');

mainApp.use(getRequestResolver(apps));
mainApp.use(getRenderIsolator(appsPath));

exposeHostedApps(mainApp, apps)
    .then(() => {
        mainApp.listen(3000, error => {
            if (error) {
                console.log(error);
            }
            else {
                console.log(`Server up & running in port 3000 (with CONFIG_PARAMETER="${environmentConfig.CONFIG_PARAMETER}")`);
            }
        });
});