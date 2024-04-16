const fs = require("fs").promises;
const cloudinary = require("../config/cloudinary.js");

const uploadFileToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    try {
      // remove file if file is not upload to cloudinary
      await fs.unlink(localFilePath);
      console.log("File successfully deleted");
    } catch (err) {
      console.error("Error deleting the file:", err);
    }
    console.log(error);
  }
};

module.exports = uploadFileToCloudinary;
