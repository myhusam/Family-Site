var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */

var User = new keystone.List('User', {
	track: true,
	autokey: { path: 'key', from: 'phone', unique: true }
});

User.add({
	name: { type: Types.Name},
	email: { type: Types.Email},
	phone: { type: String, initial: true, required: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	categories: { type: Types.Relationship, ref: 'UserCategory'},
	photo: { type: Types.CloudinaryImage },
	city: { type: Types.Select, options: [
		{ value: 'الدمام', label: 'الدمام' },
		{ value: 'الرياض', label: 'الرياض' },
		{ value: 'مكة', label: 'مكة' },
		{ value: 'المدينة المنورة', label: 'المدينة المنورة' },
		{ value: 'الطائف', label: 'الطائف' },
		{ value: 'حفر الباطن', label: 'حفر الباطن' },
		{ value: 'عرعر', label: 'عرعر' },
		{ value: '	الرس', label: '	الرس' },
		{ value: 'الدوادمي', label: 'مكة' },
		{ value: 'عفيف', label: 'عفيف' },
		{ value: 'الرياض', label: 'الرياض' }
	] },
	status: { type: Types.Select, options: [
		{ value: 'متزوج', label: 'متزوج' },
		{ value: 'اعزب', label: 'اعزب' }
	] }
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function() {
	return this.isAdmin;
});


/**
 * Relationships
 */

User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });

// Link to member
User.schema.virtual('url').get(function() {
	return '/member/' + this.key;
});


/**
 * Registration
 */

User.defaultColumns = 'name, email, isAdmin';
User.register();
