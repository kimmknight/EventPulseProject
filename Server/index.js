const express = require("express")
const app = express()

// Activate the "express.urlencoded" feature which allows us to read basic form data submitted by clients.
// This will be needed to read the username/password submitted from a login page
app.use(express.urlencoded());

app.use(express.json( { limit: '1mb' } ));


// Import the express-session library which will use cookies to keep track of client sessions
var session = require("express-session");
// Tell the web server (app) to use express-session to track sessions
app.use(
    session({
        secret: "eNYNRMTeHhNIzqznJ8U8kzgFhqs6aZMbaCpKrE6hXT2rcW",

        // Set the max session time to 10 minutes. 1000 (ms) * 60 (seconds) * 10 (minutes)
        maxAge: 1000 * 60 * 10,
    })
);


// Import the MongoDB client library to a new object called "MongoClient" which we will use to access all MongoDB functions
const {MongoClient} = require("mongodb");

// Define the connection URL of the MongoDB server and additional options.
// In this case we set the "family" option to 4 which forces the connection to use IPv4 which avoids some issues
const client = new MongoClient("mongodb://localhost/", { family: 4 })

// The function that will open the connection to the MongoDB server.
// By using making this an "async" function we can use "await" statements inside of it.
// In simple terms, an "await" statements tell JavaScript to wait until the operation
// is complete before continuing
async function connect() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB!");
    } catch {
        console.log("Error connecting to MongoDB.")
    }
}

// Run the "connect()" function we created above
connect()

// Define a variable that is a reference to a collection we want to access in the database.
// If working with multiple collections, you could create a variable for each one
let usersCollection = client.db("eventpulse").collection("users");
let eventsCollection = client.db("eventpulse").collection("events");


// Route to share the main content folder
// Clients will need this to retrieve images, css files, and HTML files

app.use("/", express.static("content"))


// Routes to handle requests related to events

app.get("/events", function (req, res) {
    // Client is requesting JSON event list

    eventsCollection.find().toArray()
    .then((results) => {
        res.json(results);
    });
})

app.post("/events", function (req, res) {
    // Client is attempting to add a new event
    // Require client to be logged in !!!!!

    let newJob = req.body

    // Insert the new job into the database
    eventsCollection.insertOne(newJob)
    .then(() => {
        // Return the updated joblist
        eventsCollection.find().toArray()
        .then((results) => {
            res.json(results);
        });
    });
})

app.delete("/events", function (req, res) {
    // Client is attempting to delete an event
    // Require client to be logged in !!!!!

    let eventToDelete = req.body

    // Delete the _id property from the eventToDelete. Leaving it there will cause the job not to be deleted
    delete eventToDelete._id

    // Delete the job matching eventToDelete from the database

    eventsCollection.deleteOne(eventToDelete)
    .then(() => {
        // Return the updated joblist
        eventsCollection.find().toArray()
        .then((results) => {
            res.json(results);
        });
    });

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
