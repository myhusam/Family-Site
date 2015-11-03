var crypto = require('crypto');
var keystone = require('keystone');
var scmp = require('scmp');
var utils = require('keystone-utils');

/**
 * Creates a hash of str with Keystone's cookie secret.
 * Only hashes the first half of the string.
 */
function hash(str) {
	// force type
	str = '' + str;
	// get the first half
	str = str.substr(0, Math.round(str.length / 2));
	// hash using sha256
	return crypto
		.createHmac('sha256', keystone.get('cookie secret'))
		.update(str)
		.digest('base64')
		.replace(/\=+$/, '');
}

/**
 * Signs in a user using user obejct
 *
 * @param {Object} user - user object
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {function()} onSuccess callback, is passed the User instance
 */

function signinWithUser(user, req, res, onSuccess) {
	if (arguments.length < 4) {
		throw new Error('keystone.session.signinWithUser requires user, req and res objects, and an onSuccess callback.');
	}
	if ('object' !== typeof user) {
		throw new Error('keystone.session.signinWithUser requires user to be an object.');
	}
	if ('object' !== typeof req) {
		throw new Error('keystone.session.signinWithUser requires req to be an object.');
	}
	if ('object' !== typeof res) {
		throw new Error('keystone.session.signinWithUser requires res to be an object.');
	}
	if ('function' !== typeof onSuccess) {
		throw new Error('keystone.session.signinWithUser requires onSuccess to be a function.');
	}
	req.session.regenerate(function() {
		req.user = user;
		req.session.userId = user.id;
		// if the user has a password set, store a persistence cookie to resume sessions
		if (keystone.get('cookie signin') && user.password) {
			var userToken = user.id + ':' + hash(user.password);
			res.cookie('keystone.uid', userToken, { signed: true, httpOnly: true });
		}
		onSuccess(user);
	});
}

exports.signinWithUser = signinWithUser;

var postHookedSigninWithUser = function(user, req, res, onSuccess, onFail) {
	keystone.callHook(user, 'post:signin', function(err) {
		if (err) {
			return onFail(err);
		}
		exports.signinWithUser(user, req, res, onSuccess, onFail);
	});
};

/**
 * Signs in a user user matching the lookup filters
 *
 * @param {Object} lookup - must contain email and password
 * @param {Object} req - express request object
 * @param {Object} res - express response object
 * @param {function()} onSuccess callback, is passed the User instance
 * @param {function()} onFail callback
 */

var doSignin = function(lookup, req, res, onSuccess, onFail) {
	if (!lookup) {
		return onFail(new Error('session.signin requires a User ID or Object as the first argument'));
	}
	var User = keystone.list(keystone.get('user model'));
	if ('string' === typeof lookup.phone && 'string' === typeof lookup.password) {
		// create regex for email lookup with special characters escaped
		var phoneRegExp = new RegExp('^' + utils.escapeRegExp(lookup.phone));
		// match email address and password
		User.model.findOne({ phone: phoneRegExp }).exec(function(err, user) {
			if (user) {
				user._.password.compare(lookup.password, function(err, isMatch) {
					if (!err && isMatch) {
						postHookedSigninWithUser(user, req, res, onSuccess, onFail);
					} else {
						onFail(err);
					}
				});
			} else {
				onFail(err);
			}
		});
	} else {
		lookup = '' + lookup;
		// match the userId, with optional password check
		var userId = (lookup.indexOf(':') > 0) ? lookup.substr(0, lookup.indexOf(':')) : lookup;
		var passwordCheck = (lookup.indexOf(':') > 0) ? lookup.substr(lookup.indexOf(':') + 1) : false;
		User.model.findById(userId).exec(function(err, user) {
			if (user && (!passwordCheck || scmp(passwordCheck, hash(user.password)))) {
				postHookedSigninWithUser(user, req, res, onSuccess, onFail);
			} else {
				onFail(err);
			}
		});
	}
};

exports.signin = function(lookup, req, res, onSuccess, onFail) {
	keystone.callHook({}, 'pre:signin', function(err) {
		if (err) {
			return onFail(err);
		}
		doSignin(lookup, req, res, onSuccess, onFail);
	});
};
