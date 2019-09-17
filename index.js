let fs = require('fs')
let https = require('https')
let express = require('express');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let bcrypt = require('bcrypt');
let path = require('path');
let jwt = require('jsonwebtoken')
var WebSocket = require('ws');
var multer  = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'public/stickers')
  },
  filename: function (req, file, callback) {
    callback(null, Math.random().toString(13).replace('0.', '') + path.extname(file.originalname))
  }
})
 
var upload = multer({ storage: storage })

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = "mongodb+srv://thomasbarrett:foobar@iron-man-august-6l10q.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/triceratalk.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/triceratalk.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/triceratalk.com/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

let users = null;
let chats = null;
let stickers = null;

// Create Express Server
const app = express();

// Set Express Server Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('secret', 'pip-pip-cheerio');

  
// Create HTTP Server
const httpsServer = https.createServer(credentials, app);

/*==-----------------------------------------------------------------------==*\
| WEBSOCKETS MESSAGE FORWARDING
\*==-----------------------------------------------------------------------==*/

const wss = new WebSocket.Server({
    server: httpsServer,
    verifyClient: function (info, callback) {
        var token = info.req.headers['cookie'].split('=')[1];
        if (!token) {
            callback(false, 401, 'unauthorized');
        } else {
            jwt.verify(token, app.get('secret'), function (error, decoded) {
                if (error) {
                    callback(false, 401, 'unauthorized');
                } else {
                    info.req.user = decoded;
                    callback(true);
                }
            })
        }
    }
});
  
sockets = {};
  
wss.on('connection', function connection(ws, req) {
    // create a new entry in username -> socket mapping
    sockets[req.user.username] = ws
    
    // delete entry in username -> socket mapping
    ws.on('close', () => {
      delete sockets[req.user.username]
    });
  
    ws.on('message', (message) => {
        data = JSON.parse(message);
  
        switch (data.type) {
            case 'message':
                chats.updateOne(
                    { _id: new ObjectID(data.chat._id) },
                    { $push: { messages: data.message } }
                );
        
                // forward message to all recipients
                data.chat.members.forEach((username) => {
                    // do not forward message to sender
                    if (username != req.user.username) {
                        // recipient will have a socket if connected
                        recipientSocket = sockets[username];
                        // send message to recipient if connected
                        if (recipientSocket) {
                            recipientSocket.send(message);
                        }
                    }
                })
                break;
            case 'typing':
                data.chat.members.forEach((username) => {
                    if (username != req.user.username) {
                        recipientSocket = sockets[username];
                        if (recipientSocket) {
                            recipientSocket.send(message);
                        }
                    }
                });
                break;
            default: 
                console.log(data);
        }
    });
});

function createToken(user, duration) {

    const payload = {
      _id: user._id,
      username: user.username,
      admin: user.admin
    };
  
    return jwt.sign(payload, app.get('secret'), {
        expiresIn: duration
    });
}

// get an instance of the router for api routes
var APIRouter = express.Router();

// route middleware to verify a token
APIRouter.use(function(req, res, next) {
    if (req.cookies.token) {
        jwt.verify(req.cookies.token, app.get('secret'), function(error, decoded) {
            if (error) {
                return res.json({
                    success: false,
                    message: 'failed to authenticate token'
                });
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'failed to authenticate token'
        });
    }
});

// get an instance of the router for api routes
var StaticRouter = express.Router();

// route middleware to verify a token
StaticRouter.use(function(req, res, next) {
    if (req.cookies.token) {
        jwt.verify(req.cookies.token, app.get('secret'), function(error, decoded) {
            if (error) {
                res.sendFile(path.join(__dirname + '/public/login.html'));
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        res.sendFile(path.join(__dirname + '/public/login.html'));
    }
});

app.post('/api/logout', function(req, res) {
    res.cookie('token', '', {
        httpOnly: true,
        expire: 0
    }).json({
        success: true,
        message: 'logout successful',
    });
});


app.post('/api/authenticate', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    users.findOne({ username }, (error, user) => {
        if (error) {
            throw error;
        } else if (!user) {
            res.json({ success: false, message: `user not found: ${req.body.username}` });
        } else {
            bcrypt.compare(password, user.hash, (error, equal) => {
                if (error) {
                    throw error;
                } else if (equal) {
                    console.log(`login: ${username} ${password}`)
                    let token = createToken(user, 86400)
                    res.cookie('token', token, {
                        httpOnly: true,
                        expire: 86400
                    }).json({
                        success: true,
                        message: 'login successful',
                        token,
                        user
                    });
                } else {
                    res.json({ success: false, message: 'incorrect password' });
                }
            });  
        }
    });
});

app.post('/api/createaccount', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    // The username, password, and email fields are required for the creation of a user.
    if (username && password && email) {

        // Before creating a new account, we must ensure that the username does not
        // clash with any other usernames of any other users.
        users.findOne({ username }, (error, result) => {

            // If there is an internal error in searching the database, then we
            // should throw the error to the command line. This will result in HTTP
            // code 500 being returned to user. It is unclear if this is proper behavior
            if (error) {
                throw error;
            } 
            
            // If the database was successfully searched, but a user with the given
            // username was not found, then we should create a user with the given
            // information
            else if (!result) {
    
                bcrypt.hash(password, 10, function(err, hash) {
                    // construct user data information to be inserted into database
                    const user = {
                        username,
                        hash,
                        email, 
                        admin: false,
                    };


                    // insert a new user into the user database and return
                    // a cookie authenticated for the user that was just
                    // created
                    users.insertOne(user, (error, response) => {
                        if (error) {
                            throw error;
                        } else {
                            res.cookie('token', createToken(user, 86400), {
                                httpOnly: true,
                                expire: 86400
                            }).json({
                                success: true,
                                message: 'account created',
                                user
                            });
                        }
                    });
                });
            } else {
                res.json({
                    success: false,
                    message: 'username not available'
                });
            }
        });
    } else {
        res.json({
            success: false,
            message: 'invalid username, password, or email'
        });
    }
});

/*==-----------------------------------------------------------------------==*\
| API ROUTES - PROTECTED
\*==-----------------------------------------------------------------------==*/

app.use('/api', APIRouter);

app.get('/api/whoami', (req, res) => {
    users.findOne({_id: new ObjectID(req.user._id)}).then(result => {
        res.json({
            success: true,
            user: result
        });
    }).catch(error => {
        console.log(error);
    });
});

app.get('/api/users', (req, res) => {
    users.find({}).toArray().then(result => {
        res.json({success: true, users: result});
    }).catch(error => {
        console.log(error);
    });
});

app.get('/api/users/profile', (req, res) => {
    users.findOne(
        { _id: new ObjectID(req.user._id) },
    ).then(result => {
        res.json({success: true, profile: result});
    }).catch(error => {
        console.log(error);
    });
});

app.post('/api/users/profile', (req, res) => {
    users.updateOne(
        { _id: new ObjectID(req.user._id) },
        { ...req.body },
        { upsert: true }
    ).then(result => {
        res.json({success: true});
    }).catch(error => {
        console.log(error);
    });
});

app.post('/api/users/:username/friends', (req, res) => {

    if (req.user.username === req.params.username) {
        const friends = req.body.friends;
        users.updateOne({_id: new ObjectID(req.user._id)}, {$push: { friends: {$each: friends}}}).then(result => {
            res.json({ success: true });
        }).catch(error => {
            console.log(error);
        });
    } else {
      res.json({ success: false, message: 'error: permission denied' });
    }
});

app.post('/api/users/:username/chats', (req, res) => {
    users.updateOne({username: req.params.username},{
        $push: { chats: req.body.chat  }
    }).then(result => {
        res.json({ success: true });
    }).catch(error => {
        console.log(error);
    });
});

app.post('/api/users/password', (req, res) => {
    users.findOne({ _id: new ObjectID(req.user._id)}).then((result) => {
        bcrypt.compare(req.body.oldPassword, result.hash, (err, compareResult) => {
            if (err) {
                console.log(err);
            } else if (compareResult) {
                bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                    users.updateOne({
                        _id: new ObjectID(req.user._id)
                    }, { 
                        $set: {
                            hash
                        }
                    }).then(result => {
                        res.json({success: true});
                    }).catch(error => {
                        console.log(error);
                    });
                });
            } else {
                res.json({success: false, message: 'old password is incorrect'});
            }
        });    
    }).catch(error => {
        throw error;
    });
       
});

/*---------------------------------------------------------------------------*/

app.post('/api/chats', (req, res) => {
    chats.insertOne({
        name: req.body.name,
        members: req.body.members,
    }).then(result => {

        const chat = {
            _id: result.insertedId,
            name: req.body.name,
            members: req.body.members
        }

        req.body.members.forEach(member => {
            users.updateOne({username: member},{
                $push: { chats: chat  }
            }).catch(error => {
                console.log(error);
            });
        });

        res.json({
            success: true,
            chat: chat
        });

    }).catch(error => {
        console.log(error);
    })
});

app.get('/api/chats/:id', (req, res) => {
    chats.findOne({ _id: new ObjectID(req.params.id) }).then(result => {
        res.json({success: true, chat: result});
    }).catch(error => {
        console.log(error);
    });
});

/*---------------------------------------------------------------------------*/

app.get('/api/stickers', (req, res) => {
    stickers.find({}).toArray().then(result => {
        res.json({success: true, stickers: result});
    }).catch(error => {
        console.log(error);
    });
});

app.get('/api/stickers/:id', (req, res) => {
    stickers.findOne({_id: new ObjectID(req.params.id)}).then(result => {
        res.json({success: true, sticker: result});
    }).catch(error => {
        console.log(error);
    });
});

app.post('/api/stickers', upload.single('file'), (req, res) => {
    const path_components = req.file.path.split('/');
    path_components.shift();
    const path = path_components.join('/');

    stickers.insertOne({
        path: req.protocol + "://" + req.hostname + '/' + path
    }).then(result => {
        res.json({success: true, id: result.insertedId});
    }).catch(error => {
        console.log(error);
    });
});

app.put('/api/stickers/:id', (req, res) => {
    stickers.replaceOne({_id: new ObjectID(req.body._id)}, req.body).then(result => {
        res.json({success: true});
    }).catch(error => {
        console.log(error);
    });
});

app.delete('/api/stickers/:id', (req, res) => {
    stickers.deleteOne({_id: new ObjectID(req.params.id)}).then(result => {
        res.json({success: true});
    }).catch(error => {
        console.log(error);
    });
});
/*---------------------------------------------------------------------------*/

app.use('/styles', express.static(path.join(__dirname, 'public/styles')))
app.use('/components', express.static(path.join(__dirname, 'public/components')))
app.use('/stickers', express.static(path.join(__dirname, 'public/stickers')))

app.use(StaticRouter);
app.use(express.static(path.join(__dirname, 'public')))

// Connect to MongoDB Database
client.connect(error => {
    if (error) {
        console.log(error);
    } else {
        users = client.db("authentication").collection("users");
        chats = client.db("data").collection("chats");
        stickers = client.db("data").collection("stickers");
        httpsServer.listen(443, () => console.log('Iron-Man-August Server Initiated'));
    }
});
  