const fs = require('fs');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
import config from '../../config'
const sharp = require('sharp')
import logger from '../../utils/logger';

const s3 = new AWS.S3({
  accessKeyId: config.s3AccessId,
  secretAccessKey: config.s3AccessSecret,
 // region: 'ap-east-1'
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
}

const transformer = sharp().resize({ height: 100 })

const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'psfr937-s3-bucket',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    transformer,
    key: function (req, file, cb) {
      cb(null, Date.now().toString()+"-"+file.originalname)
    }
  })
});

export const imageUpload = function (req, res, next) {
  upload.any()(req, res, function (err) {
    if (err instanceof multer.MulterError) {
     console.log(err)
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log(err)
    }
    next()
    // Everything went fine.
  })
}

module.exports = upload
