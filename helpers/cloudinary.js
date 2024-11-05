const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
    return await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });
}

const upload = multer({storage});
module.exports = {upload, imageUploadUtil};