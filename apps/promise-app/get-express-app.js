const express = require('express');

const getExpressApp = () => {
    const app = express();
    return Promise.resolve({})
        .then(_ => {
            // Simulating an asynchronous action performance (e.g. sync the database)
            // before configuring the express app
            app.use(/^\/$/, (req, res, next) => res.send('This app delays the express configuration until the database has been synced'));
            return app;
        });
};

module.exports = getExpressApp;