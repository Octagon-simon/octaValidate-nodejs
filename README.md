# Octavalidate - NodeJS V1.0.1

This NPM package helps to validate your NodeJS form fields server-side using validation rules and sophisticated regular expressions.

## OTHER RELEASES

### Octavalidate - PHP
Use the PHP release of this library to validate your forms server-side.

[Visit the repository](https://github.com/Octagon-simon/octaValidate-PHP)

### Octavalidate - JS
Use the Native JS release of this library to validate your frontend (HTML) forms. 

[Visit the repository](https://github.com/Octagon-simon/octaValidate)

## DOCUMENTATION

Visit the [DOCUMENTATION](https://octagon-simon.github.io/projects/octavalidate/nodejs/) to learn more about this GREAT Library!

## INSTALL

### NPM

```shell
$ npm install octavalidate-nodejs
```

## How to Use

### Middleware Approach

To use this package as a middleware, follow the process below

- Create a new file within your middleware folder or modify an already existing middleware.
- Import the library.
- Create a new instance of `octaValidate` and pass in the `form id` as the first argument then any configuration option as the second argument.

```javascript
//import library
const octaValidate = require('octavalidate-nodejs')

const config = {
    strictMode : true,
    strictWords : ["admin", "fake", "empty", "null"]
}

//create new instance
const validate = new octaValidate('my_form_id', config)
```
- Then define validation rules for that particular form. 

> If the form has a file upload field, then you have to define separate rules for that field.

Here's the syntax to define validation rules

```javascript
//syntax
const fieldRules = {
  FIELD_NAME : {
    RULE_TITLE : ERROR_MESSAGE
  }
}
```
Here's an example

```javascript
//define valiation rules for field names
const fieldRules = {
    email : {
        'R' : "Your Email Address is required",
        'EMAIL' : "This Email Address is invalid"
    },
    username : {
        'R' : "Your username is required",
        'USERNAME' : "Your username contains invalid characters"
    }
}
```
- Begin validation on the form fields by invoking the method `validateFields()`

The method `validateFields()` takes in 2 arguments. 
- The first argument is the validation rules on the form
- The second argument is the form fields which may be located inside `req.body`, `req.query`, or `req.params`

```javascript
module.exports = (req, res, next) => {
    //req.body contains the form fields
    //check if validation is successful
    if ( validate.validateFields(fieldRules, req.body) ) {
        //process form data here
        return res.status(200).json({
            message: "Form validation successful"
        })
    }else{
        //validation error, now return the errors
        return res.status(406).json({
            message: "Form validation failed", 
            validationErrors: validate.getErrors()
        })
    }
    //move on to the next middleware
    next()
}
```
That's it! It is that simple.

### VALIDATING AN UPLOADED FILE

Now, what if you want to validate an uploaded file, how would you achieve that?

To validate an uploaded file, invoke the `validateFiles()` method.

This method accepts 2 arguments;

- The first argument is the validation rules on the file upload
- The second argument is the file upload fields which is located in `req.files`

```javascript
//validation rules for file upload
const fileRules = {
  profile : {
    'R' : "Please upload a profile picture",
    'ACCEPT' : ["image/png", "File type is not supported"],
    'MAXSIZE' : ["5MB", "Your profile image should not be greater than 5MB"]
  }
}
module.exports = (req, res, next) => {
    //req.files contains the uploaded files using multer
    //check if file validation is successful
    if ( validate.validateFiles(fieldRules, req.files) ) {
        //process form data here
        return res.status(200).json({
            message: "Form validation successful"
        })
    }else{
        //validation error, now return the errors
        return res.status(406).json({
            message: "Form validation failed", 
            validationErrors: validate.getErrors()
        })
    }
    //move on to the next middleware
    next()
}
```

### Other Approach

In your `server file`, you can also validate your form fields by following the process below;

- Import the library
- Define validation rules for form fields
- Invoke the `validateFields()` method to begin validation

```javascript
//import library
const octaValidate = require('octavalidate-nodejs')

const config = {
    strictMode : true,
    strictWords : ["admin", "fake", "empty", "null"]
}
//create new instance
const validate = new octaValidate('my_form_id', config)

//define valiation rules for field names
const fieldRules = {
    email : {
        'R' : "Your Email Address is required",
        'EMAIL' : "This Email is invalid"
    },
    username : {
        'R' : "Your username is required",
        'USERNAME' : "Your username contains invalid characters"
    }
}

app.post('auth/register', (req, res) => {
    try{
        if ( validate.validateFiles(fieldRules, req.body) ) {
            //process form data here
            return res.status(200).json({
                message: "Form validation successful"
            })
        }else{
            //validation error, now return the errors
            return res.status(406).json({
                message: "Form validation failed", 
                validationErrors: validate.getErrors()
            })
        }
    }catch(e){
      console.log(e)
    }
})

```
The return type of `validateFields()` and `validateFiles()` is `Boolean`.

- `true` means that there are no validation errors

- `false` means that there are validation errors
   
Now if you want to return validation errors, invoke the `getErrors()` method.

## VALIDATION RULES

Here is the list of default validation rules.

- R - A value is required.
- ALPHA_ONLY - The value must be letters only! (lower-case or upper-case).
- LOWER_ALPHA - The value must be lower-case letters only.
- UPPER_ALPHA - The value must be upper-case letters only.
- ALPHA_SPACES - The value must contain letters or Spaces only!
- ALPHA_NUMERIC - The value must contain letters and numbers.
- DATE_MDY - The value must be a valid date with the format mm/dd/yyyy.
- DIGITS - The value must be valid digits or numbers. 
- PWD - The value must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters. 
- EMAIL - The value must be a valid Email Address.
- URL - The value must be a valid URL
- URL_QP - The value must be a valid URL and may contain Query parameters.
- USERNAME - The value may contain letters, numbers, a hyphen or an underscore.
- TEXT - The value may contain any of these special characters (. , / () [] & ! '' "" : ; ?)

Can't see a validation rule that you need for your form? Don't worry!

With this library, you have the power to define a custom rule and it will be processed as if it were a default rule.
  
## CUSTOM VALIDATION RULES

In some cases where you need a custom rule, use the method below to define one for your form.

```javascript
//syntax for custom rule
validationInstance.customRule(RULE_TITLE, REG_EXP, ERROR_TEXT);
```
Here's a custom rule to validate an email address.

```javascript
//custom email validation
const rule_title = "EML";
const reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//create new instance of the function
const myForm = new octaValidate('form_register');
//define the custom rule
myForm.customRule(rule_title, reg_exp);
```

Then when defining validation rules, provide the rule title ` EML `.

```javascript
const fieldRules = {
  email : {
    'EML' : "Please povide a valid Email Address"
  }
}
```
> Note: All Rule Titles are **case-sensitive!**

## MORE CUSTOM RULES

What if you want to define more validation rules?

All you need to do is to create an object with your validation rule and regular expression then invoke the `moreCustomRules()` method.

```javascript
//EMAIL AND URL VALIDATION RULES
const rules = {
    "EML": /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    "URI": /^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i
};

//create new instance of the function
const myForm = new octaValidate('form_register');
//define multiple custom rules
myForm.moreCustomRules(rules);
```
> Note: You do not need to pass in your **regular expression** as a string! This is because the *JavaScript engine* natively recognizes *regular expressions*.

## ATTRIBUTES VALIDATION

This type of validation allowes you to provide a value for the rule title. For example, If I want the user to enter just 5 characters, I will use the rule title `LENGTH` and provide `5` as its value 

Currently we have 3 categories of attributes validation:

- length validation
- EqualTo validation
- File validation
  
Validation rules under this category follows the syntax below

```javascript
//syntax
const fieldRules = {
  FIELD_NAME : {
    RULE_TITLE : [VALUE, ERROR_MESSAGE]
  }
}
```

### LENGTH VALIDATION

With the `LENGTH` validation, you can validate;  `maxlength, minlength and length` of a form field 

- maxlength (5) - This means that the value of the form field must be 5 characters or less.
- minlength (5) - This means that the value of the form field must be up to 5 characters or more.
- length (5) - This means that the value of the form field must be equal to 5 characters.

```javascript
//validate input lengths
const fieldRules = {
  password : {
    'MINLENGTH' : [8, "Your password must be 8 characters or more"]
  },
  age : {
    'DIGITS' : "Your age must be valid digits",
    'LENGTH' : [2, "Your age must be 2 digits"]
  },
  username : {
    'MAXLENGTH' : [5, "Your username must be 5 characters or more"]
  }
}

```

### EQUALTO VALIDATION

You can check if two form fields contain the same values, using the attribute `equalto`

Here's the syntax

```javascript
//syntax
const fieldRules = {
  FIELD_NAME : {
    EQUALTO : [THE_OTHER_FIELD_NAME, ERROR_MESSAGE]
  }
}
```
Here's an example

```javascript
//equalto validation
const fieldRules = {
  password : {
    'R' : "Your password is required",
    'EQUALTO' : ['confirmPassword', 'Both passwords do not match']
  }
  confirmPassword : {
    'R' : "Please re-enter your password"
  }
}
```
### FILE VALIDATION

Use the RULTE TITLE below to validate a file upload field

- accept-mime - This Rule Title allows you to list out the file MIME types allowed for upload. It supports a wildcard eg audio/\*, image/png
- size (2MB) - This means that the file uploaded must be 2MB in size
- minsize (5MB) - This means that the file uploaded must be up to 5MB or more.
- maxsize (5MB) - This means that the file uploaded must be 5MB or less.
  
Please refer to the [documentation](https://octagon-simon.github.io/projects/octavalidate/nodejs/file.html) to learn more about file validation.

## API METHODS

### validateFields

Invoke the `validateFields()` method to begin validation on the form fields.

```javascript
//Your validation instance
const myForm = new octaValidate('form_register');
//begin validation
myForm.validateFields(RULES, FORM_FIELDS);
```
### validateFiles

Invoke the `validateFiles()` method to begin valiation on uploaded files.

```javascript
//Your validation instance
const myForm = new octaValidate('form_register');
//begin validation
myForm.validateFiles(RULES, FILE_FIELDS);
```

There are more methods in the [documentation](https://octagon-simon.github.io/projects/octavalidate/nodejs).

## CONFIGURATION

We have 3 configuration options:

- strictMode: <code>Boolean</code>
  
  This option removes extra white space from the start and at the end of a form input and also prevents the user from providing reserved keywords as values. Default value is `false`.
- strictWords: <code>Array</code>
  
   This option alows you to provide words that users are not supposed to submit. For eg ["null", "error", "false", "fake", "admin"]. In order to use this option, you must set `strictMode` to `true`.

To use any of these options, provide it as an object and pass it as the second argument when creating an instance of octaValidate.

```javascript
//config options
const options = {
  strictMode : true, 
  strictWords : ["error", "false", "invalid", "fake", "admin"]
}
//my function instance
const myForm = new octaValidate('FORM_ID', options);
```

## REFERENCE METHODS
After creating a new instance of the function, the methods below becomes available for use.

```javascript
//create instance of the function
const myForm = new octaValidate('FORM_ID');
```

- `validateFields()`
  
  Invoke this method to begin validation on form fields

- `validateFiles()`
  
  Invoke this method to begin validation on uploaded files

- `getErrors()` 
  
  Invoke this method to return the validation errors on a form
- `form()` 
  
  This method returns the form ID.
- `customRule(RULE_TITLE, REG_EXP, ERROR_TEXT)`
  
   Invoke this method to define your custom validation rule.
- `moreCustomRules(RULES)`
  
    Invoke this method to define more custom validation rules.
- `version()`
  
  Invoke this method to retrieve the library's version number.
  
> There are more methods than the ones listed above, Please refer to the [documentation](https://octagon-simon.github.io/projects/octavalidate/api.html) to learn more.

## DEMO
> We are not limiting this library for API use only! You can also use this library to validate your form data, both form inputs and file uploads.


Navigate to the `/demo` folder and CD into it

```
$ cd demo
``` 
Then run the command below to install express

```
$ npm i express
```
Once express has been installed, fire up the server by running the command below on your terminal.

```
$ node demo.js
```

Now, call the APIs below with any API client of your choice using a POST method and pass in the data associated to it

The goal of this demo APIs is for you to run validation tests on the data. You can provide an invalid email address, invalid username etc just to break through.

Registration API `http://localhost:5000/register`

Sample Data
```json
{
    "email" : "test@gmail.com",
    "uname" : "simon",
    "pass" : "12345678",
    "conpass" : "12345678"
}
```

Login API `http://localhost:5000/register`

Sample Data

```json
{
    "email" : "test@gmail.com",
    "pass" : "12345678"
}
```

## Author

[Simon Ugorji](https://twitter.com/ugorji_simon)

## Support Me

[Donate with PayPal](https://www.paypal.com/donate/?hosted_button_id=ZYK9PQ8UFRTA4)

[Buy me a coffee](https://buymeacoffee.com/simon.ugorji)

## Contributors

These are the amazing developers that contributed to the development of this **GREAT** project

- [Kiisi Felix](https://github.com/kiisi)
- [Melody Oluoma](https://github.com/oma189)