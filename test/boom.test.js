const { describe, it } = require("mocha");
const { strictEqual, deepStrictEqual } = require("node:assert/strict");
const newBoom = require("@hapi/boom");

/**
 * This test is here to prove that the old Boom.wrap method
 * is equal to the new Boom class.
 * This test exit with 0 if the boom library is not installed.
 * It should not be installed since it is deprecated https://www.npmjs.com/package/boom
 */
describe("Booom testing", () => {
  const message = "Something went wrong";
  it("wrap", (done) => {
    let oldBoom;
    try {
      oldBoom = require("boom");
    } catch (_) {
      console.log("\tBoom is not installed and this test will be skipped");
      done();
    }
    const errorWrap = oldBoom.wrap(new Error(message));
    const errorNew = new newBoom.Boom(new Error(message));

    strictEqual(errorNew.message, errorWrap.message);
    strictEqual(errorNew.isBoom, errorWrap.isBoom);
    deepStrictEqual(errorNew.output, errorWrap.output);
  });
});
