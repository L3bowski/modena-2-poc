const express = require('express');

const getExpressApp = () => {
    const app = express();
    app.set('view engine', 'ejs');
    app.use(/^\/$/, (req, res, next) => res.send(typeof req.session));
    app.use(/^\/view$/, (req, res, next) => res.render('index', { serverValue: Math.random() * 100 }));
    return app;
};

module.exports = getExpressApp;