const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require("body-parser");
const fs = require('fs');
const mysql = require('mysql');

// TODO info
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "devops"
});

const users = {}

function loggerMiddleware(req, res, next) {
    console.log(`New request received :
        <== [${req.method}] ${req.originalUrl}`);
    next();
}
app.use(loggerMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));

function errorHandlerMiddleware(err, req, res, next) {
    console.error(err);
    res.status(500).send(err);
}


// TODO PATH
// watch if repository change (add file)
fs.watch('../Generateur/json_file', (eventType, filename) => {
    if(eventType == 'change'){
        if (filename) {
            console.log(filename)
            // if change, read the new file
            fs.readFile('../Generateur/json_file/' + filename, 'utf8', function(err, contents) {
                json = JSON.parse(contents);
                con.connect(function(err) {
                    var sql ="INSERT INTO `uniteproduction` (`id`, `numUnite`, `numAutomate`, `typeAutomate`, `tempCuve`, `tempExt`, `poindsLaitCuve`, `poidsProduitFini`, `mesurePH`, `mesureK`, `concNaCl`, `nivBactSalmonelle`, `nivBactEColi`, `nivVactListeria`, `timestamp`) VALUES (NULL," + json.NumeroUnite + 
                        ",  " + json.NumeroAutomate + ",  '" + json.TypeAutomate + "',  " + json.TemperatureCuve + ",  " + json.TemperatureExterieure + ",  " + json.PoidsDuLaitEnCuve + 
                        ",  " + json.PoidsDuProduitFiniRealise + ",  " + json.MesurePH + ",  " + json.MesureK + ",  " + json.concentrationDeNaCl + ",  " + json.NiveauBacterienSalmonelle +
                        ",  " + json.NiveauBacterienEcoli + ",  " + json.NiveauBacterienListeria + ",  " + json.timestamp + ");"
                    // insert into the bdd the new data
                    con.query(sql, function (err, result) {
                        if (err) throw err;
                        console.log("1 unite production inserted");
                    });
                    // new request for all data
                    con.query("SELECT * FROM uniteproduction LIMIT 20", function (err, result, fields) {
                        con.on('error', function(err) {
                            console.log("[mysql error]",err);
                            });
                        //DATA
                        const dataItem = result
                        //Sockets
                        console.log(dataItem)
                        //emit on home page
                        io.sockets.on('connection', function(socket){
                            socket.on('upcanvas', function(dataItem){
                                socket.broadcast.emit('data', dataItem);
                            });
                        });
                    });
                });
            });
        }
    }
});


// io.on('connection', socket => {
//     users[socket.id] = 'Anonyme'
//     // console.log('user connected : ', users)
//     io.emit('users', users)
//     socket.on('loaded', (data) => {
//         // console.log('data from client : ', data)
//     })
//     socket.on('message', (data) => {
//         // console.log('message received', data)
//         users[socket.id] = data[0]
//         if(data[2] == ''){
//             //Si il n'y a pas de message de privé
//             // console.log('Tous le monde')
//             socket.broadcast.emit('message', '<p>' + data[0] + ' : ' + data[1] + '</p>')
//         }else{
//             //Si il y a un message privé
//             // console.log(data[2])
//             socket.to(data[2]).emit('message', '<p>' + data[0] + ' : ' + data[1] + '</p>')
//         }
//     })
// })

//ROUTING
app.get('/', (req, res) => {
    res.sendfile('./views/index.html') 
})
//JS 
app.get('/js/scripts.js', (req, res) => {
    res.sendfile('./js/scripts.js') 
})
//CSS
app.get('/css/styles.css', (req, res) => {
    res.sendfile('./css/styles.css') 
})

app.use(errorHandlerMiddleware);

http.listen(3000, () => {
    console.log('Server is up and running on http://localhost:3000')
})