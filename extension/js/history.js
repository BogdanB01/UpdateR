document.addEventListener('DOMContentLoaded', () => {

	function getDirnameFromUrl(url) {
        return url.replace(/\/|:|\?|"|\<|\>|\.|\*|\|/g, '_');
    }

	function populateHistoryTab(){

		chrome.storage.sync.get({list: []}, function(data){
			if(!chrome.runtime.error){

				var rootElement = document.getElementById("historylist");

				for(var i = 0 ; i < data.list.length ; i++) {
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
    						anotherLabel.innerText = arr[j].name;

    						anotherUl.appendChild(anotherInput);
    						anotherLi.appendChild(anotherLabel);

    						anotherUl.appendChild(anotherLi);
    					}

  						newDiv.appendChild(anotherUl);
  						newLi.appendChild(newDiv);

					});

				}
			}
		});
	}

	var cs = new ChromeStore();
	cs.init(1024 * 1024 * 1024 , populateHistoryTab);

});