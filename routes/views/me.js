var keystone = require('keystone'),
	_ = require('underscore'),
	moment = require('moment');

var User = keystone.list('User');

exports = module.exports = function(req, res) {

	var view = new keystone.View(req, res),
		locals = res.locals;

	locals.section = 'me';
	locals.city = User.fields.city.ops;
	locals.status = User.fields.status.ops;
	locals.formData = req.body || {};



	view.on('post', { action: 'profile.details' }, function(next) {

		req.user.getUpdateHandler(req).process(req.body, {
			fields: 'name, email,' +
			'city, status, photo',
			flashErrors: true
		}, function(err) {

			if (err) {
				return next();
			}

			req.flash('success', 'Your changes have been saved.');
			return next();

		});

	});



	view.on('post', { action: 'profile.password' }, function(next) {

		if (!req.body.password || !req.body.password_confirm) {
			req.flash('error', 'Please enter a password.');
			return next();
		}

		req.user.getUpdateHandler(req).process(req.body, {
			fields: 'password',
			flashErrors: true
		}, function(err) {

			if (err) {
				return next();
			}

			req.flash('success', 'Your changes have been saved.');
			return next();

		});

	});

	view.render('me');

}
