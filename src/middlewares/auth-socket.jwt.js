import { message } from "../helpers/message";
import jwt from "jsonwebtoken";

export const verifyJwtSocket = (socket, next) => {
  try {
    const { token } = socket.handshake.headers;

    if (!token) throw new Error(message.required("Token"));

    const payload = jwt.verify(token, process.env.JWT_ACCESS_KEY);

    socket.user = payload;
    socket.token = token;
    next();
  } catch (err) {
    next(new Error(err?.message));
  }
};
