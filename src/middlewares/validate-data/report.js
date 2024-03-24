// ** Libs
import { body } from "express-validator";

// ** Validate
import { validate } from "./validation-request";

// ** Helpers
import { message } from "../../helpers/message";

export const reportValidation = {
    newReport: () =>
        validate([
            body("type").optional().isString("Post", "User", "Comment"),
        ]),
}