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
    const bookingsCollection = db.collection("bookings");
    const houseCollection = db.collection("houses");
    const adminsCollection = db.collection("admins");


    // add bookings
    app.post("/add-booking", (req, res) => {
        const newBooking = req.body;
        console.log(newBooking);
        bookingsCollection.insertOne(newBooking).then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    // add house
    app.post("/add-house", (req, res) => {
        const newHouse = req.body;
        houseCollection.insertOne(newHouse).then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post("/is-admin", (req, res) => {
        const email = req.body.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            })
    })




    // GET Requests
    app.get('/bookings', (req, res) => {
        bookingsCollection.find({}).toArray((err, documents) => {
            res.send(documents)
        })
    })
    app.get('/my-bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    let tokenEmail = decodedToken.email;
                    if (req.query.email === tokenEmail) {
                        ordersCollection.find({ email: req.query.email }).toArray((err, documents) => {
                            res.status(200).send(documents)
                        })
                    } else {
                        res.status(401).send('unauthorized access')
                    }
                }).catch(error => {
                    res.status(401).send('unauthorized access')

                })

        } else { res.status(401).send('unauthorized access') }

    })
    app.get('/apartments', (req, res) => {
        houseCollection.find({}).toArray((err, documents) => {
            res.send(documents)
        })
    })
    app.get('/admin-list', (req, res) => {
        adminsCollection.find({}).sort({ timeStamp: -1 }).toArray((err, documents) => {
            res.send(documents)
        })
    })

    // update booking status
    app.patch('/update-booking/:id', (req, res) => {
        bookingsCollection.updateOne({ _id: ObjectId(req.params.id) },
            {
                $set: { status: req.body.currentStatus }
            }).then(result => {
                res.send(req.body.currentStatus)
            })
    })


})


app.listen(port, () => {
    console.log("Example app listening to localhost:4000");
});