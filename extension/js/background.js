var cs;


/**
*	Checks if the page that user is currently on is followed (it's present in url manager table)
* @return: true if it's in the table or false otherwise
*/
function checkIfUrlIsFollowed() {
	return new Promise((resolve, reject) => {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.storage.sync.get({list: []}, function(data){
				for(var i = 0; i < data.list.length; i++){
					if(data.list[i].url == tab.url) {
						resolve(true);
					}
				}
				resolve(false);
			});
		});
	});
}

/**
*	Checks if a file exists in a specific directory
* @param: dirname - directory name where we search the file
* @param: filename - the name of the file that we searh
* @return: true if the file exists in that directory, false otherwise
*/

function checkIfFileExists(dirname, filename) {
	return new Promise((resolve, reject) => {
		cs.ls('screenshots/' + dirname, function(arr) {
			var length = arr.length;
			for(var i = 0; i < length; i++) {
				if(arr[i].name == filename) {
					resolve(true);
				}
			}
			resolve(false);
		});	
	});
}


/**
*	Replaces special characters from an url with "_" to form a valid directory name
*/
function getDirnameFromUrl(url) {
    return url.replace(/\/|:|\?|"|\<|\>|\.|\*|\|/g, '_');
}


/**
*	Checks if a page is updated
* @param: dirname - specific directory for followed url
* @param: image - base64 encoded screenshot of the page. 
* @return: true if the page is updated, false otherwise. The page is updated if current image is different from "last.png" image. If the image is different we update last.png with the new source
*/
function isUpdated(dirname, image) {

	return new Promise((resolve, reject) => {
		checkIfFileExists(dirname, 'last.png').then(function(result) {
			if(result == true) {

				//read last.png and see if the photos are the same
				cs.readFile('screenshots/' + dirname + '/last.png', function(data) {
					

					//console.log(data);

					if(data == image) {
						console.log('imaginea e la fel');
						return resolve(false);
					} else {
						console.log('imaginea nu e la fel');

						//update last.png

						cs.deleteFile('screenshots/' + dirname + '/last.png', function() {
							cs.getFile('screenshots/' + dirname + '/last.png', {create: true, exclusive: true}, function() {
								cs.write('screenshots/' + dirname + '/last.png', 'image/png', image, {create: false});
							});
						});
						
						resolve(true);
					}
					

				}); 

			} else { 
				//create last.png image
				cs.getFile('screenshots/' + dirname + '/last.png', {create: true, exclusive: true}, function() {
					cs.write('screenshots/' + dirname + '/last.png', 'image/png', image, {create: false});
				});
				resolve(true);
			}
		});
	});
}


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

	return day + "_" + month + "_" + year + "_" + hours + "_" + minutes + "_" + seconds;
}

/**
*	Saves a photo in a directory if the image is different than the image we took last visit
* @param: dirname - directory where we want to save the photo
* @param: image - base64 encoded image that we want to save
*/

function savePhoto(dirname, image) {

	//test(dirname, image);
	
	isUpdated(dirname, image).then(function(result) {

		if(result == true) {
			var fileName = getDate() + '.png';

			cs.getFile('screenshots/' + dirname + '/' + fileName, {create: true, exclusive: true}, function() {
				console.log('am creat fisierul ' + fileName);
				cs.write('screenshots/' + dirname + '/' + fileName, 'image/png', image, {create: false});
			});

			chrome.browserAction.setBadgeText({text: '!'});

		} else {
			console.log('page is not updated');
		}

	});
}


/**
*	Checks if the extension in disabled
*/

function checkIfExtensionIsDisabled() {
	return new Promise((resolve, reject) => {

		chrome.storage.sync.get('disabled', function(data) {

			if (data.disabled == 'not-disabled') {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

var takeScreenshot = {
	
	tabId: null,

	screenshotCanvas: null,

	screenshotContext: null,

	scrollBy: 0,

	dirname: null,

	size: {
		width: 0,
		height: 0
	},

	originalParams: {
		overflow: "",
		scrollTop: 0
	},

	/**
	*	Initializes variables
	*/ 

	initialize: function () {
		this.screenshotCanvas = document.createElement("canvas");
		this.screenshotContext = this.screenshotCanvas.getContext("2d");

		this.bindEvents();
	},

	/**
	*	Binds events
	*/
	bindEvents: function () {

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
			if(changeInfo.status != 'complete')
				return;
			
			this.tabId = tabId;
			this.dirname = getDirnameFromUrl(tab.url);

			checkIfExtensionIsDisabled().then(function(result1) {

				if(result1 == false) {

					console.log('extensia nu e oprita');
				
					checkIfUrlIsFollowed().then(function(result){

						if(result == true) {
							chrome.tabs.sendMessage(tabId, {
								"msg" : "getPageDetails"
							});
							console.log('facem screenshot');
						} else {
							console.log('nu facem screenshot!');
						}
					});
				}
				else {
					console.log('extensia e oprita, nu facem nimic');
				}
			});

		}.bind(this));

		// handle chrome requests
		chrome.runtime.onMessage.addListener(function (request, sender, callback) {
			if (request.msg === "setPageDetails") {
				
				this.size = request.size;
				this.scrollBy = request.scrollBy;
				this.originalParams = request.originalParams;

				// set width & height of canvas element
				this.screenshotCanvas.width = this.size.width;
				this.screenshotCanvas.height = this.size.height;

				this.scrollTo(0);
			} else if (request.msg === "capturePage") {
				this.capturePage(request.position, request.lastCapture);
			}
		}.bind(this));
	},

	/**
	*	Sends request to scroll page on given position
	*/	
	scrollTo: function (position) {
		chrome.tabs.sendMessage(this.tabId, {
			"msg": "scrollPage",
			"size": this.size,
			"scrollBy": this.scrollBy,
			"scrollTo": position
		});
	},

	/**
	* Takes screenshot of visible area and merges it
	* @param: position - 
	*/

	capturePage: function (position, lastCapture) {
		var self = this;

		setTimeout(function () {
			chrome.tabs.captureVisibleTab(null, {
				"format": "png"
			}, function (dataURI) {
				var newWindow,
					image = new Image();

				if (typeof dataURI !== "undefined") {
					image.onload = function() {
						self.screenshotContext.drawImage(image, 0, position);

						if (lastCapture) {
							self.resetPage();
							newWindow = window.open();
							newWindow.document.write("<style type='text/css'>body {margin: 0;}</style>");
							newWindow.document.write("<img src='" + self.screenshotCanvas.toDataURL("image/png") + "'/>");
							savePhoto(self.dirname, self.screenshotCanvas.toDataURL('image/png'));

						} else {
							self.scrollTo(position + self.scrollBy);
						}
					};

					image.src = dataURI;
				} else {
					console.log('error');
				}
			});
		}, 50);
	},
	/**
	*	Send request to set original params of the page
	*/
	resetPage: function () {
		chrome.tabs.sendMessage(this.tabId, {
			"msg": "resetPage",
			"originalParams": this.originalParams
		});
	}
};

cs = new ChromeStore();
cs.init(1024 * 1024 * 1024, takeScreenshot.initialize());