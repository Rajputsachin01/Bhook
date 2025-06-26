const { uploadToS3 } = require("../utils/upload");
const Response = require("../utils/responseHelper");
const uploadFile = async (req, res) =>{
    try {
        if (!req.files) return Helper.fail(res,'File is required' );
        const folderName = req.body.folderName || 'Bhookh';
        const fileUrl = await uploadToS3(req.files, folderName);
        return Response.success(res,'File uploaded successfully', {imageUrl:fileUrl});
        }
   catch (err) {
       return Response.error(res, "Failed to Upload file", err);
     }
}

module.exports = { uploadFile };