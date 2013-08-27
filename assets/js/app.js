// ============
// HELPERS
// ============


function $(expr) { return d.querySelector(expr); }

function k(c, f, p){
	if (w.c === c) f(p);
}

Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString(),
	mm = (this.getMonth()+1).toString(), // getMonth() is zero-based
	dd  = this.getDate().toString();
	return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
};

String.prototype.toDate = function(){
	return this.substring(0,4) + "," + this.substring(4,6) + "," + this.substring(6,8);
};

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
	todayStr = today.yyyymmdd(),
	todayInt = parseInt(todayStr),
	initDate = 20130828,
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
		hash = (hash.match(/^\d{8}/)) ? hash : loaded,
		hashInt = parseInt(hash);

	if((hashInt < todayInt && param == 1) || (hashInt > initDate && param == -1)){
		result = (hash) ? new Date(hash.toDate()) : today;
		result.setDate(result.getDate() + param);

		w.location.hash = result.yyyymmdd();
	}
}

function setHash(param){
	if(param){
		w.location.hash = param;
	} else {
		hash = w.location.hash.replace("#","");
		if(!hash || !hash.match(/^(\d{8}|about)/)){
			w.location.hash = todayInt;
		}
	}
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function load(what){
	if (w.XMLHttpRequest){ // Firefox
		xhr = new XMLHttpRequest();
	} else if (w.ActiveXObject){ // Internet Explorer
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		return;
	}

	xhr.open("GET", what, false);
	xhr.send(null);

	if (xhr.readyState == 4){
		if(xhr.status == 200){
			return xhr.responseText;
		} else {
			//info("nf");
		}
	}
}

function run(){

	var xhr = null,
		id = w.location.hash.replace("#","");

	$("section").innerHTML = "";
	drawFavicon("");

	switch(id){
		case "random":
			id = randomDate(new Date(2013, 7, 28), new Date()).yyyymmdd();
			break;
		case "today":
	 		id = todayStr;
	 		break;
		default:
			id = id;
	}

	if(id.match(/^\d{8}$/)){
		loaded = id;
		drawFavicon(id.substring(6,8));
		content = load("quotes/" + id + ".md");
		$("section").innerHTML = converter.makeHtml(content);
	}
	else if(id.match(/^about$/)){
		content = load(id + ".md");
		$("section").innerHTML = content;
	}

	$("nav").style.display = (id.match(/^about$/)) ? "none" : "block";
	$("[alt=Previous]").style.opacity = (id.match(/^\d{8}$/) && id == initDate) ? 0 : 0.6 ;
	$("[alt=Next]").style.opacity = (id.match(/^\d{8}$/) && id == todayInt) ? 0 : 0.6 ;
}

function drawFavicon(day) {
	// Génération du canvas
	ctx.clearRect(0, 0, 16, 16);

	ctx.beginPath();
	ctx.arc(8,8,8,0,2*Math.PI, false); //ctx.arc(x,y,radius,startAngle,endAngle, anticlockwise);
	ctx.fillStyle = "#272d70";
	ctx.fill();

	ctx.fillStyle = "#fff";
	ctx.font = "6pt Arial";
	ctx.fillText(day, 4, 11);

	// Génération du lien
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

w.onhashchange = function() {
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