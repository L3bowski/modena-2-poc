const express = require('express');

const defaultConfig = {
    DB_HOST: 'database host placeholder',
    DB_USER: 'database user placeholder',
    DB_PASS: 'database password placeholder'
};

const getExpressApp = (environmentConfig = {}) => {
    const config = {
        DB_HOST: environmentConfig.DB_HOST !== undefined ? environmentConfig.DB_HOST : defaultConfig.DB_HOST,
        DB_USER: environmentConfig.DB_USER !== undefined ? environmentConfig.DB_USER : defaultConfig.DB_USER,
        DB_PASS: environmentConfig.DB_PASS !== undefined ? environmentConfig.DB_PASS : defaultConfig.DB_PASS
    };

    const app = express();
    app.use(/^\/$/, (req, res, next) => res.send(JSON.stringify(config)));
    return app;
};

module.exports = getExpressApp;