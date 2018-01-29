document.addEventListener('DOMContentLoaded', () => {

		//Get the modal
	var modal = document.getElementById('imgModal');

	//Get the image
	var img = document.getElementById('photo');
	var modalImg = document.getElementById('img01');
	var captionText = document.getElementById("caption");

	img.onclick = function(){
	  modal.style.display = "block";
	  modalImg.src = this.src;
	  modalImg.alt = this.alt;
	  captionText.style.display = "block";
	}

	var span = document.getElementsByClassName("close")[0];

	//click on (x), close the modal
	span.onclick = function() { 
	    modal.style.display = "none";
	}

	var button = document.getElementById('button-input');

	button.addEventListener('change',function(){

		if(!button.checked){

			var elements = document.getElementsByClassName('toggle-focused');

			while (elements[0]) 
			{
				elements[0].classList.remove('toggle-focused');
				}

				ids = [];

		}

	});

	function getDirnameFromUrl(url) {
        return url.replace(/\/|:|\?|"|\<|\>|\.|\*|\|/g, '_');
    }

    function getInitialPhotoName(photo){
    	photo += '.png';
    	photo = photo.replace(':','_')
					 .replace(':','_')
					 .replace(' ','_')
					 .replace(':','_')
					 .replace(':','_')
					 .replace(':','_');

		return photo;
    }

    var ids = [];

	function populateHistoryTab(){

		chrome.storage.sync.get({list: []}, function(data){
			if(!chrome.runtime.error){

				var rootElement = document.getElementById("historylist");

				for(var foo = 0 ; foo < data.list.length ; foo++) {

					(function(i) {

						var newUl = document.createElement("ul");
						newUl.setAttribute("class","accordion");

						var newInput = document.createElement("input");
						newInput.setAttribute("id" , "accord" + i);
						newInput.setAttribute("type" , "checkbox");
						newInput.setAttribute("class" , "hide");

						var newLi = document.createElement("li");

						var newLabel = document.createElement("label");
						newLabel.setAttribute("for" , "accord" + i);
						newLabel.setAttribute("class" , "toggle");
						newLabel.innerText = data.list[i].url;

						newUl.appendChild(newInput);
						newUl.appendChild(newLi);
						newLi.appendChild(newLabel);

						rootElement.appendChild(newUl);

						var newDiv = document.createElement("div");
						newDiv.setAttribute("class" , "inner");

						var anotherUl = document.createElement("ul");
						anotherUl.setAttribute("class" , "accordion");

						cs.ls('screenshots/' + getDirnameFromUrl(data.list[i].url) , function(arr){

	    					for(var j = 0 ; j < arr.length; j++){

	    						if(arr[j].name == 'last.png'){
									
									continue;  
	    							
	    							} else {

		    						var anotherInput = document.createElement("input");
		    						anotherInput.setAttribute("id" , "accord" + i + "-" + j);
		    						anotherInput.setAttribute("type" , "checkbox");
		    						anotherInput.setAttribute("class" , "hide");

		    						var anotherLi = document.createElement("li");

		    						var anotherLabel = document.createElement("label");
		    						anotherLabel.setAttribute("for" , "accord" + i + "-" + j);
		    						anotherLabel.setAttribute("class" , "toggle");
		    						anotherLabel.setAttribute("id" , i + "-" + j);
		    						anotherLabel.className += " numefisier";

		    						anotherLabel.innerText = arr[j].name.replace('.png','')
		    															.replace('_',':')
		    															.replace('_',':')
		    															.replace('_','  ')
		    															.replace('_',':')
		    															.replace('_',':');

		    						anotherUl.appendChild(anotherInput);
		    						anotherLi.appendChild(anotherLabel);

		    						anotherUl.appendChild(anotherLi);

		    						anotherLabel.addEventListener("click" , function(e){

		    							if ( ! button.checked ){

		    								changePhotoWhenClicked(getDirnameFromUrl(data.list[i].url), getInitialPhotoName(e.target.innerText));

			    						}

			    						else {

		    								changePhotoWhenClicked(getDirnameFromUrl(data.list[i].url), getInitialPhotoName(e.target.innerText));
		    								document.getElementById(this.id).className += " toggle-focused";

		    								if( (ids.length == 1 && this.id == ids[0] ) || 
		    									(ids.length == 2 && ids[1] == this.id)){	

		    									//same item selected , do nothing

			    							} else {

			    								validatePhotosSelection(this.id);
			    							}
			    						}
			    					});

			    				}

	    					}

	  						newDiv.appendChild(anotherUl);
	  						newLi.appendChild(newDiv);

						});

					}(foo));

				}

			}

		});

	}

	var cs = new ChromeStore();
	cs.init(1024 * 1024 * 1024 , populateHistoryTab);

	document.getElementById("compare-image").addEventListener("click" , function(e){

		if(ids.length < 2){
			console.log("[Error]Nu se poate incepe compararea");
		}

		if(ids.length == 2){

			if(ids[0].substring(0,1) != ids[1].substring(0,1)){
				console.log("[Error]Nu poti compara 2 imagini din linkuri diferite");

			} else {

				//comparing images

				var firstPhotoName = getPhotoNameById(ids[0]);
				var secondPhotoName = getPhotoNameById(ids[1]);

				var dirname = getDirnameFromUrl(document.getElementById(ids[0])
								.parentElement.parentElement.parentElement.parentElement.innerText.split('\n')[0]);

				cs.readFile('screenshots/' + dirname + '/' + firstPhotoName, function(data) {

					cs.readFile('screenshots/' + dirname + '/' + secondPhotoName , function(data2){

						var resembleControl = resemble(data).compareTo(data2).onComplete(function(data3){

							/*document.getElementById('mockup').src = data3.getImageDataUrl();*/

							var newWindow = window.open();

							newWindow.document.write("<style type='text/css'>body {margin: 0;}</style>");
							newWindow.document.write("<img src='" + data3.getImageDataUrl() + "' />");

						});

					});	

				});

			}
		}

	});

	function getPhotoNameById(id){
		
		photoName = getInitialPhotoName(document.getElementById(id).innerText);

		return photoName;

	}

	function validatePhotosSelection(current_id){

		if (ids.length == 2) 
		{
			document.getElementById(ids[0]).classList.remove("toggle-focused");
			ids.splice(0,1);
		}

		if (ids.length == 1 && (ids[0].substring(0,1) == current_id.substring(0,1)))
		{	
			ids.push(current_id);
		}
			
		if (ids.length == 0) 
		{	
			ids.push(current_id);
		}

		if (ids.length == 1 && (ids[0].substring(0,1) != current_id.substring(0,1)))
		{	
			document.getElementById(ids[0]).classList.remove("toggle-focused");
			ids = [];

			ids.push(current_id);
		}

		if (ids.length == 2 && (ids[1].substring(0,1) != current_id.substring(0,1)))
		{	
			document.getElementById(ids[0]).classList.remove("toggle-focused");
			document.getElementById(ids[1]).classList.remove("toggle-focused");
			ids = [];

			ids.push(current_id);
		}

	}

	function changePhotoWhenClicked(dirname, filename){

		cs.readFile('screenshots/' + dirname + '/' + filename, function(data) {

			document.getElementById('photo').src = data;

		});

	}

});