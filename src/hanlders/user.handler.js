import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Cookie setting
const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh tokens"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {

  const { email, username, password } = req.body;

  // either username or email.
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required.");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User doesn't exist.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const updatedUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: updatedUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully."));
});

export { resgisterUser, loginUser, logoutUser };
