const express = require("express");
const Recaptcha = require('express-recaptcha').RecaptchaV2;

const app = express();

const inDevMode = false

if (inDevMode) {
    const secrets = require("./secrets.json");
    var recaptcha = new Recaptcha(secrets["sitekey"], secrets["secret"], { callback: 'cb' });
} else {
    var recaptcha = new Recaptcha(process.env.SITEKEY, process.env.SECRETKEY, { callback: 'cb' });
}

let runningAuths = {}
const { writeFile } = require('fs');

function uselessErrorHandler(error) {
    if (error) {
        console.log('An error has occurred ', error);
        return;
    }
    console.log("Error handler called without error");
}

app.use(express.urlencoded({ extended: true }));

app.get("/verify", (req, res) => {
    const authId = req.query.authid;

    // Render the login/auth form with reCAPTCHA
    res.send(`
        <form action="/verify?authid=${authId}" method="post">
            <!-- Your other form fields go here -->
            ${recaptcha.render()}
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post("/verify", recaptcha.middleware.verify, (req, res) => {
    if (req.recaptcha.error) {
        // reCAPTCHA verification failed
        res.send("reCAPTCHA verification failed");
    } else {
        const authId = req.query.authid;

        console.log(authId)
        // Your logic after reCAPTCHA verification goes here
        if (runningAuths[authId]) {
            if (runningAuths[authId]["isVerified"] === false) {
                console.log(runningAuths[authId])
                runningAuths[authId]["isVerified"] = true
            }
        }

        res.send("Verification successful, please return to Roblox");
    }
});

app.get("/rbx-api/create-verify", (req, res) => {
    if (runningAuths[req.query.authid] === undefined) {
        runningAuths[req.query.authid] = {
            "isVerified": false
        }
        res.send(req.query.authid)
    } else {
        res.send("already_taken")
    }
})

app.get("/rbx-api/isverified", (req, res) => {
    const authId = req.query.authid
    if (runningAuths[authId] === undefined) {
        res.send("404")
    } else {
        if (runningAuths[authId]["isVerified"] === false) {
            res.send("no")
        } else {
            if (runningAuths[authId]["isVerified"] === true) {
                res.send("yes")
            }
        }
    }
})

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/home.html")
})

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

module.exports = app;
