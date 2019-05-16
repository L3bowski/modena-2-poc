const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mainApp = express();
const { discoverApps, getAppsEnvironmentVariables, getRenderIsolator, getRequestResolver } = require('./modena');

/*
    Modena should expose the following functions:
        1) Get all the existing express apps in the target folder ('./apps' by default)
        2) Given a set of apps, a resolver to determine which app is being accessed
        3) A function to set a default app (which will modify the resolveFunction value)
        4) A function to enable HTTPS (given the corresponding parameters)
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
const apps = discoverApps(appsPath);
const appsEnvironmentVariables = getAppsEnvironmentVariables(apps);

mainApp.use(getRequestResolver(apps));
mainApp.use(getRenderIsolator(appsPath));

mainApp.use(/^\/$/, (req, res, next) => res.send('Main app'));

apps.forEach(app => {
    const getExpressApp = require(app.expressAppFile);
    // TODO Support Promises return value
    const expressApp = getExpressApp(appsEnvironmentVariables[app.name]);
    mainApp.use(`/${app.name}`, expressApp);    
});

mainApp.listen(3000, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(`Server up & running in port 3000 (with CONFIG_PARAMETER="${environmentConfig.CONFIG_PARAMETER}")`);
    }
});