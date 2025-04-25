const fs = require('fs');
const apiKey = process.env.API_KEY; //  Access the environment variable

if (!apiKey) {
  console.error('API_KEY is not set!');
  process.exit(1); //  Exit the build with an error
}

const configFileContent = `
const config = {
apiKey: '${apiKey}', //  Inject the value into the file
};
`;

fs.writeFileSync('config2.js', configFileContent); // create a config file
console.log('config file written');
