# Octavalidate-NodeJS

This is a developer-friendly package that helps to validate a JSON payload using validation rules and sophisticated regular expressions. You can use this package to validate a form submission via any HTTP method.

## 🧪 INSTALLATION

```shell
$ npm install octavalidate-nodejs
```

## ✅ HOW TO USE

The following code below shows how you can use this package to validate your form.

You can validate both files and non-file objects

> ⚠️ This library only supports validation on `JSON` payloads

### OVERVIEW

```javascript
//import library
const Octavalidate = require("octavalidate-nodejs");

//create new validation instance
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");

//get validation methods
const { createValidator, validate, getError, getErrors } = octavalidate;

//define validation rules
const validationRules = {
  username: {
    required: true,
    type: "string",
    ruleTitle: "userName",
  },
};

//create validation rules
createValidator(validationRules);

//validate your JSON payload
//true means validation passed
//false means validation failed
const validationResponse = validate(req.body);

//return single error
console.log(getError());
//return all errors
console.log(getErrors());
```

Here's a step-by-step process on how you can validate your form with Octavalidate.

### Import and Initialize The Library

```javascript
//import library
const Octavalidate = require("octavalidate-nodejs");

//create new validation instance
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");
```

### Add Configuration Options

We have 2 configuration options:

- strictMode: <code>Boolean</code>

  This option is used in conjuction with some validation rule types to effect a strict validation test on the payload. For example, when this option is set to `true`, the rule type `matches` will become case-sensitive and the `prohibitedWords` flag will prevent some phrases from being submitted.
This means that if any phrase is found in your payload, be it `username`, `password`, etc, validation will fail and the user is instructed to remove or replace the phrase.

- strictWords: <code>Array</code>

  This option alows you to provide words that users are not supposed to submit. For eg ["null", "error", "false", "fake", "admin"]. In order to use this option, you must set `strictMode` to `true`.

To use any of these options, provide it as an object and pass it as the second argument when creating an instance of Octavalidate.

```javascript
//create new validation instance
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER", {
  strictMode: true, //false by default
  prohibitedWords: ["fake", "admin", "user", "super"], //any traces of these phrases will not be allowed in the payload
});
```

### Define and Assign Validation Rules

Before instructing the library to validate your form, you must define a validation rule for each field. Creating validation rules is very simple and straightforward. Consider the following example;

```javascript
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");

//get validation methods
const { createValidator } = octavalidate;

//define validation rules
const validationRules = {
  username: {
    required: true,
    type: "string",
  },
  age: {
    required: true,
    type: "number",
    length: 2,
  },
  maritalStatus: {
    required: true,
    type: "string",
    matches: ["single", "married", "divorced"], //this will become case-sensitive if strictMode is set to true
  },
};

//assign validation rules
createValidator(validationRules);
```

In the example above, the validation rules for the `username` & `age` fields reads;

- Your username is required and must be a string
- Your age is required and must be a number
- Your maritalStatus is required and must match single, married or divorced

> So you can try to provide a username and age that fails the validation rule and watch the results.

Below you can find all a list of supported validation rule types and their use cases.

| Rule Type    | Usage                                                                                                         | Data Type       |
| ------------ | ------------------------------------------------------------------------------------------------------------- | --------------- |
| type         | Specifies the data type of the input (e.g., string, number, boolean, file).                                   | string          |
| required     | Indicates that the field is mandatory and cannot be left blank.                                               | boolean         |
| length       | Specifies the exact number of characters allowed in the field.                                                | number          |
| minLength    | Specifies the minimum number of characters allowed in the field.                                              | number          |
| maxLength    | Specifies the maximum number of characters allowed in the field.                                              | number          |
| ruleTitle    | Specifies an inbuilt regular expression that can be used to validate a field. [Read more](#using-rule-titles) | string          |
| pattern      | A regular expression that the field must match to be considered valid.                                        | string (RegExp) |
| matches      | Ensures the value of a field matches a set of words or phrases. It becomes case-sensitive if `strictMode` is enabled.                                         | array []        |
| errorMessage | A custom message displayed when the validation rule is not met. [Read more](#adding-error-messages)           | object {}       |

### Use Rule Titles

Rule titles are inbuilt regular expressions that can be used to validate a field. For example, you can use this to validate email addresses, URLs, uppercase letters, lowercase letters, etc

```javascript
const validationRules = {
  gender: {
    required: true,
    type: "string",
    ruleTitle: "lowerAlpha", //this will check against lowercase letters
  },
  orderId: {
    required: true,
    type: "string",
    ruleTitle: "alphaNumeric", //this will check against letters and numbers
  },
};
```

Below you can find a list of inbuilt regular expressions and their use cases.

| Rule Title     | Usage                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| alphaOnly      | Validates that the input contains only alphabetic characters (A-Z, a-z).                                                                             |
| alphaNumeric   | Validates that the input contains only alphabetic and numeric characters (A-Z, a-z, 0-9).                                                            |
| lowerAlpha     | Validates that the input contains only lowercase alphabetic characters (a-z).                                                                        |
| upperAlpha     | Validates that the input contains only uppercase alphabetic characters (A-Z).                                                                        |
| url            | Validates that the input is a properly formatted URL.                                                                                                |
| strongPassword | Validates that the input meets the criteria for a strong password (e.g., includes uppercase and lowercase letters, numbers, and special characters). |
| generalText    | Validates that the input is a general text, allowing a wide range of characters including punctuation.                                               |
| alphaSpaces    | Validates that the input contains only alphabetic characters and spaces.                                                                             |
| email          | Validates that the input is a properly formatted email address.                                                                                      |
| userName       | Validates that the input is a properly formatted username (typically alphanumeric and may include underscores or hyphens).                           |

### Use Regular Expressions

Now, if you have a custom regular expression you would like to use for a field, you can provide it as `pattern` to the validation rule. Here's an example of a regular expression that I could use to validate a Nigerian phone number.

```javascript
const validationRules = {
  phone: {
    required: true,
    type: "string",
    pattern: /^\+234[789]\d{9}$/,
  },
};
```

With the validation rule above, if the value of your payload does not match the pattern, the validation will fail and an error will be returned.

> ⚠️ You do not need to pass in your **regular expression** as a string. This is because the **JavaScript engine** natively recognizes **regular expressions**.

### Add Error Messages

How boring would a validation error be withour a user friendly error message? With this package, you can add a custom error message to every validation rule. Here's an example of how you can add a custom error message to your validation rules.

```javascript
const validationRules = {
  phone: {
    required: true,
    type: "string",
    pattern: /^\+234[789]\d{9}$/,
    errorMessage: {
      required: "Your phone number is required",
      type: "Your phone number must be valid digits",
      pattern: "The phone number you provided is not a valid Nigerian number",
    },
  },
};
```

### Validate a payload

To successfully validate a payload, please make sure you have defined and assigned validation rules to the `createValidator` method. Then you have to assign the payload to validate to the `validate` method.

> ⚠️ If you do not provide any validation rule, the response of the `validate` method would be `true` which means that the payload passed the validation.

Consider the example below;

```javascript
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");

//get validation methods
const { createValidator, validate } = octavalidate;

//define validation rules
const validationRules = {
  username: {
    required: true,
    type: "string",
  },
  age: {
    required: true,
    type: "number",
    length: 2,
  },
  maritalStatus: {
    required: true,
    type: "string",
    matches: ["single", "married", "divorced"],
  },
};

//assign validation rules
createValidator(validationRules);

//validate the payload
const validationResult = validate(req.body); //perform validation on request body
//true means validation passed successfully
//false means validation failed, in such case, please call the `getError` or `getErrors` method
```

> You can also try to validate `req.query`, `req.file` and `req.files` so long as the format is in JSON.

### Validate Uploaded Files

You can also use Octavalidate to validate uploaded files and check if the user uploaded;

- An actual file
- A valid file
- A minimum upload size
- A maximum upload size
- A specific upload size

Before you can validate a file, you need to make sure that the validation rule specified for the form field has the type `file` only this can the script recognize that you are trying to validate an uploaded file.

```javascript
const validationRules = {
  profile: {
    type: "file", //use this to inform octavalidate that this field (profile) is a file
    required: true,
    errorMessage: {
      required: "Your profile picture is required",
    },
  },
};
```

Now depending on the package being used to handle file uploads, please make sure to pass in the appropriate payload to the validation function for the script to validate the file upload properly.

> The example below was tested to work well with `multer`. If you use a different package, you can try it out or open a PR so we try to support it as well 🙂

```javascript
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");
const { createValidator, validate } = octavalidate;

const validationRules = {
  username: {
    type: "string",
    required: true,
    errorMessage: {
      required: "Your username is required",
    },
  },
  profile: {
    type: "file",
    required: true,
    errorMessage: {
      required: "Your profile picture is required",
    },
  },
  certificates: {
    type: "file",
    required: true,
    errorMessage: {
      required: "Your certificates are required",
    },
  },
};

createValidator(validationRules); //create validation rules

validate({
  ...req.body, //destructure request body
  profile: req.file, //assign the file property from multer to `profile` so it matches your validation rule
});

//In the case where you have multiple files assigned to a single input, you can do this
validate({
  ...req.body, //destructure request body
  certificates: req.files, //assign the files property from multer to `certificates` so it matches your validation rule
});
```

Easy right? Below you will find some of the validation rule types that can be used to validate a file and their use cases.

| Rule Type     | Usage                                                                                                        | Data Type |
| ------------- | ------------------------------------------------------------------------------------------------------------ | --------- |
| type          | Specifies the data type of the input (e.g., string, number, boolean). The value itself **must** be a string. | string    |
| required      | Indicates that the field is mandatory and cannot be left blank.                                              | boolean   |
| mimeType      | Specifies the allowed MIME types for the file (e.g., image/jpeg, application/pdf).                           | string    |
| fileSize      | Specifies the exact file size allowed. Eg; 1KB, 10MB, 20GB, 30TB, 40PB.                                      | string    |
| minFileSize   | Specifies the minimum file size allowed. Eg; 1KB, 10MB, 20GB, 30TB, 40PB.                                    | string    |
| maxFileSize   | Specifies the maximum file size allowed. Eg; 1KB, 10MB, 20GB, 30TB, 40PB.                                    | string    |
| numOfFiles    | Specifies the exact number of files allowed.                                                                 | number    |
| minNumOfFiles | Specifies the minimum number of files allowed.                                                               | number    |
| maxNumOfFiles | Specifies the maximum number of files allowed.                                                               | number    |

### Return Errors

There are 2 methods that can be used to return validation errors. You can call the `getError` method to return a single error or you can call `getErrors` to return a list of errors.

```javascript
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");
const { createValidator, validate, getError, getErrors } = octavalidate;

const validationRules = {
  username: {
    type: "string",
    required: true,
    errorMessage: {
      required: "Your username is required"
    }
  }
};

createValidator(validationRules); //create validation rules

validate(req.body); //validate the request body

console.log(getError()) //return a single error

console.log(getErrors()) //return a list of errors
```

## REFERENCE METHODS

After creating a new instance of the function, the methods below becomes available for use.

```javascript
//create instance 
const octavalidate = new Octavalidate("ROUTE_IDENTIFIER");
```

- `createValidator()`

  Invoke this method to assign validation rules to the script

- `validate()`

  Invoke this method to begin validation on the payload

- `getErrors()`

  Invoke this method to return a list of validation errors

- `getError()`

  Invoke this method to return a single validation error

## TESTING 

To ensure that the library is working correctly and all functionalities are properly implemented, you should run the test suite.

### Prerequisites

Before running the tests, make sure you have installed all the necessary dependencies. If you haven't done so yet, install the development dependencies by running:

```sh
$ npm install
```

Once the dependencies have been installed, run the following command and it will execute the test cases in `test/` directory

```sh
$ npm test
```

## Author

[Follow me on LinkedIn </> @Simon Ugorji](https://www.linkedin.com/in/simon-ugorji-57a6a41a3/)

## Support Me

Just star the repository 🙂