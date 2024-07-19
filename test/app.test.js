const { describe, it } = require("mocha");
const request = require("supertest");

const System = require("systemic");

const { app } = require("../index");

const boomUrl = "/boom";

const myErrorHandler = (error, _req, res, _next) => {
  const message = "Something went wrong";
  console.error(message, error.stack);
  res.status(500).send(message);
};

const routes = {
  start: async ({ app }) => {
    app.get(boomUrl, () => {
      throw new Error("Expected error");
    });
    app.use(myErrorHandler);
  },
};

describe("app", () => {
  it("should run", (done) => {
    const system = new System().add("app", app()).add("routes", routes).dependsOn("app");

    system.start((err, { app }) => {
      if (err) throw err;

      request(app)
        .get(boomUrl)
        .expect(500, "Something went wrong")
        .then(() => done())
        .catch((err) => {
          throw err;
        });
    });
  });
});
