// Import the functions to test
const Octavalidate  = require('../index.js');

//create new instance of Octavalidate
const octavalidate = new Octavalidate('test')

//destructure methods
const { createValidator, validate, getErrors } = octavalidate

//define validation rules
const rules = {
    username: {
        required: true,
        ruleTitle: "userName",
        type: "string",
        errorMessage: {
            required: "Your username is required",
            ruleTitle: "Your username contains invalid characters",
            type: "Your username must be a string"
        }
    },
    phone: {
        required: true,
        pattern: /^\+234[789]\d{9}$/,
        type: "string",
        errorMessage: {
            required: "Your phone number is required",
            pattern: "Invalid phone number format"
        }
    },
    password: {
        required: true,
        type: "string",
        ruleTitle: "strongPassword",
        errorMessage: {
            required: "Your password is required",
            type: "Your password must be a string",
            ruleTitle: "The password you entered is not strong enough"
        }
    },
    email: {
        required: true,
        type: "string",
        pattern: /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/,
        errorMessage: {
            pattern: "The email address you provided is invalid!",
            required: "Your email is required",
            type: "Your email must be a string"
        }
    }
}

//create validation rules
createValidator(rules);

// Valid payload
test('Valid payload should return true', () => {
    const payload = {
        username: "user123",
        phone: "+2347012345678",
        password: "StrongPass123!",
        email: "user@example.com",
    };

    const validationResult = validate(payload);

    expect(validationResult).toBe(true);
});

// Invalid payload - missing required fields
test('Invalid payload with missing fields should return false and the correct error messages', () => {
    const payload = {
        username: "",
        phone: "07012345678",
        password: 123456,
        email: "userexample.com",
    };

    const validationResult = validate(payload);
    const validationErrors = getErrors();

    expect(validationResult).toBe(false);
    expect(validationErrors['test']['username']['required']).toBe("Your username is required");
    expect(validationErrors['test']['phone']['pattern']).toBe("Invalid phone number format");
    expect(validationErrors['test']['password']['ruleTitle']).toBe("The password you entered is not strong enough");
    expect(validationErrors['test']['email']['pattern']).toBe("The email address you provided is invalid!");
});

// // Edge case payload - invalid characters in username
test('Edge case payload with invalid username characters should return false and the correct error messages', () => {
    const payload = {
        username: "user_!@#",
        password: "",
        email: "",
        phone : ""
    };

    const validationResult = validate(payload);
    const validationErrors = getErrors();

    expect(validationResult).toBe(false);
    expect(validationErrors['test']['username']['ruleTitle']).toBe("Your username contains invalid characters");
    expect(validationErrors['test']['password']['required']).toBe("Your password is required");
    expect(validationErrors['test']['email']['required']).toBe("Your email is required");
    expect(validationErrors['test']['phone']['required']).toBe("Your phone number is required");
});
