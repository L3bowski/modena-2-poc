const express = require('express');
const {
    exposeHostedApps,
    getAvailableApps,
    getRenderIsolator,
    getRequestResolver,
    httpsRedirectMiddleware,
    launchServer,
    setDefaultApp
} = require('modena');
const configuration = require('./configuration');

console.log('Server configuration');
console.log(configuration);

const mainApp = express();

// TODO Test passport flow with Cypress
// TODO Test session is available in app2 but not in app1
// TODO Test HTTPs server
// TODO Add cucumber plugin for Cypress

const apps = getAvailableApps(configuration.APPS_PATH);
setDefaultApp(apps, configuration.DEFAULT_APP);

if (configuration.HTTPS_ENABLE && configuration.HTTPS_REDIRECTION) {
    mainApp.use(httpsRedirectMiddleware);
}

mainApp.use(getRequestResolver(apps));
mainApp.use(getRenderIsolator(configuration.APPS_PATH));

const serverConfig = {
    port: configuration.PORT,
    httpsConfiguration: {
        certPath: configuration.HTTPS_CER,
        disableHttp: configuration.HTTPS_DISABLE_HTTP,
        enableHttps: configuration.HTTPS_ENABLE,
        keyPath: configuration.HTTPS_KEY,
        passphrase: configuration.HTTPS_PASSPHRASE
    }
};

exposeHostedApps(mainApp, apps)
    .then(_ => launchServer(mainApp, serverConfig))
    .catch(error => console.log(error));