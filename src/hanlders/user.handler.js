import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const resgisterUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  if (
    await User.findOne({
      $or: [{ username }, { email }],
    })
  ) {
    throw new ApiError(409, "User with email or username already exists.");
  }

  // classical way of handling files.
  if (
    !(
      req.files &&
      Array.isArray(req.files.avatar) &&
      req.files?.avatar?.length > 0
    )
  ) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);

  const user = await User.create({
    username: username?.trim()?.toLowerCase(),
    email,
    password,
    fullName,
    avatar: cloudinaryResponse?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registed successfully."));
});

export { resgisterUser };
