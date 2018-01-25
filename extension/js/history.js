document.addEventListener('DOMContentLoaded', () => {

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

	    						anotherLabel.innerText = arr[j].name;

	    						anotherUl.appendChild(anotherInput);
	    						anotherLi.appendChild(anotherLabel);

	    						anotherUl.appendChild(anotherLi);

	    						anotherLabel.addEventListener("click" , function(){

	    							if ( ! button.checked ){

		    							document.getElementById('mockup').src='../images/placeholder_test.png';

		    						}

		    						else {

	    								document.getElementById('mockup').src='../images/placeholder_test.png';
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

	document.getElementById("compare-image").addEventListener("click" , function(){

		if(ids.length < 2){
			console.log("[Error]Nu se poate incepe compararea");
		}

		if(ids.length == 2){

			if(ids[0].substring(0,1) != ids[1].substring(0,1)){
				console.log("[Error]Nu poti compara 2 imagini din linkuri diferite");

			} else {

				console.log("Ok , poate incepe compararea");

			}
		}

	});

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

});