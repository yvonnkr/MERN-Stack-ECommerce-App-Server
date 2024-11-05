const {imageUploadUtil} = require("../../helpers/cloudinary")


const handleImageUpload = async (req, res) => {
    try {
        const base64 = Buffer.from(req.file.buffer).toString("base64");
        const url = "data:" + req.file.mimetype + ";base64," + base64;
        const result = await imageUploadUtil(url);

        res.json({
            success: true,
            result
        })

    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: `Error occurred while trying to upload image: ${err.message}`,
        })
    }

}

module.exports = {handleImageUpload}