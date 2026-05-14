const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/videos'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/thumbnails'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const videoFilter = (req, file, cb) => {
  const allowed = /mp4|mkv|webm|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  allowed.test(ext) ? cb(null, true) : cb(new Error('Only video files are allowed'));
};

const imageFilter = (req, file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  allowed.test(ext) ? cb(null, true) : cb(new Error('Only image files are allowed'));
};

const maxVideoMB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '500');
const maxImageMB = parseInt(process.env.MAX_IMAGE_SIZE_MB || '5');

exports.uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: maxVideoMB * 1024 * 1024 },
}).single('video');

exports.uploadThumbnail = multer({
  storage: thumbnailStorage,
  fileFilter: imageFilter,
  limits: { fileSize: maxImageMB * 1024 * 1024 },
}).single('thumbnail');
