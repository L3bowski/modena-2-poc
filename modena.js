const { existsSync, lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const exposeHostedApps = (mainApp, hostedApps) => {
    return Promise.all(hostedApps.map(hostedApp => {
        try {
            const getExpressHostedApp = require(hostedApp.expressAppFile);
            const expressHostedApp = getExpressHostedApp(hostedApp.variables);
            if (!(expressHostedApp instanceof Promise)) {
                mainApp.use(`/${hostedApp.name}`, expressHostedApp);
                console.log(`Successfully exposed ${hostedApp.name}`);
                return Promise.resolve(1);
            }
            else {
                return expressHostedApp
                    .then(deferredExpressHostedApp => {
                        mainApp.use(`/${hostedApp.name}`, deferredExpressHostedApp);
                        console.log(`Successfully exposed ${hostedApp.name}`);
                        return 1;
                    })
                    .catch(error => {
                        console.log(`Error exposing ${hostedApp.name} app`, error);
                        return 0;
                    });
            }
        }
        catch (error) {
            console.log(`Error exposing ${hostedApp.name} app`, error);
            return Promise.resolve(0);
        }
    }))
    .then(results => {
        const exposedAppsNumber = results.reduce((reduced, result) => reduced + result, 0);
        console.log(`Exposed ${exposedAppsNumber} apps in total!`);
    });
};

const getAppEnvironmentPrefix = appName => appName.toUpperCase().replace(/-/g,'_') + '__';

const getAvailableApps = (appsPath, doLoadEnvironmentVariables = true) => {
    if (!appsPath) {
        console.error('No apps path was provided');
        return [];
    }

    let apps = getDirectoriesName(appsPath)
        .map(appName => {
            const appPath = join(appsPath, appName);

            let modenaAppConfig = {};
            const modenaAppConfigPath = join(appPath, 'modena.json');
            if (existsSync(modenaAppConfigPath)) {
                modenaAppConfig = require(modenaAppConfigPath);
            }

            const app = {
                name: appName,
                path: appPath,
                expressAppFile: join(appPath, modenaAppConfig['expressAppFile'] || 'get-express-app.js'),
                isDefaultApp: false
            };
            return app;
        })
        .filter(app => existsSync(app.expressAppFile));

    if (doLoadEnvironmentVariables) {
        apps = loadEnvironmentVariables(apps);
    }

    return apps;
};

const getDirectoriesName = path =>
    readdirSync(path).filter(name => lstatSync(join(path, name)).isDirectory());

const getRenderIsolator = appsPath => (req, res, next) => {
    if (req.__modenaApp) {
        const renderFunction = res.render.bind(res);
        res.render = (viewName, options) => {
            const viewPath = join(appsPath, req.__modenaApp.name, 'views', viewName);
            renderFunction(viewPath, options);
        }
    }
    next();
};

const getRequestResolver = apps => (req, res, next) => {
    console.log(`Accessing ${req.url}...`);
    req.__modenaApp = undefined;

    // TODO Try to find the accessed app by public domains first. Take into consideration allowCrossAccess

    if (req.query && req.query.$modena) {
        req.__modenaApp = apps.find(app => req.query.$modena === app.name);

        if (!req.__modenaApp) {
            console.log('Wrong $modena value provided:', req.query.$modena);
        }
    }

    if (!req.__modenaApp) {
        req.__modenaApp = apps.find(app => req.url.startsWith(`/${app.name}`));

        if(!req.__modenaApp) {
            console.log('Unable to match the accessed url to any app:', req.url);
        }
    }

    if (!req.__modenaApp) {
        req.__modenaApp = apps.find(app => app.isDefaultApp);
    }

    if (req.__modenaApp) {
        const namespacePrefix = '/' + req.__modenaApp.name;
        if (!req.url.startsWith(namespacePrefix)) {
            req.url = namespacePrefix + req.url;
        }
        console.log(`Resolved access to ${req.__modenaApp.name} (${req.url})`);
    }

    next();
};

const loadEnvironmentVariables = apps => {
    const appsEnvironment = apps.map(app => ({
        config: app,
        prefix: getAppEnvironmentPrefix(app.name),
        variables: {}
    }));
    
    Object.keys(process.env).forEach(envKey => {
        appsEnvironment.forEach(appEnvironment => {
            if (envKey.startsWith(appEnvironment.prefix)) {
                appEnvironment.variables[envKey.replace(appEnvironment.prefix, '')] = process.env[envKey];
                delete process.env[envKey];
            }
        });
    });

    const appsEnvironmentVariables = appsEnvironment.map(app => ({
        ...app.config,
        variables: app.variables
    }));
    return appsEnvironmentVariables;
};

const setDefaultApp = (apps, defaultAppName) => {
    const isThereSomeDefaultApp = apps.reduce((reduced, app) => {
        app.isDefaultApp = app.name === defaultAppName;
        return reduced || app.isDefaultApp;
    }, false);

    if(!isThereSomeDefaultApp) {
        console.log(`Error setting the default app: there is no app named ${defaultAppName}`);
    }
};

module.exports = {
    exposeHostedApps,
    getAvailableApps,
    getRenderIsolator,
    getRequestResolver,
    loadEnvironmentVariables,
    setDefaultApp
};
