const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { Client } = require('ssh2');

require('dotenv').config();

const { DEPLOY_HOST, DEPLOY_PORT, DEPLOY_USER, DEPLOY_PASS, DEPLOY_TARGET, DEPLOY_DIR_FROM_ROOT, DEPLOY_KEY_PATH, DEPLOY_KEY_PASSPHRASE } = process.env;

if (!DEPLOY_HOST) {
  throw new Error('Invalid params: DEPLOY_HOST');
} else if (!DEPLOY_USER) {
  throw new Error('Invalid params: DEPLOY_USER');
} else if (!DEPLOY_PASS && !DEPLOY_KEY_PATH) {
  throw new Error('Invalid params: DEPLOY_PASS and DEPLOY_KEY_PATH');
} else if (!DEPLOY_TARGET) {
  throw new Error('Invalid params: DEPLOY_TARGET');
} else if (!DEPLOY_DIR_FROM_ROOT) {
  throw new Error('Invalid params: DEPLOY_DIR_FROM_ROOT');
}

/*
 * settings
 */
// connection settings
const connectOption = {
  host: DEPLOY_HOST,
  port: parseInt(DEPLOY_PORT || '22', 10),
  username: DEPLOY_USER
};
if (DEPLOY_KEY_PATH) {
  connectOption.privateKey = fs.readFileSync(DEPLOY_KEY_PATH);

  if (DEPLOY_KEY_PASSPHRASE) {
    connectOption.passphrase = DEPLOY_KEY_PASSPHRASE;
  }
}

if (DEPLOY_PASS) {
  connectOption.password = DEPLOY_PASS;
}
// upload remote path
const uploadRemoteDirectory = DEPLOY_TARGET;
// upload local directory
const uploadLocalFilePath = path.join(process.cwd(), DEPLOY_DIR_FROM_ROOT);

/*
 * methods
 */
const conn = new Client();
conn.on('ready', () => conn.sftp(upload))
  .connect(connectOption);

function upload (err, sftp) {
  if (err) {
    throw err;
  }

  if (isDir(uploadLocalFilePath)) {
    Promise.all(getUploadFilePromisesAndCreateRemoteDirectory(sftp))
      .then(results => {
        results.forEach(result => console.log(result));
        conn.end();
      })
      .catch(error => {
        console.error(error);
        conn.end();
      });
  } else {
    const remoteFilePath = uploadLocalFilePath.replace(path.dirname(uploadLocalFilePath), uploadRemoteDirectory);
    getUploadFilePromise(sftp, uploadLocalFilePath, remoteFilePath)
      .then(success => {
        console.log(success);
        conn.end();
      })
      .catch(error => {
        console.error(error);
        conn.end();
      });
  }
}

function getUploadFilePromisesAndCreateRemoteDirectory (sftp) {
  const files = glob.sync(path.join(uploadLocalFilePath, '**', '*'), { dot: true });
  const promises = [];
  files.forEach(localFilePath => {
    const remoteFilePath = localFilePath.replace(uploadLocalFilePath, uploadRemoteDirectory);
    if (isDir(localFilePath)) {
      createRemoteDirectory(sftp, remoteFilePath);
    } else {
      promises.push(getUploadFilePromise(sftp, localFilePath, remoteFilePath));
    }
  });

  return promises;
}

function createRemoteDirectory (sftp, filePath) {
  const createDirectoryResult = sftp.mkdir(filePath);
  console.log(`create directory: ${filePath}, ${createDirectoryResult}`);
}

function getUploadFilePromise (sftp, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localPath, remotePath, {}, error => {
      if (!error) {
        resolve(`Success. From[${localPath}] To[${remotePath}]`);
      } else {
        reject(`Failure. From[${localPath}] To[${remotePath}], ${error}`);
      }
    });
  });
}

function isDir (filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
}
