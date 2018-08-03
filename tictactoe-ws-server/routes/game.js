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

                let newArr = await playTheGame(arr);

                setTimeout(() => {
                    ws.send(JSON.stringify({ player: "computer", game: newArr}));
                }, 500);
            } catch (e) {
                console.log("" + e)
                ws.send(JSON.stringify({ error: e }));
            };
        });

        ws.send(JSON.stringify({ player: "computer", game: [] }));
    });


    res.send({ status: "socket open" });
});


function playTheGame(arr) {
    return new Promise(async function(resolve ,reject) {
        try {
            let newArr = await preventLosing(arr);
            console.log(newArr[0]);
            if (!(newArr[0])) {
                newArr = await findEmptySpace(arr);
                console.log('plan B: ' + newArr);
            } else {
                newArr = newArr[1];
                console.log('plan A: ' + newArr);
            };
            resolve(newArr);
        } catch(e){
            reject(e);
        }
    });
}

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





function preventLosing(arr) {
    return new Promise((resolve) => {
        const conditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // colums
            [0, 4, 8], [2, 4, 6]             // diagonal 
        ];
        for (let condition of conditions) {
            if (arr[condition[0]] == 'X' && arr[condition[1]] == 'X' && arr[condition[2]] != '0' ||
                arr[condition[0]] == '0' && arr[condition[1]] == '0' && arr[condition[2]] != 'X') {
                resolveHere(2, condition);
                break;
            }
            if (arr[condition[1]] == 'X' && arr[condition[2]] == 'X' && arr[condition[0]] != '0' ||
                arr[condition[1]] == '0' && arr[condition[2]] == '0' && arr[condition[0]] != 'X') {
                resolveHere(0, condition);
                break;
            }
            if (arr[condition[0]] == 'X' && arr[condition[2]] == 'X' && arr[condition[1]] != '0' ||
                arr[condition[0]] == '0' && arr[condition[2]] == '0' && arr[condition[1]] != 'X') {
                resolveHere(1, condition);
                break;
            }
        }
        resolve([false, arr]);

        function resolveHere(i, condition) {
            if (arr[arr[condition[i]]] != 'X' && arr[arr[condition[i]]] != '0') {
                arr[condition[i]] = '0';
                console.log(condition[i]);
            }
            resolve([true, arr]);
        }
    });
}




module.exports = router;