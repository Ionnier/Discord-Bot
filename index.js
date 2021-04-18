const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
require('dotenv').config();
const {
    sign
} = require('crypto');

var rolldata = JSON.parse(fs.readFileSync('./bets.json', 'utf-8'));
var rooms = JSON.parse(fs.readFileSync('./rooms.json', 'utf-8'));;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content === 'ping') {
        msg.reply('pong');
    }

    // Rolling
    if (msg.content.startsWith('roll')) {
        let str = msg.content;
        const words = str.split(' ');
        if ((words[1] === "red" || words[1] == "black" || words[1] === "green") && words[3] == undefined) {
            var bet = parseInt(words[2], 10);
            if (words[2] === undefined) {
                msg.channel.send(`Wrong command ${msg.author}, assuming 100 credits.`)
                bet = 100;
            }
            if (!rolldata[msg.author.id]) {
                rolldata[msg.author.id] = {
                    points: 1000
                }
            }

            if (rolldata[msg.author.id].points < bet) {
                msg.channel.send('Not enough credits ' + `${msg.author}` + '.');
            } else {
                let valid = 0;
                let number = Math.floor(Math.random() * Math.floor(65489234123)) % 15;
                if (number >= 1 && number <= 7 && words[1] === "red") {
                    valid = 1;
                    rolldata[msg.author.id].points += bet;
                    msg.channel.send('You won' + `${msg.author}` + '.' + ` A cazut ${number}.` + ` You have ${rolldata[msg.author.id].points} points`);
                }
                if (number >= 8 && number <= 14 && words[1] === "black") {

                    valid = 1;
                    rolldata[msg.author.id].points += bet;
                    msg.channel.send('You won' + `${msg.author}` + '.' + ` A cazut ${number}.` + ` You have ${rolldata[msg.author.id].points} points`);
                }
                if (number === 0 && words[1] == "green") {

                    valid = 1;
                    rolldata[msg.author.id].points += (14 * bet);
                    msg.channel.send('You won' + `${msg.author}` + '.' + ` A cazut ${number}.` + ` You have ${rolldata[msg.author.id].points} points`);
                }
                if (valid === 0) {

                    rolldata[msg.author.id].points -= words[2];
                    msg.channel.send('You won' + `${msg.author}` + '.' + ` A cazut ${number}.` + ` You have ${rolldata[msg.author.id].points} points`);
                }
                fs.writeFile('./bets.json', JSON.stringify(rolldata), (err) => {
                    if (err) console.error(err);
                })
            }
        } else if ((words[1] === "red" || words[1] == "black" || words[1] === "green") && words[3] == "room") {

            var roomnumber = null;
            let depariat = 0;
            outer_loop:
            for (const propriety in rooms) {
                for (var i = 0; i < rooms[propriety].participants.length; i++) {
                    if (rooms[propriety].participants[i] === msg.author.id) {
                        if (rooms[propriety].bets.length === 0) {
                            setTimeout(() => {
                                let valid = 0;
                                let number = Math.floor(Math.random() * Math.floor(65489234123)) % 15;
                                let atleastwin = 0;
                                let atleastlose = 0;
                                let winners = `Chosen ${number}. Winners from ${propriety} are`;
                                let loser = `People who lost from ${propriety}`;
                                for (var i = 0; i < rooms[roomnumber].participants.length; i++) {
                                    if (rooms[roomnumber].bets[i] != null) {
                                        bet = rooms[roomnumber].bets[i];
                                        if (!rolldata[rooms[roomnumber].participants[i]]) {
                                            rolldata[rooms[roomnumber].participants[i]] = {
                                                points: 1000
                                            }
                                        }
                                        if (rolldata[rooms[roomnumber].participants[i]].points < bet) {
                                            msg.channel.send('Lost ' + `<@${rooms[roomnumber].participants[i]}>` + '.');
                                        } else {
                                            valid = 0;
                                            if (number >= 1 && number <= 7 && rooms[roomnumber].colors[i] === "red") {
                                                valid = 1;
                                                rolldata[rooms[roomnumber].participants[i]].points += parseInt(bet, 10);
                                                winners = winners + `<@${rooms[roomnumber].participants[i]}> (${rolldata[rooms[roomnumber].participants[i]].points})`;
                                                atleastwin = 1;
                                            }
                                            if (number >= 8 && number <= 14 && rooms[roomnumber].colors[i] === "black") {

                                                valid = 1;
                                                rolldata[rooms[roomnumber].participants[i]].points += parseInt(bet, 10);
                                                winners = winners + `<@${rooms[roomnumber].participants[i]}> (${rolldata[rooms[roomnumber].participants[i]].points})`
                                                atleastwin = 1;
                                            }
                                            if (number === 0 && rooms[roomnumber].colors[i] == "green") {

                                                valid = 1;
                                                rolldata[rooms[roomnumber].participants[i]].points += (14 * parseInt(bet, 10));
                                                winners = winners + `<@${rooms[roomnumber].participants[i]}> (${rolldata[rooms[roomnumber].participants[i]].points})`
                                                atleastwin = 1;
                                            }
                                            if (valid === 0) {

                                                rolldata[rooms[roomnumber].participants[i]].points -= parseInt(bet, 10);
                                                loser = loser + ` <@${rooms[roomnumber].participants[i]}>(${rolldata[rooms[roomnumber].participants[i]].points})`
                                                atleastlose = 1;

                                            }
                                        }
                                    }
                                }


                                rooms[roomnumber].bets = [];
                                rooms[roomnumber].colors = [];
                                if (atleastwin) msg.channel.send(winners);
                                if (atleastlose) msg.channel.send(loser);
                                fs.writeFile('./bets.json', JSON.stringify(rolldata), (err) => {
                                    if (err) console.error(err);
                                })
                                fs.writeFile('./rooms.json', JSON.stringify(rooms), (err) => {
                                    if (err) console.error(err);
                                });
                            }, 5000)
                        }
                        rooms[propriety].bets[i] = words[2];
                        rooms[propriety].colors[i] = words[1];
                        roomnumber = propriety;
                        fs.writeFile('./rooms.json', JSON.stringify(rooms), (err) => {
                            if (err) console.error(err);
                        });
                        break outer_loop;
                    }
                }
            }

        } else if (words[1] === "incarcare") {
            if (!rolldata[msg.author.id]) {
                rolldata[msg.author.id] = {
                    points: 1000
                };
                msg.channel.send(`No data ${msg.author}.`);
                fs.writeFile('./bets.json', JSON.stringify(rolldata), (err) => {
                    if (err) console.error(err);
                });
            } else {
                if (rolldata[msg.author.id].points <= 750) {
                    rolldata[msg.author.id].points += 1000;
                    msg.channel.send(`Added coins to ${msg.author}. You have ${rolldata[msg.author.id].points} points.`);
                    fs.writeFile('./bets.json', JSON.stringify(rolldata), (err) => {
                        if (err) console.error(err);
                    });
                } else {
                    msg.channel.send(`You can't access this function ${msg.author}`);
                }
            }


        } else if (words[1] === "room") {
            if (words[2] === undefined) {
                for (const propriety in rooms) {
                    for (var i = 0; i < rooms[propriety].participants.length; i++) {
                        if (rooms[propriety].participants[i] === msg.author.id) {
                            rooms[propriety].participants.splice(i, 1);
                        }
                    }
                }
                let id = require("crypto").randomBytes(3).toString('hex');
                rooms[id] = {
                    participants: [msg.author.id],
                    bets: [],
                    colors: []
                }
                msg.channel.send(`Your private room is ${msg.author}, invite code: ${id}.`);
                fs.writeFile('./rooms.json', JSON.stringify(rooms), (err) => {
                    if (err) console.error(err);
                });
            } else {
                for (const propriety in rooms) {
                    if (propriety != words[2]) {
                        for (var i = 0; i < rooms[propriety].participants.length; i++) {
                            if (rooms[propriety].participants[i] === msg.author.id) {
                                rooms[propriety].participants.splice(i, 1);
                                rooms[propriety].bets.splice(i, 1);
                                rooms[propriety].colors.splice(i, 1);
                            }
                        }
                    }
                }
                let da = 1;
                for (var i = 0; i < rooms[words[2]].participants.length; i++) {
                    if (rooms[words[2]].participants[i] === msg.author.id) {
                        msg.channel.send(`Can't join when you are already here, it would be wierd ${msg.author}.`);
                        da = 0;
                    }
                }
                if (da) {
                    rooms[words[2]].participants.push(msg.author.id);
                }
                fs.writeFile('./rooms.json', JSON.stringify(rooms), (err) => {
                    if (err) console.error(err);
                });



            }

        } else if (words[1] === undefined) {
            msg.channel.send(`Close... ${msg.author}`);
            msg.delete;
        } else if (words[1] === "help") {
            msg.channel.send(`Roullete game, you specify the color and the number of points. Ex. roll red 300. 15 numbers which can be picked, 0 is green and the points returned are 14*bet, if you win on either red or black you get double. If you lose, you lose the points. Multi-betting not supported. Exemples: Exemple comenzi: \n - roll red 300 \n - roll room - create a room and you join it \n - roll room [room number] - join room via invite code \n - roll red 300 room - bet in a room . \n\n Use in the logical order, no errors treated.`)
        } else {
            msg.channel.send('Wrong command ' + `${msg.author}` + '.');
        }
        msg.delete();


    }

});

client.login(process.env.DISCORD_TOKEN);