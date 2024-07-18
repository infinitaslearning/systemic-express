const { describe, it } = require("mocha");
const { spy } = require("sinon");
const { strictEqual, deepStrictEqual } = require("node:assert/strict");
const { errorMiddleware } = require("../lib/errorMiddleware");

describe("errorMiddleware", () => {
  const error = new Error("Something went wrong");
  const request = { accepts: spy() };
  const response = { status: spy(), send: spy() };
  const logger = { log: spy() };

  it("Should handle errors", async () => {
    // Act
    errorMiddleware({ logger, config: {} })(error, request, response, () => {});

    // Assert
    const loggedError = logger.log.lastCall.args.at(0);
    strictEqual(loggedError.message, error.message);
    strictEqual(loggedError.name, error.name);

    const lastResponseStatusArg = response.status.lastCall.args.at(0);
    strictEqual(lastResponseStatusArg, 500);

    const lastResponseSendArg = response.send.lastCall.args.at(0);
    strictEqual(lastResponseSendArg, "500 An internal server error occurred\n\n");

    const lastRequestAcceptsArg = request.accepts.args;

    strictEqual(lastRequestAcceptsArg[0][0], "json");
    deepStrictEqual(lastRequestAcceptsArg[1][0], ["application/xml", "text/xml"]);
  });
});
