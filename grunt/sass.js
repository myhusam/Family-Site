module.exports = {
	options: {
    includePaths: ['bower_components/foundation/scss']
	},
	dist: {
    options: {
      style: 'expanded'
    },
    files: {
      'public/styles/site.css': 'public/styles/app.scss',
    }
  }
};
