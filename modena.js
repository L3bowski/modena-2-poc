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

module.exports = {
    discoverApps,
    getAppsEnvironmentVariables
};
