import { body } from 'express-validator';

export const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({min: 2, max: 80})
        .withMessage('Name must contain between 2 to 80 characters'),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 72})
        .withMessage("Password must contain between 8 to 72 characters")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
]

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Please provide a valid email address")
        .normalizeEmail(),
    
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
]