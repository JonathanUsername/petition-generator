'use strict';

var _child_process = require('child_process');

var _fs = require('fs');

require('babel-register')({
	presets: ['es2015']
});

var express = require('express');
var app = express();

var getPetition = function getPetition() {
	var prom = new Promise(function (resolve, reject) {
		var actions = (0, _fs.createReadStream)('actions.suff.txt');
		var random = (0, _child_process.spawn)('sort', ['-R'], { stdio: ['pipe'] });
		var markov = (0, _child_process.spawn)('./markov');
		actions.pipe(random.stdin);
		random.stdout.pipe(markov.stdin);
		markov.stdout.on('data', function (data) {
			console.log(data.toString());
			resolve(data);
		});
	});
	return prom;
};

var clientSide = function clientSide() {
	var petitionSpace = document.getElementById('pet');
	var button = document.getElementById('getPet');
	button.onclick = function () {
		button.disabled = true;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'petition');
		xhr.send(null);
		xhr.onreadystatechange = function () {
			var DONE = 4; // readyState 4 means the request is done.
			var OK = 200; // status 200 is a successful return.
			if (xhr.readyState === DONE) {
				if (xhr.status === OK) {
					console.log(xhr.responseText);
					petitionSpace.innerHTML = xhr.responseText; // 'This is the returned text.'
				} else {
					console.log('Error: ' + xhr.status); // An error occurred during the request.
				}
				button.disabled = false;
			}
		};
	};
};

var clientCode = function clientCode() {
	var arr = clientSide.toString().split('\n');
	arr.pop();
	arr.shift();
	return arr.join('\n');
};

app.get('/', function (req, res) {
	getPetition().then(function (data) {
		res.send('\n\t\t\t<div style="margin:40px auto; max-width:50%;">\n\t\t\t\t<h1>GOV.UK Petition Generator</h1>\n\t\t\t\t<p id="pet">' + data.toString() + '</p>\n\t\t\t\t<button id="getPet">Get another petition</button>\n\t\t\t</div>\n\t\t\t<script>\n\t\t\t\t' + clientCode() + '\n\t\t\t</script>\n\t\t\t<style>\n\t\t\t\tbutton {\n\n\t\t\t\t}\n\t\t\t</style>\n\t\t');
	});
});

app.get('/petition', function (req, res) {
	getPetition().then(function (data) {
		res.send(data);
	});
});

app.listen(4567, function () {
	console.log('Example app listening on port 4567!');
});
