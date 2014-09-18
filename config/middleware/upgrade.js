
module.exports = function(app) {

	app.all('*', function(req, res, next) {

		// res.locals.message = req.flash();

		app.locals({
			// helpers: app.helpers,
			message: req.flash()
		});
		
		next();
	});

}
