const async = require('async')
const { get, has } = require('lodash')
const xml = require('jsontoxml')
const Boom = require('boom')
const format = require('util').format
const bodyParser = require('body-parser')

module.exports = function(options) {

    var logger
    var config

    function init(dependencies, cb) {
        config = dependencies.config || {}
        app = dependencies.app
        logger = dependencies.logger || app.locals.logger || console
        cb()
    }

    function validate(cb) {
        if (!app) return cb(new Error('app is required'))
        cb()
    }

    function start(cb) {
        const jsonParser = bodyParser.json()

        app.use(jsonParser)
        app.use(get(options, 'handlers.error') || errorMiddleware);
        cb(null, app)
    }

    function errorMiddleware(err, req, res, next) {
        err = Boom.wrap(err)
        if (config.showErrorDetail) {
            err.output.payload.message = err.message
            err.output.payload.stack = err.stack
        }
        has(res, 'locals.logger') ? res.locals.logger.log(err) : logger.log(err)
        dispatch(err, req, res)
    }

    function dispatch(err, req, res) {
        res.status(err.output.statusCode)
        if (req.accepts('json')) res.set('Content-Type', 'application/json').send(JSON.stringify(err.output.payload) + '\n')
        else if (req.accepts(['application/xml', 'text/xml'])) res.set('Content-Type', 'text/xml').send(xml(err.output.payload)  + '\n')
        else res.send(format('%s %s\n%s\n', err.output.payload.statusCode, err.output.payload.message, err.output.payload.stack || ''))
    }

    return {
        start: async.seq(init, validate, start)
    }
}


