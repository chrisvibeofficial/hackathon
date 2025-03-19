const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },
  filename: (req, file, cb) => {
    const nameSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const extension = file.mimetype.split('/')[1];
    cb(null, `IMG_${nameSuffix}.${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    new Error('Invalid file type, Images only')
  }
};

const limits = {
  limits: 1024 * 1024 * 10
};

const uploads = multer({
  storage,
  fileFilter,
  limits
});

module.exports = uploads;