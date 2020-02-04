const express = require('express');
const app = express();
const formidable = require('formidable');
const http = require('http').Server(app);
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const io = require('socket.io')(http);

const MongoClient = require('mongodb').MongoClient; 
var  ObjectID = require('mongodb').ObjectID;

const URL = 'mongodb://localhost:27017';
const PORT = 3000;
const DB_NAME = 'chatroom';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../chatroom/dist/chatroom/')));
app.use('/userimages', express.static(path.join(__dirname, '/images')));


MongoClient.connect(URL, {poolSize:10, useNewUrlParser: true, useUnifiedTopology: true},
  function(err, client) {
    if (err) return console.log("CANNOT CONNECT TO MONGODB:",err);
    const db = client.db(DB_NAME);
        
    require('./routes/auth.js')(db, app, ObjectID);
    require('./routes/user.js')(db, app, ObjectID, formidable);
    require('./routes/channel.js')(db, app, ObjectID);
    require('./routes/group.js')(db, app, ObjectID);
    require('./functions/global.js');

    // const message = require('./routes/message.js'); //(db, app, ObjectID);
    // message.connect(io, PORT);

    const chat = require('./routes/channelchat.js'); //(db, app, ObjectID);
    chat.connect(db, ObjectID, io);

    require('./listen.js')(PORT, URL, http);
});