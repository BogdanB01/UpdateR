document.addEventListener('DOMContentLoaded', () => {
	

	function processFile(file){
		var reader = new FileReader();
	    
	    //process only json files
	    if(file.type == 'application/json' || file.name.endsWith('.json')) {
	    	reader.onload = function(event) {
	    		var contents = event.target.result;

	    		try {
	    			let settings = JSON.parse(contents);
	    			console.log(settings);
					
					Object.keys(settings).forEach(function (key) {

						if(key != 'color' && key != 'links'){

							document.getElementById('drop-error').innerHTML = '<p> Invalid JSON format !</p>';

						}

					});	

					var color = settings.color;

					console.log(color);

					chrome.storage.sync.set({"color": color}, function(){
			            console.log('saved color');

			            var event = new Event('change');
			            document.querySelector("#color-picker").dispatchEvent(event);

			        });

	    			
	    		} catch (error) {
	    			console.log('invalid json!');
	    			document.getElementById('drop-error').innerHTML = '<p> Invalid JSON !</p>';
	    		}
	    	}
	    	reader.readAsText(file);
		}
	    else {
	 	   document.getElementById('drop-error').innerHTML = '<p> Incompatible tipe! Expected json file! </p>';
 		}
	}

	function handleFileSelect(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();

	    var files = evt.dataTransfer.files; // FileList object.
	    processFile(files[0]);
 	}

 	function handleFileSelectOnClick(event){
		processFile(event.target.files[0]);
	}

	function handleDragOver(evt) {
	    evt.stopPropagation();
	    evt.preventDefault();
	    evt.dataTransfer.dropEffect = 'copy'; 
	}


	document.getElementById('droppable').addEventListener('click', function() {
		document.getElementById('input-file').click();
	});

	// Setup the dnd listeners.
	var dropZone = document.getElementById('droppable');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);


	var fileLoader = document.getElementById('input-file');
	fileLoader.addEventListener('change', handleFileSelectOnClick, false);


	document.getElementById('export-settings').addEventListener('click', function() {
		var element = document.createElement('a');
		var obj = { color : "red" , 
					links : ["link1" , "link2"]}

		element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj)));

		element.setAttribute('download', 'settings.json');

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();
		document.body.removeChild(element);
	});
});