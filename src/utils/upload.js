

const multer = require('multer');
const path = require('path');

// AWS SDK v3 imports
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// AWS v3 Client configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Allowed File Types
const allowedTypes = ['image/jpeg', 'image/png', "image/webp", 'image/jpg', 'application/pdf', 'video/mp4', 'video/mpeg', 'video/avi'];

// File Filter for Validation
const fileFilter = (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Allowed types: JPG, PNG, PDF, MP4, MPEG, AVI'));
  }
  cb(null, true);
};

// Configure Local Storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/temp'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configure Memory Storage for S3
const s3Storage = multer.memoryStorage();

// Select Upload Type
const upload = (storageType) =>
  multer({
    storage: storageType === 's3' ? s3Storage : localStorage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Limit
  });

// Upload Multiple Files to S3 using AWS SDK v3
const uploadToS3 = async (files, folderName = 'general') => {
  try {
    const uploadResults = [];

    for (const file of files) {
      const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);

      // S3 v3 does not return Location by default, construct manually
      const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      uploadResults.push(fileUrl);
    }

    return uploadResults;
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload to S3');
  }
};

module.exports = { upload, uploadToS3 };

