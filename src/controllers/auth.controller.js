// ** Services
import AuthService from "../services/auth.service";

// ** Constants
import { authConstant, httpConstant } from "../constants";

// ** Utils
import { response } from "../utils/baseResponse";

// ** Helpers
import { ApiError } from "../helpers/errorHandle";
import { message } from "../helpers/message";

class AuthController {
  async register(req, res, next) {
    const data = req.body;
    try {
      const user = await AuthService.createUser(data);
      res.status(200).json(
        response.success({
          data: { user },
        })
      );
    } catch (err) {
      next(new ApiError(409, err?.message));
    }
  }

  async login(req, res, next) {
    const { usernameOrEmail, password } = req.body;

    try {
      const data = await AuthService.login({ usernameOrEmail, password });

      res.status(200).json(
        response.success({
          data,
        })
      );
    } catch (err) {
      const errMessage = err.message;
      let code = 500;

      if (
        errMessage === message.incorrect("usernameOrEmail") ||
        errMessage === message.incorrect("password")
      ) {
        code = 404;
      }
      next(new ApiError(code, errMessage));
    }
  }

  async refreshAccessToken(req, res, next) {
    const { refreshToken } = req.body;

    try {
      const { accessToken } = await AuthService.getAccessToken(refreshToken);

      res.status(200).json(
        response.success({
          data: {
            accessToken,
          },
        })
      );
    } catch (err) {
      next(new ApiError(400, err?.message));
    }
  }
}

export default new AuthController();
