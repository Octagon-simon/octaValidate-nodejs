
//check email
const emailRegExp = (email) => (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(email));

//check Alphabets only
const alphaOnlyRegExp = (text) => (/^[a-zA-Z]+$/.test(text));

//check lowercase alphabets only
const lowerAlphaRegExp = (text) => (/^[a-zA-Z]+$/.test(text));

//check uppercase alphabets only
const upperAlphaRegExp = (text) => (/^[A-Z]+$/.test(text));

//check Alphabets and spaces
const alphaSpacesRegExp = (text) => (/^[a-zA-Z\s]+$/.test(text));

//check Alpha Numberic strings
const alphaNumericRegExp = (text) => (/^[a-zA-Z0-9]+$/.test(text));

//url 
const urlRegExp = (url) => (/^((?:http:\/\/)|(?:https:\/\/))(www.)?((?:[a-zA-Z0-9]+\.[a-z]{3})|(?:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1(?::\d+)?))([\/a-zA-Z0-9\.]*)$/i.test(url))

//validate url with query params
const urlQpRegExp = (url) => (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(url));

//username
const userNameRegExp = (uname) => (/^[a-zA-Z][a-zA-Z0-9-_]+$/.test(uname));

//password - 8 characters or more
const strongPasswordRegExp = (password) => (/^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})+$/.test(password))

//Validates general text
const generalTextRegExp = (text) => (/^[a-zA-Z0-9\s\,\.\'\"\-\_\)\(\[\]\?\!\&\:\;\/]+$/.test(text));

module.exports = {
    alphaOnlyRegExp,
    alphaNumericRegExp,
    lowerAlphaRegExp,
    upperAlphaRegExp,
    // urlQpRegExp,
    urlRegExp,
    userNameRegExp,
    strongPasswordRegExp,
    generalTextRegExp,
    alphaSpacesRegExp,
    emailRegExp
}