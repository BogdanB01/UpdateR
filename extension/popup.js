var cs = new ChromeStore();
cs.init(1024 * 1024 * 1024);


document.addEventListener('DOMContentLoaded', () => {

	var enabled = document.getElementById('enabled');


	/**
	* Gets current url in order to follow or unfollow link
	*/

	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    	var url = tabs[0].url;
		document.getElementById('hidden-url').innerText = url;

		chrome.storage.sync.get({list: []}, function(data){
			var found = false;
			for(var i = 0; i < data.list.length; i++){
				if(data.list[i].url == url) {
					found = true;
					enabled.innerText = 'Enabled on this site';
				}
			}
			if(found == false) {
				enabled.innerText = 'Disabled on this site';
			}
		});
	});


	/**
	*	Implements follow/unfollow mechanism. If the message is 'Disabled on this site' clicking on the label will add the link to followed links
	*/
	enabled.addEventListener('click', function() {
		var url = document.getElementById('hidden-url').innerText;
		chrome.storage.sync.get({list: []}, function(data) {
			
			if(enabled.innerText == 'Enabled on this site') {
				for(var i = 0; i < data.list.length; i++) {
					console.log(data.list[i].url);
					if(data.list[i].url == url) {
						data.list.splice(i, 1);
					}
				}
				cs.deleteDir('screenshots/'+getDirnameFromUrl(url), {recursive: true}, function() {
            	});

				enabled.innerText = 'Disabled on this site';
				
			} else if (enabled.innerText == 'Disabled on this site') {
				var newRecord = {
					url : url,
					time: getDate()
				};

				data.list.push(newRecord);
				
				cs.getDir('screenshots/'+getDirnameFromUrl(url), {create : true}, function() {
              		console.log('created url ')
                });
				enabled.innerText = 'Enabled on this site';
			}

			console.log(data.list);

			chrome.storage.sync.set({
                    list:data.list
            });
		});
		
	});

	//remove badge if it's the case
	chrome.browserAction.getBadgeText({}, function(result) {
		
		if(result != '') {
			document.getElementById('changes');

			chrome.browserAction.setBadgeText({text: ''});

			document.getElementById('changes-yes').style.display = 'block';

		}		

	});
	
	/**
	*	Checks if the extension is disabled. If it's disabled it will update the body of the extension
	*/
	chrome.storage.sync.get("disabled", function(data) {

		var now = new Date();
		var endTime = new Date(data.disabled.endDate);

		if(now < endTime) {
			console.log('extensia este oprita pentru moment');

			document.getElementById('wrapper').style.display = 'none';
			document.getElementById('disabled-extension').style.display = 'block';
			document.getElementById('time-untill').innerText = endTime.toString();

		} else {
			console.log('extensia nu este oprita');
		}

	});


	/**
	*	If the extension is disabled clicking on the enable-now button will update the body of the pop-up and enable the extension
	*/
	document.getElementById('stop-disabled').addEventListener('click', function() {

		document.getElementById('disabled-extension').style.display = 'none';
		document.getElementById('wrapper').style.display = 'block';

		//remove from storage
		var disabledDate = {
			'startDate' : new Date(),
			'endDate' : new Date()
		};
		
		disabledDate.startDate = disabledDate.startDate.toString();
		disabledDate.endDate   = disabledDate.endDate.toString();
		
		chrome.storage.sync.set({"disabled": disabledDate});

	});


	/**
	*	Changes the body of the popup between the 2 views: enabled and disabled
	*/ 
	function disableExtension(time) {
		document.getElementById('wrapper').style.display = 'none';
		document.getElementById('disabled-extension').style.display = 'block';
		document.getElementById('time-untill').innerText = time.toString();
	}


	/**
	*	Disables the extension for a time. The user can choose between 3 intervals: 10 minute, 1 hour, 1 day
	*/
	document.getElementById('disable-select').addEventListener('change', function() {
		
		var selectOption = document.getElementById('disable-select').value;

		var disabledDate = {
			'startDate' : new Date(),
			'endDate' : new Date()
		};

		if(selectOption == '10-minutes') {
			disabledDate.endDate.setMinutes(disabledDate.endDate.getMinutes() + 10);

			disabledDate.startDate = disabledDate.startDate.toString();
			disabledDate.endDate   = disabledDate.endDate.toString();

			disableExtension(disabledDate.endDate);
						
			chrome.storage.sync.set({"disabled" : disabledDate}, function(){
				console.log('saved');
       		});

		} else if (selectOption == '1-hour') {

			disabledDate.endDate.setMinutes(disabledDate.endDate.getMinutes() + 60);

			disabledDate.startDate = disabledDate.startDate.toString();
			disabledDate.endDate   = disabledDate.endDate.toString();

			disableExtension(disabledDate.endDate);
			
			chrome.storage.sync.set({"disabled" : disabledDate}, function(){
				console.log('saved');
       		});


		} else if (selectOption == '1-day') {

			disabledDate.endDate.setDate(disabledDate.endDate.getDate() + 1);
			
			disabledDate.startDate = disabledDate.startDate.toString();
			disabledDate.endDate   = disabledDate.endDate.toString();

			disableExtension(disabledDate.endDate);

			chrome.storage.sync.set({"disabled" : disabledDate}, function(){
				console.log('saved');
       		});

		}
 
	});

	/**
	*	Converts a hex value to a rgb value in order to be used by resemble
	* @param: hex - the hex value that will be converted
	* @return: the hex value converted to rgb
	*/

	function hexToRgb(hex) {
    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    	return result ? {
       		red: parseInt(result[1], 16),
       		green: parseInt(result[2], 16),
       		blue: parseInt(result[3], 16)
    	} : null;
	}


	/**
	*	Opens the diff page in a new window and display changes.
	*/
	document.getElementById('changes-yes').addEventListener('click', function() {

		//get color from chrome store
		chrome.storage.sync.get("color", function(data) {
			
			resemble.outputSettings({
				errorColor: hexToRgb(data.color)
			});

			var bgPage = chrome.extension.getBackgroundPage();
			var lastPhoto = bgPage.lastPhoto;
			var currentPhoto = bgPage.currentPhoto;

			var resembleControl = resemble(lastPhoto).compareTo(currentPhoto).onComplete(function(data) {
				var diffImage = new Image();
				diffImage.src = data.getImageDataUrl();

				newWindow = window.open();
				newWindow.document.write("<style type='text/css'>body {margin: 0;} .topright { position: absolute; top: 8px; right: 16px; }  p {display:none} </style>");
				

				newWindow.document.write("<img id='image' src='" + data.getImageDataUrl() + "'/>");
				newWindow.document.write("<div class='topright'> <button id='last'> Last Visit </button> <button id='current'> Current Photo </button> <button id='diff'> Diff Photo </button> </div>");
				newWindow.document.write("<p id='last-photo'>" + lastPhoto  + "</p>");
				newWindow.document.write("<p id='current-photo'>" + currentPhoto  + "</p>");
				newWindow.document.write("<p id='diff-photo'>" + diffImage.src  + "</p>");


				newWindow.document.write("<script type='text/javascript' src='test.js'></script>")
			
			});

		});		
	});

	function getDirnameFromUrl(url) {
       return url.replace(/\/|:|\?|"|\<|\>|\.|\*|\|/g, '_');
    }
});


/**
*	Pads a number with a specific number of zeroes
* @param: x - the number
* @param: n - number of zeroes
*/
function addZero(x,n) {
    while (x.toString().length < n) {
        x = "0" + x;
    }
    return x;
}

/**
* Gets date in friendly format
*/
function getDate() {
	var d = new Date();
	var day = addZero(d.getDate(), 2);
	var month = addZero(d.getMonth() + 1);
	var year = d.getFullYear();
	var hours = addZero(d.getHours(), 2);
	var minutes = addZero(d.getMinutes(), 2);
	var seconds = addZero(d.getSeconds(), 2);

	return day + "/" + month + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
}