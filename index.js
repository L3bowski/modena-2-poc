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

// TODO Create passport-1 and passport-2 apps to show isolated sessions
// TODO A function to launch the express app, optionally enabling HTTPS
// TODO Add winston
// TODO Create tests (automation vs cucumber unit tests)
// TODO Migrate to typescript. Configure to output commonjs and es6
// TODO Add prettier and linter
// TODO Add express-assets-versions?

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
setDefaultApp(apps, 'passport');

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