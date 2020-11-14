const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require('express-fileupload')
const admin = require('firebase-admin')
require("dotenv").config();

const serviceAccount = require("./travelgurubd-firebase-adminsdk-plm37-2ecce76d33.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://travelgurubd.firebaseio.com"
});

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6kmmo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = process.env.PORT || 4000;
const dbname = process.env.DB_NAME


app.get("/", (req, res) => {
    res.send("Hello world!");
});

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

client.connect((err) => {
    console.log("connedted db");
    const db = client.db(dbname);

    // add bookings
    app.post("/add-booking", (req, res) => {
        const newBooking = req.body;
        reviewsCollection.insertOne(newReview).then(result => {
            res.send(result.insertedCount > 0)
        })
    })
})


app.listen(port, () => {
    console.log("Example app listening to localhost:4000");
});