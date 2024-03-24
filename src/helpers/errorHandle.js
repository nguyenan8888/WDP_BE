import { response } from "../utils/baseResponse";

export class ApiError {
  constructor(statusCode, message) {
    this.statusCode = statusCode;
    this.message = message;
  }

  badRequest(message) {
    return new ApiError(400, message);
  }

  static forbidden(
    code = 403,
    message = {
      key: "token",
      message: "Forbidden",
      type: "err.forbidden",
      path: ["authentication"],
    }
  ) {
    return new ApiError(code, message);
  }

  static limited(
    message = {
      key: "ratelimit",
      message: "Too many requests!",
      type: "err.ratelimit",
      path: ["rate-limit"],
    }
  ) {
    return new ApiError(429, message);
  }

  static internalError(
    message = {
      message: "Something went wrong!",
      type: "err.internal",
      key: "internal-server",
    }
  ) {
    return new ApiError(500, message);
  }

  static emptyBody(
    message = {
      message: "Request body is empty",
      type: "err.body-null",
      key: "req.body",
    }
  ) {
    return new ApiError(400, message);
  }
}

export const ErrorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(200).json(
      response.error({
        code: error.statusCode,
        message: error.message,
      })
    );
    return;
  }

  res.status(500).send(error.message);
  next();
};
