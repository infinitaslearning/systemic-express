var async = require('async')
const { has, merge, once } = require('lodash')
var duration = require('parse-duration')
var format = require('util').format
var enableDestroy = require('server-destroy')

module.exports = function(options) {

    var config
    var app
    var logger
    var server
    var destroy

    function init(dependencies, cb) {
        config = merge({ host: '0.0.0.0', shutdown: { delay: '5s' } }, dependencies.config)
        app = dependencies.app
        logger = dependencies.logger || app.locals.logger || console
        cb()
    }

    function validate(cb) {
        if (!app) return cb(new Error('app is required'))
        if (!has(config, 'port')) return cb(new Error('config.port is required'))
        cb()
    }

    function start(cb) {
        logger.info(format('Starting server on %s:%d', config.host, config.port))
        server = app.listen(config.port, config.host, cb)
        enableDestroy(server)
    }

    function stop(cb) {
        if (!server) return cb()
        var next = once(cb)
        scheduleDestroy(next)
        close(next)
    }

    function scheduleDestroy(cb) {
        destroy = setTimeout(function() {
            logger.info(format('Server did not shutdown gracefully within %s', config.shutdown.delay))
            logger.warn(format('Forcefully stopping server on %s:%d', config.host, config.port))
            server.destroy(cb)
        }, duration(config.shutdown.delay))
        destroy.unref()
    }

    function close(cb) {
        logger.info(format('Stopping server on %s:%d', config.host, config.port))
        server.close(function() {
            clearTimeout(destroy)
            cb()
        })
    }

    return {
        start: async.seq(init, validate, start),
        stop: stop
    }
}
