const express = require('express');
const { exposeHostedApps, httpsRedirectMiddleware, launchServer } = require('modena');

const configuration = require('./configuration');
console.log('Server configuration');
console.log(configuration);

const mainApp = express();

if (configuration.HTTPS_ENABLE && configuration.HTTPS_REDIRECTION) {
    mainApp.use(httpsRedirectMiddleware);
}

exposeHostedApps(mainApp, {
	appsPath: configuration.APPS_PATH,
	defaultApp: configuration.DEFAULT_APP
})
    .then(_ => {
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
        launchServer(mainApp, serverConfig)
    })
    .catch(console.log);

// TODO Test passport flow with Cypress
// TODO Test session is available in app2 but not in app1
// TODO Test HTTPs server
// TODO Add cucumber plugin for Cypress