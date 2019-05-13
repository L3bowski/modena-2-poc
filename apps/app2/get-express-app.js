const express = require('express');
const session = require('express-session');

const getExpressApp = () => {
    const app = express();
    app.set('view engine', 'ejs');
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }));
    app.use(/^\/$/, (req, res, next) => res.send(typeof req.session));
    app.use(/^\/view$/, (req, res, next) => res.render('index'));
    return app;
};

module.exports = getExpressApp;