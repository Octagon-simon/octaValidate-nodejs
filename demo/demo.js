const express = require('express')
const octaValidate = require('../index')
const app = express()
//parse requests as json
app.use(express.json())

app.get('/', (req, res) => {
    return res.status(200).json({
        message : "App is live, please try to make a request to the routes below",
        postRoutes : [ 'http://localhost:5000/register', 'http://localhost:5000/login']
    })
})

//login route
app.post('/login', (req, res) => {
    try {
        //initialize validation library
        const validate = new octaValidate('login_api')
        //validation rules
        const fieldRules = {
            email: {
                'R': "Your email address is required",
                'EMAIL': "Please provide a valid Email Address"
            },
            pass: {
                'R': "Your password is required",
                'MINLENGTH': [8, "Your password must have a minimum of 8 characters"]
            }
        }
        //perform validation and check if successful
        if (validate.validateFields(fieldRules, req.body)) {
            return res.status(200).json({
                success: true,
                message: "Validation successful"
            })
        } else {
            //validation failed
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                validationErrors: validate.getErrors()
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "A server error has occured"
        })
    }
})

//register route
app.post('/register', (req, res) => {
    try {
        //initialize validation library
        const validate = new octaValidate('register_api')
        //validation rules
        const fieldRules = {
            email: {
                'R': "Your email address is required",
                'EMAIL': "Please provide a valid Email Address"
            },
            uname: {
                'R': "Your username is required",
                'USERNAME': "Your Username contains invalid characters"
            },
            pass: {
                'R': "Your password is required",
                'MINLENGTH': [8, "Your password must have a minimum of 8 characters"]
            },
            conpass: {
                'R': "Please re-enter your password",
                'EQUALTO': ['pass', "Both passwords do not match"]
            }
        }
        //perform validation and check if successful
        if (validate.validateFields(fieldRules, req.body)) {
            return res.status(200).json({
                success: true,
                message: "Validation successful"
            })
        } else {
            //validation failed
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                validationErrors: validate.getErrors()
            })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "A server error has occured"
        })
    }
})

//listen on port
app.listen(5000, () => {
    console.log('App is live, access the API at http://localhost:5000')
})