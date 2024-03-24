// ** Libs
import { body } from "express-validator";

// ** Validate
import { validate } from "./validation-request";

// ** Helpers
import { message } from "../../helpers/message";

export const postValidation = {
    createPost: () =>
        validate([
            body("content").notEmpty().isString().withMessage(message.required("content")),
        ]),
}