const { Boom } = require("@hapi/boom");
const xml = require("jsontoxml");
const { format } = require("util");
const { has } = require("lodash");

function dispatch(err, req, res) {
	res.status(err.output.statusCode);
	if (req.accepts("json"))
		res
			.set("Content-Type", "application/json")
			.send(`${JSON.stringify(err.output.payload)}\n`);
	else if (req.accepts(["application/xml", "text/xml"]))
		res.set("Content-Type", "text/xml").send(`${xml(err.output.payload)}\n`);
	else
		res.send(
			format(
				"%s %s\n%s\n",
				err.output.payload.statusCode,
				err.output.payload.message,
				err.output.payload.stack || "",
			),
		);
}

function wrapError(error) {
	return new Boom(error);
}

function errorMiddleware({ logger, config }) {
	return (error, req, res, next) => {
		const err = wrapError(error);
		if (config.showErrorDetail) {
			err.output.payload.message = err.message;
			err.output.payload.stack = err.stack;
		}
		has(res, "locals.logger") ? res.locals.logger.error(err) : logger.error(err);
		dispatch(err, req, res);
	};
}

module.exports = {
	errorMiddleware,
};
