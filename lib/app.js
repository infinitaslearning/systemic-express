const async = require('async')
const { merge, get, has } = require('lodash')
const Boom = require('boom');
const xml = require('jsontoxml');
const { format } = require('util');
const debug = require('debug')('systemic-express:app')
const bodyParser = require('body-parser')

module.exports = function(options) {

    const express = get(options, 'express') || require('express')
    let config
    let logger

    function init(dependencies, cb) {
        config = merge({
            settings: { 'x-powered-by': false, 'etag': false }
        }, dependencies.config)
        logger = dependencies.logger || console
        cb()
    }

    function start(cb) {
        const app = express()
        const jsonParser = bodyParser.json()

        app.locals.logger = logger
        app.use(jsonParser)
        app.use(errorMiddleware);
        app.get('/status', statusMiddleware);

        for (const key in config.settings) {
            debug('Setting %s to %s', key, config.settings[key])
            app.set(key, config.settings[key])
        }
        cb(null, app)
    }

    function dispatch(err, req, res) {
        res.status(err.output.statusCode)
        if (req.accepts('json')) res.set('Content-Type', 'application/json').send(JSON.stringify(err.output.payload) + '\n')
        else if (req.accepts(['application/xml', 'text/xml'])) res.set('Content-Type', 'text/xml').send(xml(err.output.payload)  + '\n')
        else res.send(format('%s %s\n%s\n', err.output.payload.statusCode, err.output.payload.message, err.output.payload.stack || ''))
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

    function statusMiddleware(req, res, next) {
        res.json({ status: 'Success', environment: process.env.IL_ENV })
    }
    return {
        start: async.seq(init, start)
    }
}
