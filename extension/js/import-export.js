document.addEventListener('DOMContentLoaded', () => {

	var cs = new ChromeStore();
    cs.init(1024 * 1024 * 1024);

	function getDirnameFromUrl(url) {
        return url.replace(/\/|:|\?|"|\<|\>|\.|\*|\|/g, '_');
    }

	function processFile(file){
		var reader = new FileReader();
	    
	    //process only json files
	    if(file.type == 'application/json' || file.name.endsWith('.json')) {
	    	reader.onload = function(event) {
	    		var contents = event.target.result;
	    		var validJSONFormat = true;

	    		try {
	    			let settings = JSON.parse(contents);
	    			/*console.log(settings);*/
					
					Object.keys(settings).forEach(function (key) {

						if(key != 'color' && key != 'links'){
							validJSONFormat = false;
							return;
						}

					});	

					if(validJSONFormat == true){

						var color = settings.color;
						var links = settings.links;

						chrome.storage.sync.set({"color": color}, function(){
				            var event = new Event('change');
				            document.querySelector("#color-picker").dispatchEvent(event);

				        });

						var regex = RegExp('(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})');

			            chrome.storage.sync.get({list: []}, function(data){

			            	for(var i = 0 ; i < links.length; i++){

								var entry = links[i];

								if(entry.match(regex)){
									
									addLinkToList(entry , data);

			                    }else{

			                    	document.getElementById('drop-error').innerHTML += '<p>Invalid URL format! -> ' + links[i] + '</p>';

			                    }

		                	}
	                    });

	                }else {
	                	document.getElementById('drop-error').innerHTML = '<p> Invalid JSON format !</p>';
	                }

	    		} catch (error) {
	    			console.log("Error= " + error);
	    			console.log('invalid json!');
	    			document.getElementById('drop-error').innerHTML = '<p> Invalid JSON!</p>';
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

		chrome.storage.sync.get('color' , function(data1){

			var color = data1.color;

			chrome.storage.sync.get({list: []}, function(data2){
				var urls = [];
				for(var i = 0 ; i < data2.list.length; i++){
					urls.push(data2.list[i].url);
				}

				var obj = {
					color: color,
					links: urls
				};
				console.log(obj);	
				element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj)));

				element.setAttribute('download', 'settings.json');

				element.style.display = 'none';
				document.body.appendChild(element);

				element.click();
				document.body.removeChild(element);

			});

		})

		
	});

	function addLinkToList(entry, data){

		var currentdate = new Date();
		var datetime = currentdate.getDate() + "/"
            + (currentdate.getMonth()+1)  + "/" 
            + currentdate.getFullYear() + " "  
            + currentdate.getHours() + ":"  
            + currentdate.getMinutes() + ":" 
            + currentdate.getSeconds();

        var row = {
            url: entry,
            time: datetime
        };


        if(!chrome.runtime.error){
            data.list.push(row);

            chrome.storage.sync.set({
                list:data.list
            }, function(){
                 console.log('added to list');
             });
        }

        var dirname = getDirnameFromUrl(row.url);
    	//create directory to store screenshots

        cs.getDir('screenshots/'+dirname, {create : true}, function() {
            console.log('Created dir', dirname);
        });

        cs.ls('screenshots', function(arr) {
            for(var i = 0; i < arr.length; i++)
                console.log(arr[i].name);
        });

	}

});