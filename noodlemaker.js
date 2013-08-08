// Required modules:
// npm install request ejs connect

var http = require('http');
var request = require('request'); // npm
var ejs = require('ejs'); // npm
var connect = require('connect'); // npm
var fs = require('fs');

var waved = '%3Csvg%20version%3D%221.1%22%20id%3D%22wave%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2246px%22%20height%3D%2228px%22%20viewBox%3D%220%200%2046%2028%22%20enable-background%3D%22new%200%200%2046%2028%22%20xml%3Aspace%3D%22preserve%22%3E%0A%3Cpath%20id%3D%22shape-wave%22%20d%3D%22M0%2C12.144c4.052%2C0%2C8.107%2C1.021%2C10.775%2C3.064c6.171%2C4.729%2C18.282%2C4.731%2C24.453%2C0c2.668-2.043%2C6.72-3.064%2C10.773-3.064v-2.9%20c-4.57%2C0-9.141%2C1.181-12.226%2C3.543c-5.335%2C4.09-16.209%2C4.092-21.547%2C0C9.142%2C10.425%2C4.571%2C9.244%2C0%2C9.244V12.144z%22';
var dashed = '%3Csvg%20version%3D%221.1%22%20id%3D%22dash%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2246px%22%20height%3D%2228px%22%20viewBox%3D%220%200%2046%2028%22%20enable-background%3D%22new%200%200%2046%2028%22%20xml%3Aspace%3D%22preserve%22%3E%3Crect%20id%3D%22shape-dash%22%20y%3D%2212.05%22%20width%3D%2221.73%22%20height%3D%223.9%22'
var dotted = '%3Csvg%20version%3D%221.1%22%20id%3D%22dot%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20width%3D%2246px%22%20height%3D%2228px%22%20viewBox%3D%220%200%2046%2028%22%20enable-background%3D%22new%200%200%2046%2028%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20id%3D%22shape-dot%22%20d%3D%22M0%2C14c0-2.754%2C2.245-5%2C5-5l0%2C0c2.772%2C0%2C5%2C2.245%2C5%2C5l0%2C0c0%2C2.772-2.228%2C5-5%2C5l0%2C0C2.245%2C19%2C0%2C16.772%2C0%2C14z%22'

// Read our template from the disk
var template = fs.readFileSync(__dirname + '/views/noodlemaker.html', 'utf8');
console.log('Loaded template: ' + template);

// Make an empty array of layer
var layers = [];

// Define the path to our database file, and read the database if it exists
var dbPath = __dirname + '/db/db.json';
if (fs.existsSync(dbPath)) {
    db = fs.readFileSync(dbPath, 'utf8');
    layers = JSON.parse(db);
};

// Create a Connect server
var server = connect();

// Enable Connect's static server middleware to respond automatically to requests for any static assets
// in the public folder
server.use(connect.static(__dirname + '/public'));
server.use(connect.static(__dirname + '/assets'));

// Enable Connect's query parameter parsing middleware
server.use(connect.query());

// Set up our own function to respond to any other requests
server.use(function(serverRequest, serverResponse) {

    // We received a request from a web browser
    console.log('Got request for ', serverRequest.url);

    // Send status code and headers
    serverResponse.writeHead(200, {'Content-Type': 'text/html'});

     if (serverRequest.query.angle && serverRequest.query.times &&
            serverRequest.query.angle >= 0 && serverRequest.query.angle <= 999 &&
            serverRequest.query.times >= 1 && serverRequest.query.times <= 99) {

        // Save the form input to the array.
        layers.push({
            createdBy: serverRequest.query.createdBy,
            linetype: serverRequest.query.linetype,
            swatch: serverRequest.query.swatch,
            angle: serverRequest.query.angle,
            times: serverRequest.query.times
        })

        // And write the array out to disk.
        fs.writeFileSync(dbPath, JSON.stringify(layers));

        }
    
    // Process our template and send the resulting HTML to the web browser
    serverResponse.write(ejs.render(template, {
        layers: layers, waved: waved, dashed: dashed, dotted: dotted
    }));

    // Hang up on the client, we're done. This is fundamental to HTTP.
    console.log('Finshed sending response to web browser');
    serverResponse.end();

});

// Begin listening for requests on port 4000
console.log('Listening');
server.listen(4000);