const { init } = require('express/lib/application');
const fs = require('fs');
const path = require('path');

const dest = path.resolve(__dirname, '../generated/__tests__/newFile.js');

// first part of file
const scaffolding = `
  const puppeteer = require('puppeteer');

  describe('', () => {
    it('', async () => {
`;

// create a new js file
fs.writeFileSync(dest, scaffolding);

// Import the google puppeteer script
// fs.readFileSync returns a buffer. E.G. <Buffer 33 2e 30 2e 30 ... 6371 more bytes>
const buffer = fs.readFileSync(path.resolve(__dirname, '../example/examplePuppeteer.js'));
//use the toString() method to convert buffer into string
const fileContent = buffer.toString();

// get initialization of puppeteer into the test file
const initIndexStart = fileContent.search('const browser = await'); // start index of init
const initIndexEnd = fileContent.search(/timeout\);/) + 10; // gets us the end index of init block
fs.appendFileSync(dest, fileContent.substring(initIndexStart, initIndexEnd));

// add the main puppeteer script to the file
const firstIndexOfScript = fileContent.search(/}\s*{/g);
fs.appendFileSync(dest, fileContent.substring(firstIndexOfScript + 1, fileContent.length - 5));

// blockEnd is the brackets which close a describe/it block
const blockEnd = `
});
`
fs.appendFileSync(dest, blockEnd + blockEnd);

// add async functions to end of test suite
const functionsStart = fileContent.search(/async function/);
const functionsEnd = fileContent.search(/}\s*{/g);
fs.appendFileSync(dest, fileContent.substring(functionsStart, functionsEnd) + '\n}');


