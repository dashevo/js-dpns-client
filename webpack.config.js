const path = require('path');

const UMDConfig = {
  entry: ['./lib/DPNSClient.js'],
  module: {
    noParse: [
      // See sinon/webpack interaction weirdness:
      // https://github.com/webpack/webpack/issues/304#issuecomment-272150177
      /\/sinon\.js|codemirror-compressed\.js|hls\.js|tinymce\.full\.min\.js/,
    ],
  },
  resolve: {
    alias: {
      // See sinon/webpack interaction weirdness:
      // https://github.com/webpack/webpack/issues/304#issuecomment-272150177
      sinon: `${__dirname}/node_modules/sinon/pkg/sinon.js`,
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'dpns-client.min.js',
    library: 'DPNSClient',
    libraryTarget: 'umd',
  },
};

module.exports = [UMDConfig];
