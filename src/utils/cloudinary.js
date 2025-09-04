import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temporary file as the upload operation got failed.
    fs.unlinkSync(localFilePath);
    return error;
  }
};

const removePreviousAvatarImage = async (path) => {
  try {
    const key = path.split("/").at(-1).split(".")[0];
    return await cloudinary.uploader.destroy(key);
  } catch (error) {
    console.log(error);
    return error;
  }
};

export { uploadOnCloudinary, removePreviousAvatarImage };
