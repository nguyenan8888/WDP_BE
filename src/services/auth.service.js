// ** Entity
import User from "../models/user";

// ** Libs
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// ** Helpers
import { message } from "../helpers/message";
import { authConstant } from "../constants";

class AuthService {
  async createUser({ username, email, password, firstName, lastName }) {
    //check username or email exist

    const userNameExist = await User.findOne({username});
    const emailExist = await User.findOne({email});

    if (userNameExist) {
      throw new Error(message.exist(username));
    }

    if (emailExist) {
      throw new Error(message.exist(email));
    }
    const user = new User({
      email,
      username,
      firstName,
      lastName,
      password,
      lastName,
    });

    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(user.password, salt);

    await user.save();

    const userJson = user.toJSON();

    delete userJson.password;
    delete userJson.refreshToken;
    delete userJson.blockedUsers;

    return userJson;
  }

  async getTokens(payload, type = "login") {
    let accessToken, refreshToken;

    if (type === "login") {
      [accessToken, refreshToken] = await Promise.all([
        jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
          expiresIn: process.env.EXPIRES_ACCESS_TOKEN,
        }),
        jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: process.env.EXPIRES_REFRESH_TOKEN,
        }),
      ]);

      return { accessToken, refreshToken };
    } else {
      accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
        expiresIn: process.env.EXPIRES_ACCESS_TOKEN,
      });

      return { accessToken };
    }
  }

  async login({ usernameOrEmail, password }) {
    const user = await User.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    });

    if (!user) throw new Error(message.incorrect("usernameOrEmail"));

    if (!bcrypt.compareSync(password, user.password))
      throw new Error(message.incorrect("password"));

    // Get access-token & refresh-token
    const payload = {
      id: user.id,
      name: `${user.lastName} ${user.firstName}`,
      email: user.email,
      role: user.role,
    };

    const { accessToken, refreshToken } = await this.getTokens(payload);

    const salt = bcrypt.genSaltSync();
    user.refreshToken = bcrypt.hashSync(refreshToken, salt);

    await user.save();

    const userJson = user.toJSON();
    delete userJson.password;
    delete userJson.refreshToken;
    delete userJson.blockedUsers;

    return {
      user: userJson,
      accessToken,
      refreshToken,
    };
  }

  async getAccessToken(refreshToken) {
    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    const user = await User.findById(payload.id);

    const isMatchRefreshToken = bcrypt.compareSync(
      refreshToken,
      user.refreshToken
    );

    if (isMatchRefreshToken) {
      return await this.getTokens(
        {
          id: user.id,
          name: `${user.lastName} ${user.firstName}`,
          email: user.email,
          role: user.role,
        },
        "refreshToken"
      );
    } else throw new Error(authConstant.UNAUTHORIZED);
  }
}

export default new AuthService();
