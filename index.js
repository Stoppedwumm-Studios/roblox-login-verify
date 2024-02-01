const express = require("express")
const app = express()
let runningAuths = []


app.get("/login/auth", (req, res) => {
    const authId = req.query.download

    
    console.log("New authId : " + authId)
})

app.get("/secret-dont-browse/1888/rbx-api", (req, res) => {
    if (runningAuths.includes(req.query.authid) === false) {
        runningAuths.push(req.query.authid)
        res.send("negative")
        console.log(runningAuths)
    } else {
        console.log("Return running auth")
    }
    
})

app.listen(8000, () => {
    console.log("We are online")
})