/* 

Entry point to Jesteer. Takes two arguments:
  - Absolute filepath to folder containing Chrome Recorder-generated Puppeteer Scripts
  - Absolute filepath to folder containing identically named .txt files, containing newline-separated css selectors—the elements we want to make snapshots of.

After you run this program, you'll get a new folder called generated, which will contain a new puppeteer testing suite.

*/

const lib = require('./scripts/recorderConverterLib.js');
const args = process.argv.slice(2);
const path = require('path');
const fs = require('fs');
const fsp = require('fs').promises;
const dest = path.resolve(__dirname, './generated/__tests__/puppeteer.js');

const scriptsDir = args[0];
const selectorsDir = args[1];
const scriptsPromise = fsp.readdir(scriptsDir);
const selectorsPromise = fsp.readdir(selectorsDir);

// each file in scriptsDir should have a corresponding file in selectorsDir with the same name
// for now, we just assume that this is the case
Promise.all([scriptsPromise, selectorsPromise])
  .then((data) => {
    console.log('promise.all resolved');
    console.log(data);
    const scriptPaths = data[0].map(file => path.resolve(scriptsDir, file));
    const selectorPaths = data[1].map(file => path.resolve(selectorsDir, file));
    console.log(scriptPaths, selectorPaths);
    lib.writeSuite(dest, scriptPaths, selectorPaths);
  })
  .catch(err => console.log('promise.all err:', err));