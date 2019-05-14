const PassportLocal = require('passport-local').Strategy;

// That's not authentication but it will do for this purpose
const user = {
	id: '8248274820',
    name: 'admin'
};

const deserializeUser = (id, done) => {
	if (id) {
		done(null, user);
	}
	else {
		const error = {
            message: 'Could not deserialize the user'
        };
		done(err, null);
	}
};

const getLocalStrategy = () => {
	const strategy = new PassportLocal({
	    usernameField: 'username',
	    passwordField: 'password'
	}, (username, password, doneCallback) => {
		if (username === 'admin' && password === 'admin') {
			return doneCallback(null, user);
		}
		else {
			const error = {
	            message: 'Incorrect username or password'
	        };
			return doneCallback(error, null);
		}
	});
	return {
		name: 'local',
		strategy
	};
};

const serializeUser = (user, done) => done(null, user.id);

module.exports = {
	deserializeUser,
	getLocalStrategy,
	serializeUser
};