require('./navigation.test.js');
require('./redesign.test.js');
require('./font.test.js');
const test = require('./harness.js');
process.stdout.write(`\n${test.count()} teste executate.\n`);
