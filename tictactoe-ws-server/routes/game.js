var express = require('express');
var router = express.Router();
var WebSocketServer = require('ws').Server;

router.get('/opensocket', function (req, res, next) {


    var wss = new WebSocketServer({ port: 8888 });

    wss.on('connection', function (ws) {

        ws.on('message', async function incoming(msg) {
            console.log('Received:' + msg);
            var arr = JSON.parse(msg).game;
            try {
                let newArr = await findEmptySpace(arr);
                console.log("" + newArr);
                setTimeout(()=>{
                    ws.send(JSON.stringify({ player: "computer", game: newArr, date: new Date() }));
                },500);
            } catch (e) {
                console.log("" + e)
                ws.send(JSON.stringify({ error: e }));
            };
        });

        ws.send(JSON.stringify({ player: "computer", game: [] }));
    });


    res.send({ status: "socket open" });
});




function findEmptySpace(arr) {

    return new Promise((resolve, reject) => {
        let stepsToGet = 0;
        let readyToInsert = [];
        findReadies();

        let chosenSpot = randomWithRange(0, readyToInsert.length - 1);
        if (arr[chosenSpot] === null) {
            arr[chosenSpot] = "0";
            resolve(arr);
        } else {
            planB();
        };


        function planB() {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === null) {
                    arr[i] = "0";
                    resolve(arr);
                    break;
                } else {
                    if (i === arr.length - 1) {
                        reject("end");
                        break;
                    };
                }
            }
        };


        function findReadies() {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === null) {
                    readyToInsert.push(stepsToGet);
                };
                stepsToGet++;
            };
        };

    });
};


function randomWithRange(min, max) {
    let range = (max - min) + 1;
    return Math.floor(Math.random() * range) + min;
};



module.exports = router;