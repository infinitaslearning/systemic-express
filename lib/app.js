const async = require("async");
const { merge, get } = require("lodash");
const debug = require("debug")("systemic-express:app");
const bodyParser = require("body-parser");
const { errorMiddleware } = require("./errorMiddleware");

// default value from body-parser lib
const defaultJsonParserLimit = "100kb";

module.exports = (options) => {
  const express = get(options, "express") || require("express");
  let config;
  let logger;

  function init(dependencies, cb) {
    config = merge(
      {
        settings: { "x-powered-by": false, etag: false },
      },
      dependencies.config,
    );
    logger = dependencies.logger || console;
    cb();
  }

  function start(cb) {
    const jsonParserLimit = options?.jsonParserLimit || defaultJsonParserLimit;
    const app = express();
    const jsonParser = bodyParser.json({ limit: jsonParserLimit });

    app.locals.logger = logger;
    app.use(jsonParser);
    app.use(errorMiddleware({ logger, config }));
    app.get("/status", statusMiddleware);

    for (const key in config.settings) {
      debug("Setting %s to %s", key, config.settings[key]);
      app.set(key, config.settings[key]);
    }
    cb(null, app);
  }

  function statusMiddleware(_req, res, _next) {
    res.json({ status: "Success", environment: process.env.IL_ENV });
  }
  return {
    start: async.seq(init, start),
  };
};
