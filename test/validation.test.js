// Import the functions to test
const Octavalidate = require('../index.js');

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
        phone: ""
    };

    const validationResult = validate(payload);
    const validationErrors = getErrors();

    expect(validationResult).toBe(false);
    expect(validationErrors['test']['username']['ruleTitle']).toBe("Your username contains invalid characters");
    expect(validationErrors['test']['password']['required']).toBe("Your password is required");
    expect(validationErrors['test']['email']['required']).toBe("Your email is required");
    expect(validationErrors['test']['phone']['required']).toBe("Your phone number is required");
});

describe("Length Validation: This test helps to check if the maximum, minimum and exact length of a field is correct", () => {

    it("Should return the correct error message if number of characters is more than the maxLength", () => {
        //create new instance of Octavalidate
        const octavalidate = new Octavalidate('test-maxLength')

        //destructure methods
        const { createValidator, validate, getErrors } = octavalidate

        const rules = {
            age: {
                maxLength: 2,
                required: true,
                errorMessage: {
                    maxLength: "Your age should not exceed 2 characters"
                }
            }
        };

        createValidator(rules);

        const payload = {
            age: "300"
        };

        const validationResult = validate(payload);
        const validationErrors = getErrors();

        expect(validationResult).toBe(false);

        expect(validationErrors['test-maxLength']['age']['maxLength']).toBe("Your age should not exceed 2 characters");
    })

    it("Should return the correct error message if number of characters is less than the minLength", () => {

        //create new instance of Octavalidate
        const octavalidate = new Octavalidate('test-minLength')

        //destructure methods
        const { createValidator, validate, getErrors } = octavalidate
        const rules = {
            password: {
                minLength: 8,
                required: true,
                errorMessage: {
                    minLength: "Your password should contain at least 8 characters"
                }
            }
        };

        createValidator(rules);

        const payload = {
            password: "12345"
        };

        const validationResult = validate(payload);
        const validationErrors = getErrors();

        expect(validationResult).toBe(false);
        expect(validationErrors['test-minLength']['password']['minLength']).toBe("Your password should contain at least 8 characters");
    })

    it("Should return the correct error message if number of characters is not equal to the length", () => {

        //create new instance of Octavalidate
        const octavalidate = new Octavalidate('test-length')

        //destructure methods
        const { createValidator, validate, getErrors } = octavalidate

        const rules = {
            pin: {
                length: 4,
                required: true,
                errorMessage: {
                    length: "Your PIN should be at least 4 characters"
                }
            }
        };

        createValidator(rules);

        const payload = {
            pin: "123"
        };

        const validationResult = validate(payload);
        const validationErrors = getErrors();

        expect(validationResult).toBe(false);
        expect(validationErrors['test-length']['pin']['length']).toBe("Your PIN should be at least 4 characters");
    })
})

