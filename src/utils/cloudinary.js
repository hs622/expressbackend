import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  cloud_key: process.env.CLOUDINARY_KEY,
  cloud_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log(`file is uploaded on cloudinary ${response.url}`);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed.
    fs.unlinkSync(localFilePath);
    return null;
  }
};
