const express = require('express');

const getExpressApp = () => {
    const app = express();
    app.use(/^\/$/, (req, res, next) => res.send('Public domain cross access app accessible at test-cross-domain.com:3000'));
    return app;
};

module.exports = getExpressApp;