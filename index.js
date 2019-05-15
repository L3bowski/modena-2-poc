const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mainApp = express();
const getExpressApp1 = require('./apps/app1/get-express-app');
const getExpressApp2 = require('./apps/app2/get-express-app');
const getConfigApp = require('./apps/config-app/get-express-app');
const getPassportApp = require('./apps/passport/get-express-app');

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

const formatAppName = appName => appName.toUpperCase().replace(/-/g,'_') + '__';

const appsEnvironmentVariables = {
    [formatAppName('app1')]: {},
    [formatAppName('app2')]: {},
    [formatAppName('config-app')]: {},
    [formatAppName('passport')]: {}
};

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
        if (req.query.$modena === 'app1') {
            accessedApp = 'app1';
        }
        else if (req.query.$modena === 'app2') {
            accessedApp = 'app2';
        }
        else if (req.query.$modena === 'config-app') {
            accessedApp = 'config-app';
        }
        else if (req.query.$modena === 'passport') {
            accessedApp = 'passport';
        }
        else {
            console.log('Wrong $modena value provided:', req.query.$modena);
        }

        if (accessedApp) {
            const namespacePrefix = '/' + accessedApp;
            if (!req.url.startsWith(namespacePrefix)) {
                req.url = namespacePrefix + req.url;
            }
        }
    }

    if (!accessedApp) {
        if (req.url === '/') {
            accessedApp = 'mainApp';
        }
        else if (req.url.startsWith('/app1')) {
            accessedApp = 'app1';
        }
        else if (req.url.startsWith('/app2')) {
            accessedApp = 'app2';
        }
        else if (req.url.startsWith('/config-app')) {
            accessedApp = 'config-app';
        }
        else if (req.url.startsWith('/passport')) {
            accessedApp = 'passport';
        }
        else {
            console.log('Unable to resolve the accessed app:', req.url);
        }
    }

    if (accessedApp) {
        console.log(`Resolved access to ${accessedApp} (${req.url})`);
    }

    next();
};
mainApp.use(resolverFunction);

const appsPath = path.join(__dirname, 'apps');
const renderIsolator = (req, res, next) => {
    const renderFunction = res.render.bind(res);
    res.render = (viewName, options) => {
        const viewPath = path.resolve(appsPath, accessedApp, 'views', viewName);
        renderFunction(viewPath, options);
    }
    next();
};
mainApp.use(renderIsolator);

mainApp.use(/^\/$/, (req, res, next) => res.send('Main app'));

// TODO Support Promises return value
mainApp.use('/app1', getExpressApp1(getAppEnvironmentVariables('app1')));
mainApp.use('/app2', getExpressApp2(getAppEnvironmentVariables('app2')));
mainApp.use('/config-app', getConfigApp(getAppEnvironmentVariables('config-app')));
mainApp.use('/passport', getPassportApp(getAppEnvironmentVariables('passport')));

mainApp.listen(3000, error => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(`Server up & running in port 3000 (with CONFIG_PARAMETER="${environmentConfig.CONFIG_PARAMETER}")`);
    }
});