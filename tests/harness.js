let count = 0;
function test(name, callback) {
  count += 1;
  try {
    callback();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.exitCode = 1;
    process.stderr.write(`✗ ${name}\n${error.stack}\n`);
  }
}
test.count = () => count;
module.exports = test;
