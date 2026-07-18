import { body } from "express-validator";

export const askQuestionValidator = [
  body("documentId")
    .trim()
    .notEmpty()
    .withMessage("Document id is required")
    .isMongoId()
    .withMessage("Invalid document id"),

  body("question")
    .trim()
    .notEmpty()
    .withMessage("Question is required")
    .isLength({
      min: 3,
      max: 1000,
    })
    .withMessage(
      "Question must be between 3 and 1000 characters",
    ),
];