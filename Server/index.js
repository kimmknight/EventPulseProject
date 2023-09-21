const express = require("express")
const app = express()

// Import express-session and setup to handle session management

// Import MongoDB and connect to server


// Route to share the main content folder
// Clients will need this to retrieve images, css files, and HTML files

app.use("/", express.static("content"))


// Routes to handle requests related to events

app.get("/events", function (req, res) {
    // Client is requesting JSON event list
})

app.post("/events", function (req, res) {
    // Client is attempting to add a new event
    // Require client to be logged in
})

app.delete("/events", function (req, res) {
    // Client is attempting to delete an event
    // Require client to be logged in
})


// Routes to handle requests related to authentication

app.post("/loginverify", function (req, res) {
    // Client has submitted a username/password
    // Sign them in if correct. Redirect to login page if not
})

app.get("/logout", function (req, res) {
    // Client wants to logout. Log them out
})


app.listen(3000)
