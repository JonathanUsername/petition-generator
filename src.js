require('babel-register')({
	presets: [ 'es2015' ]
});

import {execFile, spawn} from 'child_process';
import {createReadStream} from 'fs';

const express = require('express');
const app = express();

const getPetition = () => {
	const prom = new Promise((resolve, reject) => {
		const actions = createReadStream('actions.suff.txt')
		const random = spawn('gsort', ['-R'], { stdio: ['pipe'] })
		const markov = spawn('./markov');
		actions.pipe(random.stdin);
		random.stdout.pipe(markov.stdin);
		markov.stdout.on('data', data => {
			console.log(data.toString());
			resolve(data);
		})
	})
	return prom;
};

const clientSide = function() {
	var petitionSpace = document.getElementById('pet')
	var button = document.getElementById('getPet')
	button.onclick = function() {
		button.disabled = true;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'petition');
		xhr.send(null);
		xhr.onreadystatechange = function () {
		  var DONE = 4; // readyState 4 means the request is done.
		  var OK = 200; // status 200 is a successful return.
		  if (xhr.readyState === DONE) {
		    if (xhr.status === OK) {
					console.log(xhr.responseText)
		      petitionSpace.innerHTML = xhr.responseText; // 'This is the returned text.'
		    } else {
		      console.log('Error: ' + xhr.status); // An error occurred during the request.
		    }
				button.disabled = false;
			}
	  }
	}
}

const clientCode = () => {
	let arr = clientSide.toString().split('\n');
	arr.pop();
	arr.shift();
	return arr.join('\n');
}

app.get('/', function (req, res) {
	getPetition().then(data => {
		res.send(`
			<div style="margin:40px auto; max-width:50%;">
				<h1>GOV.UK Petition Generator</h1>
				<p id="pet">${data.toString()}</p>
				<button id="getPet">Get another petition</button>
			</div>
			<script>
				${clientCode()}
			</script>
			<style>
				button {

				}
			</style>
		`);
	});
});

app.get('/petition', function (req, res) {
	getPetition().then(data => {
		res.send(data);
	});
});

app.listen(3333, function () {
	console.log('Example app listening on port 3333!');
});
