require('./calculator.test.js');
require('./navigation.test.js');
const test = require('./harness.js');
process.stdout.write(`\n${test.count()} teste executate.\n`);
