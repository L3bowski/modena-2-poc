const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mainApp = express();
const { discoverApps } = require('./modena');

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

const formatAppName = appName => appName.toUpperCase().replace(/-/g,'_') + '__';

const appsEnvironmentVariables = apps.reduce((reduced, app) => ({
    ...reduced,
    [formatAppName(app.name)]: {}
}), {});

Object.keys(process.env).forEach(envKey => {
    Object.keys(appsEnvironmentVariables).forEach(appKey => {
        if (envKey.startsWith(appKey)) {
            appsEnvironmentVariables[appKey][envKey.replace(appKey, '')] = process.env[envKey];
            delete process.env[envKey];
        }
    });
});

const getAppEnvironmentVariables = appName => appsEnvironmentVariables[formatAppName(appName)];

let accessedApp;
const resolverFunction = (req, res, next) => {
    accessedApp = undefined;
    console.log(`Accessing ${req.url}...`);

    // TODO Try to find the accessed app by public domains first. Take into consideration allowCrossAccess

    if (req.query && req.query.$modena) {
        accessedApp = apps.find(app => req.query.$modena === app.name);

        if (accessedApp) {
            const namespacePrefix = '/' + accessedApp.name;
            if (!req.url.startsWith(namespacePrefix)) {
                req.url = namespacePrefix + req.url;
            }
        }
        else {
            console.log('Wrong $modena value provided:', req.query.$modena);
        }
    }

    if (!accessedApp) {
        if (req.url === '/') {
            accessedApp = {name: 'mainApp'};
        }
        else {
            accessedApp = apps.find(app => req.url.startsWith(`/${app.name}`));
        }

        if(!accessedApp) {
            console.log('Unable to resolve the accessed app:', req.url);
        }
    }

    if (accessedApp) {
        console.log(`Resolved access to ${accessedApp.name} (${req.url})`);
    }

    next();
};
mainApp.use(resolverFunction);

const renderIsolator = (req, res, next) => {
    const renderFunction = res.render.bind(res);
    res.render = (viewName, options) => {
        const viewPath = path.resolve(appsPath, accessedApp.name, 'views', viewName);
        renderFunction(viewPath, options);
    }
    next();
};
mainApp.use(renderIsolator);

mainApp.use(/^\/$/, (req, res, next) => res.send('Main app'));

apps.forEach(app => {
    const getExpressApp = require(app.expressAppFile);
    // TODO Support Promises return value
    const expressApp = getExpressApp(getAppEnvironmentVariables(app.name));
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