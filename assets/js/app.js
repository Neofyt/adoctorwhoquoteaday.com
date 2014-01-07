// ============
// HELPERS
// ============


function $(expr) { return d.querySelector(expr); }

function k(c, f, p){
	if (w.c === c) f(p);
}

Date.prototype.getDOY = function(){
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((this - onejan) / 86400000);
}

// Browser sniffing
var ua = (function(){
	var agent = navigator.userAgent.toLowerCase();
	return function(browser){
		return agent.indexOf(browser) !== -1;
	};
}());

var browser = {
	ie: ua('msie'),
	chrome: ua('chrome'),
	webkit: ua('chrome') || ua('safari'),
	safari: ua('safari') && !ua('chrome'),
	mozilla: ua('mozilla') && !ua('chrome') && !ua('safari')
};


// ============
// VARIABLES
// ============


var d = document,
	w = window,
	converter = new Showdown.converter(),
	today = new Date(),
	todayInt = today.getDOY(),
	content,
	loaded,
	canvas = d.getElementsByTagName('canvas')[0],
	ctx = canvas.getContext('2d');

canvas.width = canvas.height = 16;


// ============
// FUNCTIONS
// ============


function navDate(param){
	var hash = w.location.hash.replace("#",""),
		hash = (hash.match(/^\d{1,3}$/)) ? hash : loaded,
		hashInt = parseInt(hash);

	if((hashInt < todayInt && param == 1) || (hashInt > 1 && param == -1)){
		result = (hash) ? parseInt(hash) : todayInt;

		w.location.hash = result + param;
	}
}

function setHash(param){
	if(param){
		w.location.hash = param;
	} else {
		hash = w.location.hash.replace("#","");
		if(!hash || !hash.match(/^(\d{1,3}|about|today)$/) || (hash.match(/^\d{1,3}$/) && parseInt(hash) > todayInt)) {
			w.location.hash = todayInt;
		}
	}
}

function randomDay(){
	return Math.floor(Math.random() * todayInt) + 1;
}

function load(what){
	if (w.XMLHttpRequest){
		xhr = new XMLHttpRequest();
	} else if (w.ActiveXObject){ // Internet Explorer
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		return "_&nbsp;_ _This site is not compatible with your browser. Sorry._";
	}

	xhr.open("GET", what, false);
	xhr.send(null);

	if (xhr.readyState == 4){
		if(xhr.status == 200){
			return xhr.responseText;
		} else {
			return "_&nbsp;_ _Quote not found._";
		}
	}
}

function run(){
	setHash();

	var xhr = null,
		id = w.location.hash.replace("#",""),
		idInt;

	$("section").innerHTML = "";
	drawFavicon("");

	switch(id){
		case "random":
			id = randomDay().toString();
			break;
		case "today":
	 		id = todayInt.toString();
	 		break;
		default:
			id = id;
	}

	idInt = parseInt(id);

	if(id.match(/^\d{1,3}$/)){
		loaded = id;
		drawFavicon(id);
		content = load("quotes/" + id + ".md");
		$("section").innerHTML = converter.makeHtml(content);
	}
	else if(id.match(/^about$/)){
		content = load("readme.md");
		$("section").innerHTML = content;
	}

	$("nav").style.display = (id.match(/^about$/)) ? "none" : "block";
	$("[alt=Previous]").style.opacity = (id.match(/^\d{1,3}$/) && idInt == 1) ? 0 : 0.6 ;
	$("[alt=Next]").style.opacity = (id.match(/^\d{1,3}$/) && idInt == todayInt) ? 0 : 0.6 ;
}

function drawFavicon(n){

	ctx.clearRect(0, 0, 16, 16);

	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, 16, 3);
	ctx.fillStyle = "#272d70";
	ctx.fillRect(0, 3, 16, 13);

	if (n !== ""){
		n = n[2] ? n : "0" + (n[1] ? n : "0" + n[0]);
	}

	ctx.fillStyle = "#fff";
	ctx.font = "6pt Arial";
	ctx.fillText(n, 2, 12);

	if (browser.chrome){
		$('[rel="shortcut icon"]').setAttribute("href", canvas.toDataURL());
	} else {
		var link = d.createElement('link'),
			oldLink = $('[rel="shortcut icon"]');
		link.type = "image/png";
		link.rel = "shortcut icon";
		link.href = canvas.toDataURL();
		if (oldLink) {
			d.head.removeChild(oldLink);
		}
		d.head.appendChild(link);
	}
}


// ============
// EVENTS
// ============


d.onkeyup = function(e){
	e.preventDefault();
	w.c = e.keyCode;

	k(37, navDate, -1); // Left
	k(39, navDate, 1); // Right
};

w.onhashchange = function(){
	run();
};

w.onload = function(){
	run();
};

$("[alt=Previous]").onclick = function(){
	navDate(-1);
};

$("[alt=Next]").onclick = function(){
	navDate(1);
};

$("[href='#random']").onclick = function(){
	run();
};




// ==================
// RUN YOU CLEVER BOY
// ==================

setHash();