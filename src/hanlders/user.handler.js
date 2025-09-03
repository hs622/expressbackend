import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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
  try {
    const { firstName, email, username, password } = req.body;

    if (
      [firstName, email, username, password].some(
        (field) => field?.trim() === ""
      )
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
      profile: {
        firstName,
        avatar: cloudinaryResponse?.url || "",
      },
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "user registed successfully."));
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while registrating user."
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
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

    const updatedUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

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
  } catch (error) {
    throw new ApiError(
      401,
      error?.messahe || "something went wrong while login user."
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while logging out the user."
    );
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshAccessToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshAccessToken) {
      throw new ApiError(401, "Unauthorized request.");
    }

    const decodedToken = jwt.verify(
      incomingRefreshAccessToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // since we are not taking the refresh-toke from auth.middleware
    // we need to generate a database request.
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token.");
    }

    if (incomingRefreshAccessToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user?._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token reissued."
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token.");
  }
});

const updateCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully."));
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while updating the user password."
    );
  }
});

const fetchCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully."));
});

const updateUsername = asyncHandler(async (req, res) => {
  try {
    const { username } = req.body;

    if (!username.trim()) {
      throw new ApiError(401, "Invalid username.");
    }

    const usernameExist = await User.findOne({
      username,
    });

    if (usernameExist) {
      throw new ApiError(401, "Username already taken.");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        username: username.toLowerCase().trim(),
      },
      { new: true, validateBeforeSave: false }
    ).select("-password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "username updated successfully.")
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while updating username."
    );
  }
});

const updateProfileDetails = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, dob, gender } = req.body;

    if (!firstName.trim()) {
      throw new ApiError(401, "first name field is required.");
    }

    if (!["Male", "Female", "Other"].includes(gender)) {
      throw new ApiError(401, "invalid gender; options: Male, Female, Other.");
    }

    req.user.profile = {
      firstName,
      lastName,
      dob,
      gender,
    };
    await req.user.save({ validateBeforeSave: false });
    const updatedUser = await User.findById(req.user?._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(201, updatedUser, "user profile update successfully.")
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something went wrong while updating profile details."
    );
  }
});

export {
  resgisterUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  fetchCurrentUser,
  updateCurrentPassword,
  updateUsername,
  updateProfileDetails,
};
