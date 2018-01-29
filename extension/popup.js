var cs = new ChromeStore();
cs.init(1024 * 1024 * 1024);


document.addEventListener('DOMContentLoaded', () => {

	var enabled = document.getElementById('enabled');

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
					time: ''
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

	function disableExtension(time) {
		document.getElementById('wrapper').style.display = 'none';
		document.getElementById('disabled-extension').style.display = 'block';
		document.getElementById('time-untill').innerText = time.toString();
	}

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

	function hexToRgb(hex) {
    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    	return result ? {
       		red: parseInt(result[1], 16),
       		green: parseInt(result[2], 16),
       		blue: parseInt(result[3], 16)
    	} : null;
	}


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

				console.log(data);

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