// ** Libs
import { body } from "express-validator";

// ** Validate
import { validate } from "./validation-request";

// ** Helpers
import { message } from "../../helpers/message";

export const authValidation = {
  register: () =>
    validate([
      body("username")
        .trim()
        .notEmpty()
        .withMessage(message.required("username")),
      body("email")
        .trim()
        .notEmpty()
        .withMessage(message.required("email"))
        .isEmail()
        .withMessage(message.invalid("email")),

      // validate tối thiểu 8 kí tự, ít nhất 1 chữ hoa 1 chữ thường
      body("password")
        .notEmpty()
        .withMessage(message.required("password"))
        .isLength({ min: 8, max: 30 })
        .withMessage(message.stringLengthInRange({ min: 8, max: 30 }))
        .matches(/^(?=.*[A-Z])(?=.*[0-9])/)
        .withMessage('Your password should contain at least one uppercase letter and one number')
      // body("firstName")
      //   .notEmpty()
      //   .withMessage(message.required("firstName"))
      //   .isLength({ min: 1, max: 20 })
      //   .withMessage(message.stringLengthInRange({ min: 1, max: 20 })),
      // body("lastName")
      //   .notEmpty()
      //   .withMessage(message.required("lastName"))
      //   .isLength({ min: 1, max: 20 })
      //   .withMessage(message.stringLengthInRange({ min: 1, max: 20 })),
      // body("gender")
      //   .notEmpty()
      //   .withMessage(message.required("gender"))
      //   .isIn(["Male", "Female", "Other"])
      //   .withMessage(
      //     message.mustBeOneOf({
      //       field: "gender",
      //       values: ["Male", "Female", "Other"],
      //     })
      //   ),
    ]),
  login: () =>
    validate([
      body("usernameOrEmail")
        .notEmpty()
        .withMessage(message.required("usernameOrEmail")),
      body("password")
        .notEmpty()
        .withMessage(message.required("password"))
        .isLength({ min: 6, max: 30 })
        .withMessage(message.stringLengthInRange({ min: 6, max: 30 })),
    ]),

  changePassword: () =>
    validate([
      body("currentPassword")
        .notEmpty()
        .withMessage(message.required("currentPassword")),
      body("newPassword")
        .notEmpty()
        .withMessage(message.required("newPassword"))
        .isLength({ min: 6, max: 30 })
        .withMessage(message.stringLengthInRange({ min: 6, max: 30 })),
    ]),
};
