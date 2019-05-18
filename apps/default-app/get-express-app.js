const express = require('express');

const getExpressApp = () => {
    const app = express();
    app.use(/^\/$/, (req, res, next) => res.send('This is the app that will run on the modena server by default'));
    return app;
};

module.exports = getExpressApp;