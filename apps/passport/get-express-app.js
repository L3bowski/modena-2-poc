const bodyParser = require('body-parser');
const express = require('express');
const passport = require('passport');
const path = require('path');
const session = require('express-session');
const { deserializeUser, getLocalStrategy, serializeUser } = require('./passport-strategies');

const getExpressApp = () => {
    const app = express();
    app.set('view engine', 'ejs');
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(bodyParser.json());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true
    }));

    const localStrategy = getLocalStrategy();
    passport.serializeUser(serializeUser);
	passport.deserializeUser(deserializeUser);
    passport.use(localStrategy.name, localStrategy.strategy);

    app.use(passport.initialize());
	app.use(passport.session());
    
	app.post(
		'/login',
		(req, res, next) => {
			console.log('Logging in', req.body);
	        const doneCallback = (authenticationError, user, info) => {
	            if (authenticationError) {
	                return res.status(401).json(authenticationError);
	            }

	            req.logIn(user, logInError => {
	                if (logInError) {
	                    return res.send(logInError);
	                }
	                console.log('Authenticated as', req.user && req.user.name)
	                return res.send(JSON.stringify(user));
	            });
	        }

	        passport.authenticate(localStrategy.name, doneCallback)(req, res, next);
	    });
	app.post(
		'/logout',
		(req, res, next) => {
			console.log('Logging out', req.body);
			req.logout();
  			res.send(JSON.stringify({}));
	    });

	app.get(
		'/protected',
		(req, res, next) => {
			console.log('Accessing protected content as', req.user && req.user.name);
			if (!req.user) {
				return res.status(401).json('You are not allowed to access this resource')
			}
			next();
		},
		(req, res, next) => res.send('Protected content'));

    return app;
};

module.exports = getExpressApp;