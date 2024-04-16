const uploadFileToCloudinary = require("../services/fileUpload");
const fs = require("fs").promises;

// upload file to cloudinary

exports.uploadFile = async (req, res) => {
  try {
    const response = await uploadFileToCloudinary(req.file.path);
    if (response) {
      // delete file from server
      await fs.unlink(req.file.path);
      res.json({ response, success: true });
    } else {
      res.status(500).json({ error: "Error uploading file", success: false });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file", success: false });
  }
};
