var keystone = require('keystone');

/**
 * UserCategory Model
 * ==================
 */

var UserCategory = new keystone.List('UserCategory', {
	autokey: { from: 'name', path: 'key', unique: true }
});

UserCategory.add({
	name: { type: String, required: true }
});

UserCategory.relationship({ ref: 'User', path: 'categories' });

UserCategory.register();
