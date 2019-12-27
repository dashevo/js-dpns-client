const path = require('path');

const dotenvSafe = require('dotenv-safe');
const dotenvExpand = require('dotenv-expand');

const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');

const DriveApiOptions = require(
  '@dashevo/dp-services-ctl/lib/services/drive/api/DriveApiOptions',
);
const DriveUpdateStateOptions = require(
  '@dashevo/dp-services-ctl/lib/services/drive/updateState/DriveUpdateStateOptions',
);

const DashCoreOptions = require(
  '@dashevo/dp-services-ctl/lib/services/dashCore/DashCoreOptions',
);

const DapiCoreOptions = require(
  '@dashevo/dp-services-ctl/lib/services/dapi/core/DapiCoreOptions',
);
const DapiTxFilterStreamOptions = require(
  '@dashevo/dp-services-ctl/lib/services/dapi/txFilterStream/DapiTxFilterStreamOptions',
);

const MachineOptions = require(
  '@dashevo/dp-services-ctl/lib/services/machine/MachineOptions',
);

use(dirtyChai);
use(sinonChai);

beforeEach(function beforeEach() {
  if (!this.sinon) {
    this.sinon = sinon.createSandbox();
  } else {
    this.sinon.restore();
  }
});

afterEach(function afterEach() {
  this.sinon.restore();
});

const dotenvConfig = dotenvSafe.config({
  path: path.resolve(__dirname, '..', '.env'),
});
dotenvExpand(dotenvConfig);

if (process.env.SERVICE_IMAGE_DRIVE) {
  DriveApiOptions.setDefaultCustomOptions({
    container: {
      image: process.env.SERVICE_IMAGE_DRIVE,
    },
  });

  DriveUpdateStateOptions.setDefaultCustomOptions({
    container: {
      image: process.env.SERVICE_IMAGE_DRIVE,
    },
  });
}

if (process.env.SERVICE_IMAGE_CORE) {
  DashCoreOptions.setDefaultCustomOptions({
    container: {
      image: process.env.SERVICE_IMAGE_CORE,
    },
  });
}

if (process.env.SERVICE_IMAGE_DAPI) {
  DapiCoreOptions.setDefaultCustomOptions({
    container: {
      image: process.env.SERVICE_IMAGE_DAPI,
    },
  });

  DapiTxFilterStreamOptions.setDefaultCustomOptions({
    container: {
      image: process.env.SERVICE_IMAGE_DAPI,
    },
  });
}

if (process.env.SERVICE_IMAGE_MACHINE) {
  MachineOptions.setDefaultCustomOptions({
    container: {
      image: process.env.SERVICE_IMAGE_MACHINE,
    },
  });
}

global.expect = expect;
