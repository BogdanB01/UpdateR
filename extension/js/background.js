
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

var takeScreenshot = {
	
	tabId: null,

	screenshotCanvas: null,

	screenshotContext: null,

	scrollBy: 0,

	size: {
		width: 0,
		height: 0
	},

	originalParams: {
		overflow: "",
		scrollTop: 0
	},

	initialize: function () {
		this.screenshotCanvas = document.createElement("canvas");
		this.screenshotContext = this.screenshotCanvas.getContext("2d");

		this.bindEvents();
	},

	bindEvents: function () {

		chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
			if(changeInfo.status != 'complete')
				return;
			
			this.tabId = tabId;


			checkIfUrlIsFollowed().then(function(result){
				if(result == true) {
					chrome.tabs.sendMessage(tabId, {
						"msg" : "getPageDetails"
					});
				} else {
					console.log('nu facem screenshot!');
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

	scrollTo: function (position) {
		chrome.tabs.sendMessage(this.tabId, {
			"msg": "scrollPage",
			"size": this.size,
			"scrollBy": this.scrollBy,
			"scrollTo": position
		});
	},

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

	resetPage: function () {
		console.log('reset');
		chrome.tabs.sendMessage(this.tabId, {
			"msg": "resetPage",
			"originalParams": this.originalParams
		});
	}
};


takeScreenshot.initialize();