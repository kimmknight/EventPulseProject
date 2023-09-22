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
    // Only get events in the future

    now = new Date()

    eventsCollection.find({ date: {$gt: now} }).sort({ date: 1 }).toArray()
    .then((results) => {
        res.json(results);
    });
})

app.get("/allevents", function (req, res) {
    // Client all events (not only future ones). Used for stats page

    eventsCollection.find().toArray()
    .then((results) => {
        res.json(results);
    });
})

app.post("/events", checkLoginDetails, function (req, res) {
    // Client is attempting to add a new event
    // Require client to be logged in !!!!!

    let newEvent = req.body

    // Replace date/time string with date stored as the correct datatype (so database can store/sort it properly)
    properDate = new Date(newEvent.date)
    newEvent.date = properDate

    // Insert the new event into the database
    eventsCollection.insertOne(newEvent)
    .then(() => {
        // Return the updated eventlist
        eventsCollection.find().toArray()
        .then((results) => {
            res.json(results);
        });
    });
})

app.delete("/events", checkLoginDetails, function (req, res) {
    // Client is attempting to delete an event
    // Require client to be logged in !!!!!

    let eventToDelete = req.body

    // Delete the _id property from the eventToDelete. Leaving it there will cause the event not to be deleted
    delete eventToDelete._id

    // Delete the event matching eventToDelete from the database

    eventsCollection.deleteOne(eventToDelete)
    .then(() => {
        // Return the updated eventlist
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

    
    // Find a user in the 'usersCollection' with the provided username and password
    usersCollection.findOne({ username: req.body.username.toLowerCase(), password: req.body.password })
    .then((foundUser) => {
        if (foundUser) {
            // If a user is found, we know they exist in the database with the correct password

            // Set their username in the session variable and redirect to '/private'
            req.session.username = req.body.username;

            // Redirect logged-in user to the new event page
            res.redirect("/newevent.html");
        } else {
            // If no user is found, redirect back to the login page
            return res.redirect("/login.html");
        }
    })
    .catch((err) => {
        // Handle any errors that occur during the database query
        console.error(err); // Display the error in the debug console
        res.redirect("/login.html"); // Redirect to login page in case of an error
    });
})


app.get("/logout", function (req, res) {
    // Client wants to logout. Log them out

    req.session.destroy()
    res.redirect("/")
})


// This function "checkLoginDetails" is called by the secured routes to check whether the user is logged in yet
function checkLoginDetails(req, res, next) {

    // Check whether the session variable "username" exists
    if (req.session.username) {
        // The "username" session variable exists, therefore the user must be successfully logged in

        // When we use a "check" function like this with Express, we can indicate that the check is successful by calling the next() function
        next();

    } else {
        
        // The user is not successfully logged in. Redirect them to the login page
        res.redirect("/login.html");

    }
}


app.listen(3000)
