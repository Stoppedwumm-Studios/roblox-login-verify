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

let info = require('./infos.json');
let runningAuths = info["runningAuths"];
const { writeFile } = require('fs');

function uselessErrorHandler(error) {
    if (error) {
        console.log('An error has occurred ', error);
        return;
    }
    console.log("Error handler called without error");
}

app.use(express.urlencoded({ extended: true }));

app.get("/login/auth", (req, res) => {
    const authId = req.query.authid;

    // Render the login/auth form with reCAPTCHA
    res.send(`
        <form action="/login/auth?authid=${authId}" method="post">
            <!-- Your other form fields go here -->
            ${recaptcha.render()}
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post("/login/auth", recaptcha.middleware.verify, (req, res) => {
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
                info["runningAuths"] = runningAuths
                writeFile("./infos.json", JSON.stringify(info), uselessErrorHandler)
            }
        }

        res.send("Verification successful");
    }
});

app.get("/secret-dont-browse/1888/rbx-api/create-verify", (req, res) => {
    if (runningAuths[req.query.authid] === undefined) {
        runningAuths[req.query.authid] = {
            "isVerified": false
        }

        info["runningAuths"] = runningAuths

        writeFile("./infos.json", JSON.stringify(info), uselessErrorHandler)
        console.log(info)
        res.send(req.query.authid)
    } else {
        res.send("already_taken")
    }
})

app.get("/secret-dont-browse/1888/rbx-api/isverified", (req, res) => {
    const authId = req.query.authid
    if (runningAuths[authId] === undefined) {
        res.send("404")
    } else {
        if (runningAuths[authId]["isVerified"] === false) {
            res.send("no")
        } else {
            if (runningAuths[authId]["isVerified"] === true) {
                res.send("yes")
                runningAuths[authId] = undefined
                info["runningAuths"] = runningAuths

                writeFile("./infos.json", JSON.stringify(info), uselessErrorHandler)
            }
        }
    }
})

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});

module.exports = app;
