// ** Libs
import { body, query } from "express-validator";

// ** Validate
import { validate } from "./validation-request";

// ** Helpers
import { message } from "../../helpers/message";
import { REACT_ACTIONS } from "../../constants";

export const chatValidation = {
  chatContent: () =>
    validate([
      query("page")
        .optional()
        .default(1)
        .isInt({ min: 1 })
        .withMessage(
          message.mustBeNumberAndGreaterThanOrEqual({ field: "page", value: 1 })
        ),
      query("chatId").notEmpty().withMessage(message.required("chatId")),
    ]),
  sendMessage: () =>
    validate([
      body("content").optional().isString(),
      body("images").optional().isArray({ min: 0, max: 10 }),
      body("target_user_id")
        .notEmpty()
        .withMessage(message.required("target_user_id")),
      body("replyTo").optional().isString(),
    ]),
  getChats: () =>
    validate([
      query("limit").notEmpty().withMessage(message.required("limit")),
      query("offset").notEmpty().withMessage(message.required("offset")),
    ]),
  reactMessage: () =>
    validate([
      body("chatId").notEmpty().withMessage(message.required("chatId")),
      body("action")
        .notEmpty()
        .withMessage(message.required("action"))
        .isIn([
          REACT_ACTIONS.ANGRY,
          REACT_ACTIONS.HAHA,
          REACT_ACTIONS.LIKE,
          REACT_ACTIONS.LOVE,
          REACT_ACTIONS.SAD,
          REACT_ACTIONS.WOW,
        ]),
      body("messageId").notEmpty().withMessage(message.required("messageId")),
    ]),
};
