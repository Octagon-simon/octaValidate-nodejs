const {
    alphaOnlyRegExp,
    alphaNumericRegExp,
    lowerAlphaRegExp,
    upperAlphaRegExp,
    urlRegExp,
    strongPasswordRegExp,
    generalTextRegExp,
    alphaSpacesRegExp,
    emailRegExp,
    userNameRegExp,
} = require("./modules/regexp.js");
class Octavalidate {
    #prohibitedWords = ["null", "undefined", "empty"];
    #defaultRuleTitles = [
        "userName",
        "alphaOnly",
        "alphaNumeric",
        "lowerAlpha",
        "upperAlpha",
        "urlQP",
        "url",
        "strongPassword",
        "generalText",
        "alphaSpaces",
        "email",
    ];
    #defaultNonFileRuleTypes = [
        "type",
        "required",
        "length",
        "minLength",
        "maxLength",
        "ruleTitle",
        "pattern",
        "matches",
        "errorMessage",
    ];
    #defaultFileRuleTypes = [
        "type",
        "required",
        "mimeType",
        "fileSize",
        "minFileSize",
        "maxFileSize",
        "numOfFiles",
        "minNumOfFiles",
        "maxNumOfFiles",
    ];
    #strictMode = false;
    #routeIdentifier = "";
    #errors = {};
    #nonFileValidationRules = {};
    #fileValidationRules = {};

    constructor(
        routeIdentifier = undefined,
        opts = { strictMode: false, prohibitedWords: [] }
    ) {
        if (typeof routeIdentifier !== "string" && routeIdentifier?.trim() === "") {
            throw new Error(
                "You must provide a valid routeIdentifier during initialization, please see the documentation"
            );
        }
        this.#routeIdentifier = routeIdentifier;
        if (
            typeof opts.strictMode !== "undefined" &&
            opts.strictMode !== "boolean"
        ) {
            this.#strictMode = opts.strictMode;
        }
        if (typeof opts.prohibitedWords !== "undefined") {
            this.#prohibitedWords.push(...opts.prohibitedWords);
        }
    }

    ///-----------------------------------------------
    // Utility functions

    //check if data is of type object
    #isObject = (obj) =>
        Object.prototype.toString.call(obj) === "[object Object]";

    //check if data is of type array
    #isArray = (ary) => Object.prototype.toString.call(ary) === "[object Array]";

    /**
     * Utility method to check if a value is considered empty.
     * @param {any} value - The value to check.
     * @returns {boolean} - Returns true if the field is empty, false otherwise.
     */
    #isEmpty = (value) => {
        if (value === null || value === undefined) {
            return true;
        }
        if (typeof value === "string") {
            return value.toString().trim() === "";
        }
        if (this.#isArray(value)) {
            return value.length === 0;
        }
        if (this.#isObject(value)) {
            return Object.keys(value).length === 0;
        }
        if (typeof value === "boolean") {
            return false; // Booleans are never empty
        }
        if (typeof value === "number") {
            return false; // Numbers are never empty
        }
        return false; // Other types (symbols, functions, etc.) are not considered empty
    };

    /**
     * This method checks whether a particular field has specified its error message and then tries to retrieve it
     * @param {*} fieldName
     * @param {*} ruleType
     * @returns
     */
    #getFieldErrorMessage = ({ fieldName, ruleType }) => {
        if (this.#isEmpty(fieldName) || this.#isEmpty(ruleType)) return undefined;
        //get all validation rules
        const allValidationRules = {
            ...this.#nonFileValidationRules,
            ...this.#fileValidationRules,
        };

        return (
            allValidationRules[fieldName]?.["errorMessage"]?.[ruleType] || undefined
        );
    };

    /**
     * This method appends an error into the validation error object
     * @param {*} param0
     */
    #addError = ({ fieldName, ruleType, errorMsg }) => {
        //append into error object
        this.#errors[this.#routeIdentifier] =
            this.#errors[this.#routeIdentifier] || {};
        //create rule in error object
        this.#errors[this.#routeIdentifier][fieldName] = {
            ...this.#errors[this.#routeIdentifier]?.[fieldName],
            [ruleType]: errorMsg,
        };
    };

    /**
     * This method removes a validation error from the error object
     * @param {*} param0
     */
    #removeError = ({ fieldName, ruleType }) => {
        //check if error key exists
        if (typeof this.#errors[this.#routeIdentifier] !== "undefined")
            //then remove
            delete this.#errors[this.#routeIdentifier]?.[fieldName]?.[ruleType];
    };

    /**
     * This method helps to convert a given file size to bytes
     * @param {*} size
     * @returns number
     */
    #sizeInBytes = (size) => {
        const prevSize = size;
        //convert to lowercase
        size = size.toLowerCase().replace(/\s/g, "");
        //check size
        if (/[0-9]+(bytes|kb|mb|gb|tb|pb)+$/i.test(size) === false) {
            throw new Error(
                `The size ${prevSize} you provided is Invalid. Please check for typos or make sure that you are providing a size from bytes up to Petabytes`
            );
        }
        //get the number
        const sizeNum = Number(
            size
                .split("")
                .map((sn) => {
                    return !isNaN(sn) ? sn : "";
                })
                .join("")
        );
        //get the digital storage extension
        const sizeExt = (() => {
            const res = size
                .split("")
                .map((s) => {
                    return isNaN(s);
                })
                .indexOf(true);
            return res !== -1 ? size.substring(res) : "";
        })();
        /**
         * 1KB = 1024 bytes
         * 1PB = 1024 bytes ^ 5 [I stopped here. Add yours by contributing to the package]
         */
        switch (sizeExt) {
            case "bytes":
                return Number(sizeNum);
            case "kb":
                return Number(sizeNum * 1024);
            case "mb":
                return Number(sizeNum * 1024 * 1024);
            case "gb":
                return Number(sizeNum * 1024 * 1024 * 1024);
            case "tb":
                return Number(sizeNum * 1024 * 1024 * 1024 * 1024);
            case "pb":
                return Number(sizeNum * 1024 * 1024 * 1024 * 1024 * 1024);
            default:
                return 0;
        }
    };

    /**
     * This method returns a bunch of child functions that help to handle validation on a non file field
     * @returns object
     */
    #nonFileValidationHandlers = () => {
        //handle validation for default rule titles
        const handleRuleTitleValidation = ({
            fieldName,
            fieldValue,
            ruleType,
            ruleTypeValue,
        }) => {
            if (ruleType !== "ruleTitle") return;

            //get all ruleTitles
            const allRuleTitles = this.#defaultRuleTitles;

            //check if the field's ruleTitle is valid
            if (!allRuleTitles.includes(ruleTypeValue)) return;

            const validateField = (regExpResponse, defaultErrorMessage) => {
                if (this.#isEmpty(fieldValue) === false && regExpResponse === false) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        defaultErrorMessage;

                    this.#addError({ fieldName, ruleType, errorMsg });
                } else {
                    this.#removeError({ fieldName, ruleType });
                }
            };

            switch (ruleTypeValue) {
                case "userName":
                    validateField(
                        userNameRegExp(fieldValue),
                        "Your username contains invalid characters"
                    );
                    break;

                case "alphaOnly":
                    validateField(
                        alphaOnlyRegExp(fieldValue),
                        "Only letters are allowed"
                    );
                    break;

                case "alphaNumeric":
                    validateField(
                        alphaNumericRegExp(fieldValue),
                        "Only letters and numbers are allowed"
                    );
                    break;

                case "lowerAlpha":
                    validateField(
                        lowerAlphaRegExp(fieldValue),
                        "Only lowercase letters are allowed"
                    );
                    break;

                case "upperAlpha":
                    validateField(
                        upperAlphaRegExp(fieldValue),
                        "Only uppercase letters are allowed"
                    );
                    break;

                case "alphaSpaces":
                    validateField(
                        alphaSpacesRegExp(fieldValue),
                        "Only letters and white spaces are allowed"
                    );
                    break;

                case "email":
                    validateField(
                        emailRegExp(fieldValue),
                        "This email address is invalid"
                    );
                    break;

                case "strongPassword":
                    validateField(
                        strongPasswordRegExp(fieldValue),
                        "The password you entered is not strong enough"
                    );
                    break;

                case "generalText":
                    validateField(
                        generalTextRegExp(fieldValue),
                        "This text contains invalid characters"
                    );
                    break;

                case "url":
                    validateField(urlRegExp(fieldValue), "This URL is invalid");
                    break;

                default:
                    break;
            }
        };

        //handle validation for length of fields
        const handlelengthValidation = ({
            fieldName,
            fieldValue,
            ruleType,
            ruleTypeValue,
        }) => {
            //check if lengthType: ruleType is valid
            if (!["length", "minLength", "maxLength"].includes(ruleType)) return;

            //value must be a number
            if (typeof ruleTypeValue !== "number")
                throw new Error(
                    `OCTAVALIDATION ERROR: The value of ${ruleType} must be a number`
                );

            const validateField = (validationResponse, defaultErrorMessage) => {
                if (
                    this.#isEmpty(fieldValue) === false &&
                    !validationResponse === false
                ) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        defaultErrorMessage;

                    this.#addError({ fieldName, ruleType, errorMsg });
                } else {
                    this.#removeError({ fieldName, ruleType });
                }
            };

            switch (ruleType) {
                case "length":
                    validateField(
                        fieldValue?.length !== ruleTypeValue,
                        `The value of this field must be ${ruleTypeValue} characters`
                    );
                    break;

                case "minLength":
                    validateField(
                        fieldValue?.length < ruleTypeValue,
                        `The value of this field must be at least ${ruleTypeValue} characters long`
                    );
                    break;

                case "maxLength":
                    validateField(
                        fieldValue?.length > ruleTypeValue,
                        `The value of this field must be not more than ${ruleTypeValue} characters long`
                    );
                    break;

                default:
                    break;
            }
        };

        //handle validation for type of fields
        const handleTypeValidation = ({
            fieldName,
            fieldValue,
            ruleType,
            ruleTypeValue,
        }) => {
            //convert value to string
            const ruleTypeValueConverted = ruleTypeValue?.toString();

            //check if property is valid for this utility function
            if (ruleType !== "type") return;

            const validateField = (validationResponse, defaultErrorMessage) => {
                if (
                    this.#isEmpty(fieldValue) === false &&
                    validationResponse === false
                ) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        defaultErrorMessage;
                    this.#addError({ fieldName, ruleType, errorMsg });
                } else {
                    this.#removeError({ fieldName, ruleType });
                }
            };

            switch (ruleTypeValueConverted) {
                case "string":
                    validateField(
                        typeof fieldValue === "string",
                        `The value of this field must be a string`
                    );
                    break;
                case "boolean":
                    validateField(
                        fieldValue === "true" || fieldValue === "false",
                        `The value of this field must be a boolean`
                    );
                    break;
                case "number":
                    validateField(
                        typeof fieldValue === "number",
                        `The value of this field must be a number`
                    );
                    break;
                default:
                    break;
            }
        };

        //handle validation for matches of fields
        const handleMatchesValidation = ({
            fieldName,
            fieldValue,
            ruleType,
            ruleTypeValue,
        }) => {
            //check if property is valid for this utility function
            if (
                ruleType !== "matches" ||
                !this.#isArray(ruleTypeValue) ||
                ruleTypeValue.length !== 0
            )
                return;

            const doStrict = this.#strictMode;

            switch (doStrict) {
                case true:
                    //perform case sensitive check
                    if (
                        this.#isEmpty(fieldValue) === false &&
                        ruleTypeValue.includes(fieldValue) === false
                    ) {
                        const errorMsg =
                            this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                            `The value of this field must match ${ruleTypeValue}`;
                        this.#addError({ fieldName, ruleType, errorMsg });
                    } else {
                        this.#removeError({ fieldName, ruleType });
                    }
                    break;
                case false:
                    //perform case insensitive check
                    const lowercasedMatches = ruleTypeValue.map((item) =>
                        item?.toString()?.toLowerCase()
                    );
                    const lowercasedValue = fieldValue?.toString()?.toLowerCase();

                    if (
                        this.#isEmpty(fieldValue) === false &&
                        lowercasedMatches.includes(lowercasedValue) === false
                    ) {
                        const errorMsg =
                            this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                            `The value of this field must match [${ruleTypeValue}]`;
                        this.#addError({ fieldName, ruleType, errorMsg });
                    } else {
                        this.#removeError({ fieldName, ruleType });
                    }
                    break;
                default:
                    break;
            }
        };

        return {
            handleRuleTitleValidation,
            handlelengthValidation,
            handleTypeValidation,
            handleMatchesValidation,
        };
    };

    /**
     * This method returns a bunch of child functions that help to handle validation on a file field
     * @returns object
     */
    #fileValidationHandlers = () => {
        //hanlde validation for number of files uploaded
        const handleFileLengthValidation = ({
            fieldName,
            numOfFiles,
            ruleType,
            ruleTypeValue,
        }) => {
            //check if ruleType is valid
            if (!["numOfFiles", "minNumOfFiles", "maxNumOfFiles"].includes(ruleType))
                return;

            numOfFiles = Number(numOfFiles);

            //value must be a number
            if (typeof ruleTypeValue !== "number")
                throw new Error(
                    `OCTAVALIDATION ERROR: The value of ${ruleType} must be a number`
                );

            const validateField = (validationResponse, defaultErrorMessage) => {
                if (!validationResponse === false) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        defaultErrorMessage;

                    this.#addError({ fieldName, ruleType, errorMsg });
                } else {
                    this.#removeError({ fieldName, ruleType });
                }
            };

            switch (ruleType) {
                case "numOfFiles":
                    validateField(
                        numOfFiles !== ruleTypeValue,
                        `You must upload ${ruleTypeValue} files`
                    );
                    break;

                case "minNumOfFiles":
                    validateField(
                        numOfFiles < ruleTypeValue,
                        `You must upload at least ${ruleTypeValue} files`
                    );
                    break;

                case "maxNumOfFiles":
                    validateField(
                        numOfFiles > ruleTypeValue,
                        `You must not upload more than ${ruleTypeValue} files`
                    );
                    break;

                default:
                    break;
            }
        };

        //handle validation for size of files uploaded
        const handleFileSizeValidation = ({
            fieldName,
            fieldValue, //could be an array or an object depending on the number of files uploaded
            numOfFiles,
            ruleType,
            ruleTypeValue,
        }) => {
            //get the file size of the validation rule in bytes

            //check if ruleType is valid
            if (!["fileSize", "minFileSize", "maxFileSize"].includes(ruleType))
                return;

            const validateFileSize = this.#sizeInBytes(ruleTypeValue);

            const validateField = (validationResponse, defaultErrorMessage) => {
                if (validationResponse === false) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        defaultErrorMessage;
                    this.#addError({ fieldName, ruleType, errorMsg });
                } else {
                    this.#removeError({ fieldName, ruleType });
                }
            };

            switch (ruleType) {
                case "fileSize":
                    //if we are dealing with 1 file
                    if (numOfFiles === 1) {
                        validateField(
                            Number(fieldValue["size"]) === validateFileSize,
                            `The size of this file must be equal to ${ruleTypeValue}`
                        );
                    } else if (numOfFiles > 1 && fieldValue?.length) {
                        //multiple files [{'name' : 'me.png'}, {'name' : 'you.png'}]
                        let ind = 0;

                        //loop through array of objects
                        while (ind < fieldValue.length) {
                            const file = fieldValue[ind];

                            validateField(
                                Number(file["size"]) === validateFileSize,
                                `The size of this file must be equal to ${ruleTypeValue}`
                            );

                            ind++;
                        }
                    }

                    break;
                case "minFileSize":
                    //if we are dealing with 1 file
                    if (numOfFiles === 1) {
                        validateField(
                            !(Number(fieldValue["size"]) < validateFileSize),
                            `The size of this file must be at least ${ruleTypeValue}`
                        );
                    } else if (numOfFiles > 1 && fieldValue?.length) {
                        //multiple files [{'name' : 'me.png'}, {'name' : 'you.png'}]
                        let ind = 0;

                        //loop through array of objects
                        while (ind < fieldValue.length) {
                            const file = fieldValue[ind];

                            validateField(
                                !(Number(file["size"]) <
                                    validateFileSize)`The size of this file must be at least ${ruleTypeValue}`
                            );

                            ind++;
                        }
                    }

                    break;

                case "maxFileSize":
                    //if we are dealing with 1 file
                    if (numOfFiles === 1) {
                        validateField(
                            !(Number(fieldValue["size"]) > validateFileSize),
                            `The size of this file must be at most ${ruleTypeValue}`
                        );
                    } else if (numOfFiles > 1 && fieldValue?.length) {
                        //multiple files [{'name' : 'me.png'}, {'name' : 'you.png'}]
                        let ind = 0;

                        //loop through array of objects
                        while (ind < fieldValue.length) {
                            const file = fieldValue[ind];

                            validateField(
                                !(Number(file["size"]) > validateFileSize),
                                `The size of this file must be at most ${ruleTypeValue}`
                            );

                            ind++;
                        }
                    }
                    break;
                default:
                    break;
            }
        };

        //handle validation for mimeType of files uploaded
        const handleMimeTypeValidation = ({
            fieldName,
            fieldValue,
            numOfFiles,
            ruleType,
            ruleTypeValue,
        }) => {
            //check if property is valid for this utility function
            if (ruleType !== "mimeType" || this.#isEmpty(ruleTypeValue) === true)
                return;

            const validateFileMime = ruleTypeValue
                .replace(/\s/g, "")
                .split(",")
                .map((m) => {
                    return m.toLowerCase();
                });

            if (numOfFiles === 1) {
                //perform mime-type check
                if (
                    !validateFileMime.includes(fieldValue["mimetype"]) &&
                    !validateFileMime.includes(
                        fieldValue["mimetype"].split(
                            fieldValue["mimetype"].substr(fieldValue["mimetype"].indexOf("/"))
                        )[0] + "/*"
                    )
                ) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        `This file type does not match ${ruleTypeValue}`;
                    this.#addError({ fieldName, ruleType, errorMsg });
                } else {
                    this.#removeError({ fieldName, ruleType });
                }
            } else if (numOfFiles > 1 && fieldValue?.length) {
                //multiple files [{'name' : 'me.png'}, {'name' : 'you.png'}]
                let ind = 0;

                //loop through array of objects
                while (ind < fieldValue.length) {
                    const file = fieldValue[ind];

                    //perform mime-type check
                    if (
                        !validateFileMime.includes(file["mimetype"]) &&
                        !validateFileMime.includes(
                            file["mimetype"].split(
                                file["mimetype"].substr(file["mimetype"].indexOf("/"))
                            )[0] + "/*"
                        )
                    ) {
                        const errorMsg =
                            this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                            `This file type does not match ${ruleTypeValue}`;
                        this.#addError({ fieldName, ruleType, errorMsg });
                    } else {
                        this.#removeError({ fieldName, ruleType });
                    }

                    ind++;
                }
            }
        };

        return {
            handleFileSizeValidation,
            handleFileLengthValidation,
            handleMimeTypeValidation,
        };
    };

    /**
     * This method is used to create the validation rules that would be used against the payload. Please note that you must create the validation rules before you attempt to validate the payload
     * ```javascript
     * //create new instance
     * const octavalidate = new Octavalidate('signup')
     * //destructure methods
     * const { createValidator } = octavalidate
     * //define validation rules
     * const validationRules = {
     *     username : {
     *         required : true,
     *         type : "string",
     *         ruleTitle : "userName"
     *     }
     * }
     * //create validation rules
     * createValidator(validationRules)
     *
     * ```
     * @param {*} rules
     */
    createValidator = (rules) => {
        //check if rules object is empty
        if (!this.#isObject(rules) || !Object.keys(rules).length) {
            throw new Error("OCTAVALIDATE ERROR: Validation rules must not be empty");
        }

        //check if rule properties are valid
        for (const fieldName in rules) {
            //check if the particular rule has a {type: "file"} property
            const isAFile =
                Object.keys(rules[fieldName]).includes("type") &&
                rules[fieldName]["type"] === "file";

            for (const rule in rules[fieldName]) {
                //get the value of the validation rule
                const ruleValue = rules[fieldName][rule];

                //prevent non-existing rules
                if (
                    this.#defaultNonFileRuleTypes.includes(rule) === false &&
                    this.#defaultFileRuleTypes.includes(rule) === false
                ) {
                    throw new Error(
                        `OCTAVALIDATE ERROR: This rule ${rule} is nonexistent, please see the documentation`
                    );
                }

                //check if value is undefined
                if (typeof ruleValue === "undefined") {
                    throw new Error(
                        `OCTAVALIDATE ERROR: This rule ${rule} is undefined, please see the documentation`
                    );
                }
            }

            //check if rule is of type file or not
            if (isAFile) {
                this.#fileValidationRules = {
                    ...this.#fileValidationRules,
                    [fieldName]: { ...rules[fieldName] },
                };
            } else {
                this.#nonFileValidationRules = {
                    ...this.#nonFileValidationRules,
                    [fieldName]: { ...rules[fieldName] },
                };
            }
        }

        return true;
    };

    /**
     * This method is used to validate the payload.
     * ```javascript
     * //create new instance
     * const octavalidate = new Octavalidate('signup')
     * //destructure methods
     * const { createValidator, validate } = octavalidate
     * //define validation rules
     * const validationRules = {
     *     username : {
     *         required : true,
     *         type : "string",
     *         ruleTitle : "userName"
     *     }
     * }
     *
     * //create validation rules
     * createValidator(validationRules)
     *
     * //true means validation passed
     * //false means validation failed
     * const validationResponse = validate(req.body);
     *
     * if(validationResponse === true){
     *     //continue here
     * }else{
     *     //return validation error
     * }
     *
     * ```
     * @param {*} rules
     */
    validate = (payload) => {
        //get validation rules
        const nonFileValRules = this.#nonFileValidationRules;
        const fileValRules = this.#fileValidationRules;

        //reassign payload
        payload = Object.assign({}, payload);

        //get the non file validators
        const {
            handleMatchesValidation,
            handleRuleTitleValidation,
            handleTypeValidation,
            handlelengthValidation,
        } = this.#nonFileValidationHandlers();

        //get the file validators
        const {
            handleFileLengthValidation,
            handleFileSizeValidation,
            handleMimeTypeValidation,
        } = this.#fileValidationHandlers();

        //check if payload is a valid object
        // || (!Object.keys(payload).length)
        if (this.#isObject(payload) === false) {
            throw new Error(
                'OCTAVALIDATE ERROR: Payload to validate must be a valid object. For example; { fullName : "Simon Ugorji" }'
            );
        }

        //loop through fieldname in the non fileValidation rules
        for (const fieldName in nonFileValRules) {
            //check if field name exists in payload
            if (typeof payload[fieldName] === "undefined") {
                this.#addError({
                    fieldName,
                    ruleType: "invalidField",
                    errorMsg: `This field '${fieldName}' was not found in payload`,
                });
            } else {
                this.#removeError({
                    fieldName,
                    ruleType: "invalidField",
                });
            }

            //get the value of this field
            const fieldValue = payload[fieldName] || undefined;

            //loop through non file validation rules
            for (const ruleType in nonFileValRules[fieldName]) {
                //get all ruleTypes
                const allRuleTypes = this.#defaultNonFileRuleTypes;

                //check if the field's ruleType is valid
                if (!allRuleTypes.includes(ruleType)) break;

                //get the rule title for this field
                const ruleTitle = nonFileValRules[fieldName]["ruleTitle"];

                //get the validation rule value
                const ruleTypeValue = nonFileValRules[fieldName][ruleType];

                //handle srictmode
                if (this.#strictMode && this.#isEmpty(fieldValue) === false) {
                    //check if field value contains prohibited words
                    const ProhibitedWords = this.#prohibitedWords.filter((word) => {
                        return fieldValue
                            ?.toString()
                            ?.match(new RegExp(`${"(" + word + ")"}`, "i"));
                    });

                    //check if it contains prohibited words
                    if (ProhibitedWords.length) {
                        this.#addError({
                            fieldName,
                            ruleType: "prohibitedWords",
                            errorMsg: `Please remove or replace '${ProhibitedWords}'`,
                        });
                        break;
                    } else {
                        this.#removeError({ fieldName, ruleType: "prohibitedWords" });
                    }
                }

                //handle required fields
                if (ruleType === "required" && ruleTypeValue === true) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        `${fieldName} is required`;

                    //check if field value is empty
                    if (this.#isEmpty(fieldValue) === true) {
                        this.#addError({
                            fieldName,
                            ruleType: "required",
                            errorMsg,
                        });
                        break;
                    } else {
                        this.#removeError({
                            fieldName,
                            ruleType: "required",
                        });
                    }
                } else if (
                    ruleType === "pattern" &&
                    this.#isEmpty(fieldValue) === false &&
                    ruleTypeValue?.toString()?.trim !== ""
                ) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType: "pattern" }) ||
                        `This field has failed a validation test`;

                    //create new RegExp
                    const regExp = new RegExp(ruleTypeValue);

                    if (regExp.test(fieldValue) === false) {
                        this.#addError({
                            fieldName,
                            ruleType: "pattern",
                            errorMsg,
                        });
                        break;
                    } else {
                        this.#removeError({
                            fieldName,
                            ruleType: "pattern",
                        });
                    }
                }

                //hanlde type validation
                handleTypeValidation({
                    fieldName,
                    fieldValue,
                    ruleType,
                    ruleTypeValue,
                });

                //handle rule title validation
                handleRuleTitleValidation({
                    fieldName,
                    fieldValue,
                    ruleType,
                    ruleTypeValue: ruleTitle,
                });

                //handle matches validation
                handleMatchesValidation({
                    fieldName,
                    fieldValue,
                    ruleType,
                    ruleTypeValue,
                });

                //handle length validation
                handlelengthValidation({
                    fieldName,
                    fieldValue,
                    ruleType,
                    ruleTypeValue,
                });
            }
        }

        //loop through fieldName in fileValidation rules
        for (const fieldName in fileValRules) {
            //store the number of uploaded files
            let numOfFiles = 0;

            if (this.#isObject(payload[fieldName])) {
                //number of files uploaded should be 1 if the field is an object
                numOfFiles = 1;
            } else if (this.#isArray(payload[fieldName])) {
                //number of files uploaded should be the length of the array if the field is an array
                numOfFiles = payload[fieldName].length;
            }

            //check if field name exists in payload
            if (typeof payload[fieldName] === "undefined") {
                this.#addError({
                    fieldName,
                    ruleType: "invalidField",
                    errorMsg: `This field '${fieldName}' was not found in payload`,
                });
            } else {
                this.#removeError({
                    fieldName,
                    ruleType: "invalidField",
                });
            }

            //get the value of this field
            const fieldValue = payload[fieldName] || undefined;

            //loop through field validation rules
            for (const ruleType in fileValRules[fieldName]) {
                //get all ruleTypes
                const allRuleTypes = this.#defaultFileRuleTypes;
                //check if the field's ruleType is valid
                if (!allRuleTypes.includes(ruleType)) break;
                //get the validation rule value
                const ruleTypeValue = fileValRules[fieldName][ruleType];

                //handle required fields
                if (
                    ruleType === "required" &&
                    (!numOfFiles === true || typeof payload[fieldName] === "undefined")
                ) {
                    const errorMsg =
                        this.#getFieldErrorMessage({ fieldName, ruleType }) ||
                        `${fieldName} is required`;
                    this.#addError({
                        fieldName,
                        ruleType: "required",
                        errorMsg,
                    });
                    break;
                } else {
                    this.#removeError({
                        fieldName,
                        ruleType: "required",
                    });
                }

                handleMimeTypeValidation({
                    fieldName,
                    fieldValue,
                    numOfFiles,
                    ruleType,
                    ruleTypeValue,
                });

                handleFileLengthValidation({
                    fieldName,
                    numOfFiles,
                    ruleType,
                    ruleTypeValue,
                });

                handleFileSizeValidation({
                    fieldName,
                    fieldValue,
                    numOfFiles,
                    ruleType,
                    ruleTypeValue,
                });
            }
        }

        //return errors if it is not empty or return true
        if (Object.keys(this.#errors).length) {
            return false;
        }

        return true;
    };

    /**
     * This method returns all validation errors on the given payload
     * ```javascript
     * //create new instance
     * const octavalidate = new Octavalidate('signup')
     * //destructure methods
     * const { createValidator, validate, getErrors } = octavalidate
     * //define validation rules
     * const validationRules = {
     *     username : {
     *         required : true,
     *         type : "string",
     *         ruleTitle : "userName"
     *     }
     * }
     *
     * //create validation rules
     * createValidator(validationRules)
     *
     * //true means validation passed
     * //false means validation failed
     * const validationResponse = validate(req.body);
     *
     * if(validationResponse === true){
     *     //continue here
     * }else{
     *     //return validation errors
     *     console.log(getErrors())
     * }
     *
     * ```
     * @param {}
     * @returns Object
     */
    getErrors = () => {
        if (Object.keys(this.#errors).length) {
            if (!Object.keys(this.#errors[this.#routeIdentifier]).length) {
                this.#errors = {};
            }
        } else {
            this.#errors = {};
        }

        return this.#errors;
    };

    /**
     * This method loops through all validation errors and returns each of them till they are addressed
     * ```javascript
     * //create new instance
     * const octavalidate = new Octavalidate('signup')
     * //destructure methods
     * const { createValidator, validate, getErrors, getError } = octavalidate
     * //define validation rules
     * const validationRules = {
     *     username : {
     *         required : true,
     *         type : "string",
     *         ruleTitle : "userName"
     *     }
     * }
     *
     * //create validation rules
     * createValidator(validationRules)
     *
     * //true means validation passed
     * //false means validation failed
     * const validationResponse = validate(req.body);
     *
     * if(validationResponse === true){
     *     //continue here
     * }else{
     *     //return validation errors
     *     console.log(getError())
     * }
     *
     * ```
     * @param {}
     * @returns string || null
     */
    getError = () => {
        const errors = this.#errors;
        const routes = Object.keys(errors ?? {});

        for (const route of routes) {
            const routeErrors = errors[route];
            const fields = Object.keys(routeErrors);

            for (const field of fields) {
                const errorMessages = routeErrors[field];
                if (errorMessages) {
                    return Object.values(errorMessages).reverse()?.[0];
                }
            }
        }

        return null;
    };
}

module.exports = Octavalidate;