document.addEventListener('DOMContentLoaded', () => {

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

		chrome.storage.sync.set({"disabled": 'not-disabled'});

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


});