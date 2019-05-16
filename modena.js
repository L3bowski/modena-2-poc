const { existsSync, lstatSync, readdirSync } = require('fs');
const { join } = require('path');

const getDirectoriesName = path =>
    readdirSync(path).filter(name => lstatSync(join(path, name)).isDirectory());

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

module.exports = {
    discoverApps
};
