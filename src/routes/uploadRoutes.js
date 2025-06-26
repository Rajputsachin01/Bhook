const express = require('express');
const { upload } = require("../utils/upload")
const { uploadFile } = require("../controllers/uploadController")
const router = express.Router();
router.post('/submit', upload('s3').array('file', 10), uploadFile);
module.exports = router;