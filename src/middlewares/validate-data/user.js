// ** Libs
import { body } from "express-validator";

// ** Validate
import { validate } from "./validation-request";

// ** Helpers
import { message } from "../../helpers/message";

export const userValidation = {
    editProfile: () =>
        validate([
            body("username").optional().isString(),
            body("firstName").optional().isString(),
            body("lastName").optional().isString(),
            body("gender").optional().isString("Male", "Female", "Other"),
            // body("dob").optional().isDate("dd-MM-yyyy"),
            body("biography").optional().isString(),
            body("email")
            .optional()
            .trim()
            .isEmail()
            .withMessage(message.invalid("email")),
            body("phone")
            .optional()
            .isNumeric()
            .withMessage('Your phone number should contain only numbers')
            .isLength({ min: 10, max: 12 })
            .withMessage(message.stringLengthInRange({ field:'phone number', min: 10, max: 12 }))
        ]),
    changePassword: () =>
        validate([
            body("currentPassword")
                .notEmpty()
                .withMessage(message.required("currentPassword")),
            body("newPassword")
                .notEmpty()
                .withMessage(message.required("newPassword")),
        ]),
}