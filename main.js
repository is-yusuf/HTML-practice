const { google } = require('googleapis');
const { cal } = require("./Calender");
const { fetchUser } = require("./OctoPrint.js")
const { sendMail } = require('./emailer')
const { OctoPrint } = require('./OctoPrint')

const express = require('express');
var session = require('express-session')
const fetch = require('node-fetch');
const multer = require('multer')

const app = express();
let myCalendar = new cal();
let Octo = new OctoPrint();
const upload = multer({ dest: "/Gcodes" });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/views'));


const { saveFile } = require('./fileOperations');
let eventsConfirmation = {}

// testing();

function testing() {

    Octo.getPrinterStatus().then((ready) => {
        console.log(ready);
    })
    Octo.selectFile("File.gcode", true)
}



app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

/**
 * Renders the index page of the website.
 */
app.get("/", (req, res) => {
    res.render("index.html");
})
/**
 * Connects to the Calendar to check if exact date is available or not.
 */
app.post("/checkexactdate", (req, res) => {
    let start = new Date(req.body.start)
    let end = new Date(req.body.end)
    res.send(myCalendar.checkExactDate(start, end));
})

app.post("/asap", (req, res) => {
    console.log("________________________________________________________")
    let date = new Date(req.body.date);
    let calID = req.body.calID;
    date.setHours(date.getHours() + 14);
    myCalendar.authorize(calID);
    myCalendar.freeBusyStatus(date).then((ReadyCal) => {
        myCalendar = ReadyCal;
        let CalendarResponse = ReadyCal.findFirstSpot(req.body.duration * 60)
        if (!CalendarResponse) {
            res.send(false);
        }
        else {
            res.send(CalendarResponse)
        }
    })
})

app.post("/schedule", (req, res) => {
    if (myCalendar.checkExactDate(new Date(req.body.start), new Date(req.body.end))) {
        myCalendar.schedule(req.body.start, req.body.end);
    }
})

app.get("/userConfirm", (req, res) => {
    let event = req.query.event;
    console.log({ event });
    res.send("Thanks for confirming!")
})


app.post("/upload", upload.single('File'), (req, res) => {
    // console.log("sending after" + req.body.milliseconds / 60000 + "minute")
    // sendMail(formdata.email, formdata.name, formdata.content, formdata.milliseconds);
    formdata = { ...req.body }
    Octo.uploadFile(req.file, formdata.filename + ".gcode")
    // res.status(saveFile(req.file, formdata.filename + ".gcode").status)
    // sendMail(formdata.email, formdata.name, formdata.content, 5000);
})


app.listen(5500, () => { console.log("listening on port 5500") });















