/*******************************************************************************
 * (c) Copyright HCL Technologies Ltd. 2018.  MIT Licensed!
 *******************************************************************************/

/**
 * Server application entry point
 * @author Mattias Mohlin
 */
'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const PubSub = require(`@google-cloud/pubsub`);
const pubsub = new PubSub();

const port = 3000;
const env = process.env.NODE_ENV || 'development';

// Static middleware for serving static files 
//app.use('/fd', express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.contentType("text/html");
    res.sendFile(__dirname + '/public/html/main.html');
});
app.get('/css', function(req, res) {
    res.contentType("text/css");
    res.sendFile(__dirname + '/public/css/styling.css');
});
app.get('/main', function(req, res) {
    res.contentType("text/javascript");
    res.sendFile(__dirname + '/public/js/main.js');
});
app.get('/flame', function(req, res) {
    res.contentType("img/jpg");
    res.sendFile(__dirname + '/public/img/flame.jpg');
});
app.get('/jquery', function(req, res) {
    res.contentType("text/javascript");
    res.sendFile(__dirname + '/public/js/jquery/jquery.min.js');
});

//app.get('/', (req, res) => res.send('Hello World!'))

http.listen(port, () => console.log(`Web app listening on port ${port}!`));

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

// References an existing subscription
const subscription = pubsub.subscription('projects/rsarte-iot/subscriptions/web-sub');

// Create an event handler to handle messages
let messageCount = 0;
const messageHandler = message => {
    console.log(`Received message ${message.id}:`);
    console.log(`\tData: ${message.data}`);
    //console.log(`\tAttributes: ${message.attributes}`);

    try {
        let msg = JSON.parse(message.data);
        // Pass the message on to all connected web clients
        io.emit(msg._event, msg);
    }
    catch (err) {
        console.log('Syntax error parsing JSON!');        
    }

    messageCount += 1;

    // "Ack" (acknowledge receipt of) the message
    message.ack();
};

// Listen for new messages 
subscription.on('message', messageHandler);
/*setTimeout(() => {
  subscription.removeListener('message', messageHandler);
  console.log(`${messageCount} message(s) received.`);
}, 60 * 1000);*/

// Socket.io
io.on('connection', function(socket){
    console.log('a user connected');
/*
    let msg = {
        "_event" : "averageTemperature",
        "_data" : 27.1
    };
    let msg = {
        "_event" : "sensorConfiguration",
        "_data" : {"sensors" : [
            {"sensorId" : 4,"active" : true},
            {"sensorId" : 0,"active" : true},
            {"sensorId" : 1,"active" : false},
            {"sensorId" : 2,"active" : true},
            {"sensorId" : 3,"active" : true}
        ]}
    };
    io.emit(msg._event, msg);*/

    socket.on('request_data', function () {
        console.log('data requested');
        const dataBuffer = Buffer.from('{}');
        pubsub
            .topic('projects/rsarte-iot/devices/rtist_demo_device/config')
            .publisher()
            .publish(dataBuffer)
            .then(messageId => {
                console.log(`Message ${messageId} published.`);
            })
        .catch(err => {
            console.error('ERROR:', err);
        });        
    });
});
