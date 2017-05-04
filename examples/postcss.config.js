module.exports = (ctx) => ({
	parser: 'postcss-scss',
	map: ctx.env === 'development' ? ctx.map : false,
	input: 'main.css',
	output: 'public/assets/css/main.css',
	'local-plugins': true,
	plugins: {
		'postcss-import': {},
		'postcss-sassy-mixins': {}
	}
})