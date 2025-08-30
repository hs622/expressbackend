// Higher order function.
// FYI: function that can received function as parameter.
// Wrapper function
const asyncHandler = (requestHandler) => {
  // callback function.
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };
