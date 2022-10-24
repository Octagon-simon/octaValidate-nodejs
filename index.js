class octaValidate {
    #author = "Simon Ugorji";
    #version = "1.0.0";
    #strictWords = ["null", "undefined", "empty"];
    #strictMode = false;
    #formId = ""
    #debugMode = false
    #errors = {}
    //custom rules
    #customRules = {}
    constructor(formId = undefined, opts = {}) {
        if (typeof formId === "undefined")
            throw new Error("You must provide a valid FormID during initialization")

        this.#formId = formId;
        if (typeof opts.strictMode !== "undefined") {
            this.#strictMode = opts.strictMode;
        }
        if (typeof opts.strictWords !== "undefined") {
            this.#strictWords.push(...opts.strictWords);
        }
        if (typeof opts.debugMode !== "undefined") {
            this.#debugMode = opts.debugMode;
        }
    }
    /** CORE VALIDATION LIBRARY**/
    #validationLibrary() {
        //check email
        function octaValidateEmail(email) {
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email)) {
                return true;
            }
            return false;
        }

        //check Alphabets only
        function octaValidateALPHA_ONLY(text) {
            if (/^[a-zA-Z]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check lowercase alphabets only
        function octaValidateLOWER_ALPHA(text) {
            if (/^[a-z]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check uppercase alphabets only
        function octaValidateUPPER_ALPHA(text) {
            if (/^[A-Z]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check Alphabets and spaces
        function octaValidateALPHA_SPACES(text) {
            if (/^[a-zA-Z\s]+$/.test(text)) {
                return true;
            }
            return false;
        }

        //check Alpha Numberic strings
        function octaValidateALPHA_NUMERIC(text) {
            if (/^[a-zA-Z0-9]+$/.test(text)) {
                return true;
            } else {
                return false;
            }
        }

        //check DATE mm/dd/yyyy
        //source https://stackoverflow.com/a/15196623
        function octaValidateDate_MDY(date) {
            if (/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/.test(date)) {
                return true;
            }
            return false;
        }

        //url 
        function octaValidateUrl(url) {
            if (/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i.test(url)) {
                return true;
            } else {
                return false;
            }
        }

        //validate url with query params
        function octaValidateUrl_QP(url) {
            if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url)) {
                return true;
            } else {
                return false;
            }
        }

        //username
        function octaValidateUserName(uname) {
            if (/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(uname)) {
                return true;
            } else {
                return false;
            }
        }

        //password - 8 characters or more
        function octaValidatePWD(password) {
            if (/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})+$/.test(password)) {
                return true;
            } else {
                return false;
            }
        }

        //Validates general text
        function octaValidateTEXT(text) {
            if (/^[a-zA-Z0-9\s\,\.\'\"\-\_\)\(\[\]\?\!\&\:\;\/]+$/.test(text)) {
                return true;
            } else {
                return false;
            }
        }

        return {
            ValidateEmail: octaValidateEmail,
            ValidateAlpha_Only: octaValidateALPHA_ONLY,
            ValidateLower_Alpha: octaValidateLOWER_ALPHA,
            ValidateUpper_Alpha: octaValidateUPPER_ALPHA,
            ValidateAlpha_Spaces: octaValidateALPHA_SPACES,
            ValidateAlpha_Numeric: octaValidateALPHA_NUMERIC,
            ValidateUrl: octaValidateUrl,
            ValidateUrl_QP: octaValidateUrl_QP,
            ValidateUserName: octaValidateUserName,
            ValidateDate_MDY: octaValidateDate_MDY,
            ValidatePWD: octaValidatePWD,
            ValidateTEXT: octaValidateTEXT
        }
    }

    #isObject(obj) {
        //Are you wondering the use of this method? Why don't u give me a call :)
        return (Object.prototype.toString.call(obj) === '[object Object]');
    }
    #isArray(ary) {
        return (Object.prototype.toString.call(ary) === '[object Array]');
    }
    //add single rule
    customRule(rule_title = undefined, regExp = undefined) {
        if (typeof rule_title !== "undefined"
            && typeof regExp !== "undefined")
            //store rule
            this.#customRules[rule_title] = regExp;
    }
    //add multiple rules
    moreCustomRules(rules = {}) {
        if (!this.#isObject(rules))
            throw new Error("The rules provided must be a valid Object! Please refer to the documentation");
        if(!Object.keys(rules).length)
            throw new Error("You must provide multiple custom rules within this object")
        //loop through custom rules
        for (let rule_title in rules) {
            const regExp = rules[rule_title]; //get RegExp
            if (!regExp)
                throw new Error(`Custom Validation rule at index [${rule_title}] is Invalid!`);
            //push custom rule to array
            this.#customRules[rule_title] = regExp
        }
    }
    #addError(fieldName, errorMsg) {
        //append into error object
        this.#errors[this.#formId] = this.#errors[this.#formId] || {}
        this.#errors[this.#formId][fieldName] = errorMsg

        if (this.#debugMode) {
            console.log(fieldName, errorMsg)
        }
    }
    #removeError(fieldName) {
        //check if error key exists
        if (typeof this.#errors[this.#formId] !== "undefined")
            //then remove
            delete this.#errors[this.#formId][fieldName];
    }

    //Convert file size
    #sizeInBytes(size) {
        const prevSize = size;
        //convert to lowercase
        size = size.toLowerCase().replace(/\s/g, '');
        //check size
        if (/[0-9]+(bytes|kb|mb|gb|tb|pb)+$/i.test(size) === false) {
            ovDoError(`The size ${prevSize} you provided is Invalid. Please check for typos or make sure that you are providing a size from bytes up to Petabytes`);
        }
        //get the number
        const sizeNum = Number(size.split('').map(sn => { return ((!(isNaN(sn)) ? sn : '')) }).join(''));
        //get the digital storage extension
        const sizeExt = (() => {
            const res = size.split('').map(s => { return (isNaN(s)) }).indexOf(true);
            return ((res !== -1) ? size.substring(res) : "");
        })();
        /**
         * 1KB = 1024 bytes 
         * 1PB = 1024 bytes ^ 5 [I stopped here. Add yours]
         */
        switch (sizeExt) {
            case "bytes":
                return (Number(sizeNum));
            case "kb":
                return (Number(sizeNum * 1024));
            case "mb":
                return (Number(sizeNum * 1024 * 1024));
            case "gb":
                return (Number(sizeNum * 1024 * 1024 * 1024));
            case "tb":
                return (Number(sizeNum * 1024 * 1024 * 1024 * 1024));
            case "pb":
                return (Number(sizeNum * 1024 * 1024 * 1024 * 1024 * 1024));
            default:
                return (0);
        }
    }

    /** 
    * Use this method to validate form fields
    * @param valRules Required. This is your validation rules
    * @param fields The form fields to validate.
    */
    validateFields(valRules = {}, fields = {}) {

        //check if fields is empty
        if (!this.#isObject(fields))
            throw new Error("Fieldlist must be a valid object containing [FIELD_NAME] : [FIELD_VALUE]")

        //check if rules object is empty
        if (!this.#isObject(valRules) || !Object.keys(valRules).length)
            throw new Error("Validation rules must not be empty")
        //reassign body
        const reqBody = Object.assign({}, fields)

        //check if all defined fields in validation rules, exists in fieldslist
        for (let fieldName in valRules) {
            //check if field name exists in reqBody
            if (typeof reqBody[fieldName] === "undefined")
                this.#addError(fieldName, `The Fieldname '${fieldName}' cannot be found`)
        }

        //loop through val rules
        for (let fieldName in valRules) {
            //register field value
            let fieldValue = reqBody[fieldName];
            //prevents validation of the next field name if current one has errors
            let continueValidation = {};
            continueValidation[fieldName] = 0

            //loop through validation rules
            //Object.keys(valRules[fieldName]).forEach(rule => {
            for (let rule in valRules[fieldName]) {
                //check if strict mode is enabled and field name contains a value
                if (this.#strictMode && fieldValue) {
                    //remove extra spacing
                    reqBody[fieldName] = reqBody[fieldName]?.trim();
                    //check if field value contains prohibited words
                    const ProhibitedWords = this.#strictWords.filter(word => {
                        return fieldValue.match(new RegExp(`${'(' + word + ')'}`, 'i'))
                    });
                    //if value > 0, it has prohibited words
                    if (ProhibitedWords.length) {
                        this.#addError(fieldName, `Please remove or replace '${ProhibitedWords}'`)
                        break;
                    }

                }
                //check if rule is R
                if (rule == 'R') {
                    const errorMsg = valRules[fieldName]['R']
                    //check if field value is empty
                    if (typeof fieldValue === "undefined" || fieldValue.trim() === "") {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                }
                //handle custom rules
                else if (fieldValue && (Object.keys(this.#customRules).length !== 0)
                    && continueValidation[fieldName]) {
                    //loop through custom validation rule
                    if (typeof this.#customRules[rule] !== "undefined") {
                        const errorMsg = valRules[fieldName][rule]

                        let pattern = this.#customRules[rule];
                        let regExp = new RegExp(pattern);
                        if (!regExp.test(fieldValue)) {
                            this.#addError(fieldName, errorMsg)
                            break;
                        }
                    }
                } else if (rule == 'EMAIL') {
                    const errorMsg = valRules[fieldName]['EMAIL']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateEmail(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'USERNAME') {
                    const errorMsg = valRules[fieldName]['USERNAME']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateUserName(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'ALPHA_ONLY') {
                    const errorMsg = valRules[fieldName]['ALPHA_ONLY']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateAlpha_Only(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'ALPHA_SPACES') {
                    const errorMsg = valRules[fieldName]['ALPHA_SPACES']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateAlpha_Spaces(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'ALPHA_NUMERIC') {
                    const errorMsg = valRules[fieldName]['ALPHA_NUMERIC']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateAlpha_Numeric(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'LOWER_ALPHA') {
                    const errorMsg = valRules[fieldName]['LOWER_ALPHA']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateLower_Alpha(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'UPPER_ALPHA') {
                    const errorMsg = valRules[fieldName]['UPPER_ALPHA']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateUpper_Alpha(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'PWD') {
                    const errorMsg = valRules[fieldName]['PWD']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidatePWD(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'DIGITS') {
                    const errorMsg = valRules[fieldName]['DIGITS']
                    //check if field value is empty
                    if (fieldValue && isNaN(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'URL') {
                    const errorMsg = valRules[fieldName]['URL']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateUrl(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'URL_QP') {
                    const errorMsg = valRules[fieldName]['URL_QP']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateUrl_QP(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'DATE_MDY') {
                    const errorMsg = valRules[fieldName]['DATE_MDY']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateDate_MDY(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'TEXT') {
                    const errorMsg = valRules[fieldName]['TEXT']
                    //check if field value is empty
                    if (fieldValue && !this.#validationLibrary().ValidateTEXT(fieldValue)) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                }
                //it's time for attributes now
                else if (rule == 'LENGTH') {
                    //check if rule's value is an array, and has 2 items
                    //something like this { 'LENGTH' : [5, "You must enter 5 characters"] }
                    if (!this.#isArray(valRules[fieldName]['LENGTH']))
                        throw new Error("The value of LENGTH validation must be an array with 2 items")
                    //access value
                    const toCompare = Number(valRules[fieldName]['LENGTH'][0])
                    //access error message
                    const errorMsg = valRules[fieldName]['LENGTH'][1]
                    //check if field value is empty
                    if (fieldValue && fieldValue.length !== toCompare) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'MINLENGTH') {
                    //check if rule's value is an array, and has 2 items
                    if (!this.#isArray(valRules[fieldName]['MINLENGTH']))
                        throw new Error("The value of MINLENGTH validation must be an array with 2 items")
                    //access value
                    const toCompare = Number(valRules[fieldName]['MINLENGTH'][0])
                    //access error message
                    const errorMsg = valRules[fieldName]['MINLENGTH'][1]
                    //check if field value is empty
                    if (fieldValue && fieldValue.length < toCompare) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'MAXLENGTH') {
                    //check if rule's value is an array, and has 2 items
                    if (!this.#isArray(valRules[fieldName]['MAXLENGTH']))
                        throw new Error("The value of MAXLENGTH validation must be an array with 2 items")
                    //access value
                    const toCompare = Number(valRules[fieldName]['MAXLENGTH'][0])
                    //access error message
                    const errorMsg = valRules[fieldName]['MAXLENGTH'][1]
                    //check if field value is empty
                    if (fieldValue && fieldValue.length > toCompare) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'EQUALTO') {
                    //check if rule's value is an array, and has 2 items
                    if (!this.#isArray(valRules[fieldName]['EQUALTO']))
                        throw new Error("The value of EQUALTO validation must be an array with 2 items")
                    //access value which is a fieldName
                    const toCompare = valRules[fieldName]['EQUALTO'][0]
                    if (!toCompare) {
                        throw new Error("You must provide a fieldName as the first item in the array in EQUALTO validation")
                    }
                    //check if fieldName exists in reqBody
                    if (typeof reqBody[toCompare] === "undefined") {
                        throw new Error(`The FieldName ${toCompare} cannot be found`)
                    }
                    //access error message
                    const errorMsg = valRules[fieldName]['EQUALTO'][1]
                    //check if field value is empty
                    if (fieldValue && reqBody[toCompare] !== fieldValue) {
                        this.#addError(`${fieldName}:${toCompare}`, errorMsg)
                        break;
                    }
                }
            }
        }

        //return errors if it is not empty or return true
        if (Object.keys(this.#errors).length &&
            Object.keys(this.#errors[this.#formId]).length) {
            return false
        }

        return true;
    }

    /** Use this method to validate uploaded files
    * @param valRules Required. This is your validation rules
    * @param files The files to validate. Default is `req.files`
    */
    validateFiles(valRules = {}, files  =  req.files) {
        //reassign files
        files = Object.assign({}, files)
        //if files is null, st it to an empty object
        //by default req.files is null even when you submit a form without attaching a file
        if (!files)
            files = {}

            /*
            Not necessary since I am going to use Required to check for it anyways.
        //check if all defined fields in validation rules, exists in fieldslist
        for (let fieldName in valRules) {
            //check if field name exists in reqBody
            if (typeof reqBody[fieldName] === "undefined")
                this.#addError(fieldName, `The Fieldname '${fieldName}' cannot be found`)
        }*/

        //check if rules object is empty
        if (!this.#isObject(valRules) || !Object.keys(valRules).length)
            throw new Error("Validation rules must not be empty")

        //loop through val rules
        for (let fieldName in valRules) {

            let filesLength = 0;
            if (this.#isObject(files[fieldName])) {
                filesLength = 1
            } else if (this.#isArray(files[fieldName])) {
                filesLength = files[fieldName].length
            }
            //loop through validation rules
            for (let rule in valRules[fieldName]) {
                //check if rule is R
                if (rule == 'R') {
                    const errorMsg = valRules[fieldName]['R']
                    if (!filesLength || typeof files[fieldName] === "undefined") {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                }
                //no need for custom rules here you get?
                else if (rule == 'FILES') {
                    //check if rule's value is an array, and has 2 items
                    //something like this { 'FILE' : [5, "You must upload 5 files"] }
                    if (!this.#isArray(valRules[fieldName]['FILES']))
                        throw new Error("The value of 'FILES' validation must be an array with 2 items")
                    //access value
                    const toCompare = Number(valRules[fieldName]['FILES'][0])
                    //access error message
                    const errorMsg = valRules[fieldName]['FILES'][1]
                    //check if field value is empty
                    if (filesLength !== toCompare) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'MINFILES') {
                    //check if rule's value is an array, and has 2 items
                    //something like this { 'FILE' : [5, "You must upload 5 files"] }
                    if (!this.#isArray(valRules[fieldName]['MINFILES']))
                        throw new Error("The value of MINFILE validation must be an array with 2 items")
                    //access value
                    const toCompare = Number(valRules[fieldName]['MINFILES'][0])
                    //access error message
                    const errorMsg = valRules[fieldName]['MINFILES'][1]
                    //check if field value is empty
                    if (filesLength < toCompare) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                } else if (rule == 'MAXFILES') {
                    //check if rule's value is an array, and has 2 items
                    //something like this { 'FILE' : [5, "You must upload 5 files"] }
                    if (!this.#isArray(valRules[fieldName]['MAXFILES']))
                        throw new Error("The value of MAXFILE validation must be an array with 2 items")
                    //access value
                    const toCompare = Number(valRules[fieldName]['MAXFILES'][0])
                    //access error message
                    const errorMsg = valRules[fieldName]['MAXFILES'][1]
                    //check if field value is empty
                    if (filesLength > toCompare) {
                        this.#addError(fieldName, errorMsg)
                        break;
                    }
                }
                //SIZE validation
                else if (rule == 'SIZE') {
                    //check if rule's value is an array, and has 2 items
                    //something like this { 'SIZE' : [5MB, "You must upload 5MB file"] }
                    if (!this.#isArray(valRules[fieldName]['SIZE']))
                        throw new Error("The value of SIZE validation must be an array with 2 items")
                    //access value
                    const toCompare = this.#sizeInBytes(valRules[fieldName]['SIZE'][0]);
                    //access error message
                    const errorMsg = valRules[fieldName]['SIZE'][1]
                    //handle single file upload
                    if (filesLength === 1) {
                        //Check size and compare
                        if (Number(files[fieldName]['size']) !== toCompare) {
                            this.#addError(fieldName, errorMsg)
                            break;
                        }
                    } else if (filesLength > 1) {
                        //multiple files [{"name" : "me.png"}, {"name" : "you.png"}]
                        let ind = 0
                        //loop through array of objects
                        while (ind < files[fieldName].length) {
                            const file = files[fieldName][ind]
                            if (Number(file['size']) !== toCompare) {
                                this.#addError(fieldName, errorMsg)
                                break;
                            }
                            ind++;
                        }
                    }
                } else if (rule == 'MINSIZE') {
                    //check if rule's value is an array, and has 2 items
                    if (!this.#isArray(valRules[fieldName]['MINSIZE']))
                        throw new Error("The value of MINSIZE validation must be an array with 2 items")
                    //access value
                    const toCompare = this.#sizeInBytes(valRules[fieldName]['MINSIZE'][0].toLowerCase());
                    //access error message
                    const errorMsg = valRules[fieldName]['MINSIZE'][1]
                    //handle single file upload
                    if (filesLength === 1) {
                        //Check size and compare
                        if (Number(files[fieldName]['size']) < toCompare) {
                            this.#addError(fieldName, errorMsg)
                            break;
                        }
                    } else if (filesLength > 1) {
                        //multiple files [{"name" : "me.png"}, {"name" : "you.png"}]
                        let ind = 0
                        //loop through array of objects
                        while (ind < files[fieldName].length) {
                            const file = files[fieldName][ind]
                            if (Number(file['size']) < toCompare) {
                                this.#addError(fieldName, errorMsg)
                                break;
                            }
                            ind++;
                        }
                    }
                } else if (rule == 'MAXSIZE') {
                    //check if rule's value is an array, and has 2 items
                    if (!this.#isArray(valRules[fieldName]['MAXSIZE']))
                        throw new Error("The value of MAXSIZE validation must be an array with 2 items")
                    //access value
                    const toCompare = this.#sizeInBytes(valRules[fieldName]['MAXSIZE'][0].toLowerCase());
                    //access error message
                    const errorMsg = valRules[fieldName]['MAXSIZE'][1]
                    //handle single file upload
                    if (filesLength === 1) {
                        //Check size and compare
                        if (Number(files[fieldName]['size']) > toCompare) {
                            this.#addError(fieldName, errorMsg)
                            break;
                        }
                    } else if (filesLength > 1) {
                        //multiple files [{"name" : "me.png"}, {"name" : "you.png"}]
                        let ind = 0
                        //loop through array of objects
                        while (ind < files[fieldName].length) {
                            const file = files[fieldName][ind]
                            if (Number(file['size']) > toCompare) {
                                this.#addError(fieldName, errorMsg)
                                break;
                            }
                            ind++;
                        }
                    }
                }
                //File MIME type validation
                else if (rule == 'ACCEPT') {
                    //check if rule's value is an array, and has 2 items
                    if (!this.#isArray(valRules[fieldName]['ACCEPT']))
                        throw new Error("The value of ACCEPT validation must be an array with 2 items")
                    //access value
                    const requiredFileMime = valRules[fieldName]['ACCEPT'][0].replace(/\s/g, '').split(',').map(m => {
                        return (m.toLowerCase());
                    });
                    //access error message
                    const errorMsg = valRules[fieldName]['ACCEPT'][1]
                    //handle single file upload
                    if (filesLength === 1) {
                        //Check file type is in the required set eg image/png && if wildcard of the file type is in the required set eg image/*
                        if (!(requiredFileMime.includes(files[fieldName]['mimetype'])) && !(requiredFileMime.includes(files[fieldName]['mimetype'].split(files[fieldName]['mimetype'].substr(files[fieldName]['mimetype'].indexOf('/')))[0] + "/*"))) {
                            this.#addError(fieldName, errorMsg)
                            break;
                        }
                    } else if (filesLength > 1) {
                        //multiple files [{"name" : "me.png"}, {"name" : "you.png"}]
                        //multiple files [{"name" : "me.png"}, {"name" : "you.png"}]
                        let ind = 0
                        //loop through array of objects
                        while (ind < files[fieldName].length) {
                            const file = files[fieldName][ind]
                            if (!(requiredFileMime.includes(file['mimetype'])) && !(requiredFileMime.includes(file['mimetype'].split(file['mimetype'].substr(file['mimetype'].indexOf('/')))[0] + "/*"))) {
                                this.#addError(fieldName, errorMsg)
                                break;
                            }
                            ind++;
                        }
                    }
                }
            }
        }

        //return errors if it is not empty or return true
        if (Object.keys(this.#errors).length &&
            Object.keys(this.#errors[this.#formId]).length) {
            return false
        }

        return true;
    }

    //get author
    getAuthor() {
        return this.#author;
    }

    //get form
    getForm() {
        return this.#formId;
    }

    //get version
    getVersion() {
        return this.#version;
    }

    //get errors
    getErrors() {
        return this.#errors;
    }
}
/*
//for express-fileupload
{"cover": 
    {   "name":"1.png",
        "data":{"type":"Buffer","data":0},
        "size":32564,
        "encoding":"7bit",
        "tempFilePath":"",
        "truncated":false,
        "mimetype":"image/png",
        "md5":"341331472785bec82e6dafc4ee91328b"
    }
}
*/
module.exports = octaValidate