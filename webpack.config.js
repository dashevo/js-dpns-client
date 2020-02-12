const path = require('path');

const UMDConfig = {
  entry: ['./lib/DPNSClient.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dpns-client.min.js',
    library: 'DPNSClient',
    libraryTarget: 'umd',
  },
};

module.exports = [UMDConfig];
