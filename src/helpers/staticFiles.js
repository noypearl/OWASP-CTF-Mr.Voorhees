const appRoot = require('app-root-path').path;
const path = require('path');

module.exports = {
  indexFilePath: path.join(appRoot, 'public', 'index.html'),
  privateKeyPath: path.join(appRoot, 'assets', 'private.key'),
  publicKeyPath: path.join(appRoot, 'backup', 'public.pem'),
  robotsFilePath: path.join(appRoot, 'assets', 'robots.txt'),
  errorPagePath: path.join(appRoot, 'public', 'error.html'),
  directoryListingPagePath: path.join(appRoot, 'backup', 'index.html'),
};
