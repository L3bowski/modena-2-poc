const { existsSync, lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const discoverApps = appsPath => {
    if (!appsPath) {
        console.error('No apps path was provided');
        return [];
    }

    const apps = getDirectoriesName(appsPath)
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
                expressAppFile: join(appPath, modenaAppConfig['expressAppFile'] || 'get-express-app.js')
            };
            return app;
        })
        .filter(app => existsSync(app.expressAppFile));

    return apps;
};

const getAppEnvironmentPrefix = appName => appName.toUpperCase().replace(/-/g,'_') + '__';

const getAppsEnvironmentVariables = apps => {
    const appsEnvironment = apps.map(app => ({
        name: app.name,
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

    const appsEnvironmentVariables = appsEnvironment.reduce((reduced, appEnvironment) => ({
        ...reduced,
        [appEnvironment.name]: appEnvironment.variables
    }), {});
    return appsEnvironmentVariables;
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
    req.__modenaApp = undefined;
    console.log(`Accessing ${req.url}...`);

    // TODO Try to find the accessed app by public domains first. Take into consideration allowCrossAccess

    if (req.query && req.query.$modena) {
        req.__modenaApp = apps.find(app => req.query.$modena === app.name);

        if (req.__modenaApp) {
            const namespacePrefix = '/' + req.__modenaApp.name;
            if (!req.url.startsWith(namespacePrefix)) {
                req.url = namespacePrefix + req.url;
            }
        }
        else {
            console.log('Wrong $modena value provided:', req.query.$modena);
        }
    }

    if (!req.__modenaApp) {
        if (req.url === '/') {
            req.__modenaApp = {name: 'mainApp'};
        }
        else {
            req.__modenaApp = apps.find(app => req.url.startsWith(`/${app.name}`));
        }

        if(!req.__modenaApp) {
            console.log('Unable to resolve the accessed app:', req.url);
        }
    }

    if (req.__modenaApp) {
        console.log(`Resolved access to ${req.__modenaApp.name} (${req.url})`);
    }

    next();
};

module.exports = {
    discoverApps,
    getAppsEnvironmentVariables,
    getRenderIsolator,
    getRequestResolver
};
