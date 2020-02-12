// This file is used for compiling tests with webpack into one file for using with karma
require('./test/bootstrap.karma.js');

const testsContext = require.context('./test/unit', true, /\.js$/);

testsContext.keys().forEach(testsContext);
