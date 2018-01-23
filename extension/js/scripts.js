document.addEventListener('DOMContentLoaded', () => {
    

    var cs = new ChromeStore();
    cs.init(1024 * 1024 * 1024);

    /**
    *   Function that changes settings page content 
    */

    function openTab(id){
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        document.getElementById(id).style.display = "block";
    }
    
    openTab('view-tab');
    document.getElementById('view').className += " active"

    document.getElementById('urls').addEventListener('click', function(){
        openTab('urls-tab');
        document.getElementById('urls').className += " active"
    });
    document.getElementById('view').addEventListener('click', function(){
        openTab('view-tab');
        document.getElementById('view').className += " active"
    });
    document.getElementById('third').addEventListener('click', function(){
        openTab('another-tab');
        document.getElementById('third').className += " active"
    });

    document.getElementById('export').addEventListener('click', function(){
        openTab('import-export');  
        document.getElementById('export').className += " active";
    });

    /**
    *   Function that adds an url in the table (in the followed list). When a link is added a new directory is created 
    *   in the 'screenshots' directory.
    */

    function addRowInTable(tableRow){
        var table = document.getElementById('my-table');
        var row = table.insertRow(1);

        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = tableRow.url;
        cell2.innerHTML = tableRow.time;
        cell3.innerHTML = '<a href="#"><img src="../images/remove.png" height=16 width=16></img></a>';
        cell3.id = tableRow.url;
        document.getElementById(tableRow.url).addEventListener('click', function(){
            deleteRowFromTable(row);
        });
    }

    /**
    *   Function that converts an url in a directory name (escapes special chracters) 
    */

    function getDirnameFromUrl(url) {
        return url.replace(/\/|:|\?|"|\<|\>|\.|\*|\|/g, '_');
    }


    /**
    *   Function that deletes a row from the table. (Deletes an url from the followed list). When the row is deleted
    *   the directory created once it was added is now deleted.
    */
    function deleteRowFromTable(row){
        row.parentNode.removeChild(row);       
        var url = row.getElementsByTagName('td')[0].innerText;

        chrome.storage.sync.get({list:[]}, function(data){
            if(!chrome.runtime.error){
                for(var i in data.list){
                    if(data.list[i].url == url){
                        data.list.splice(i, 1);
                    }
                }
            chrome.storage.sync.set({
                list:data.list
            }, function(){
                console.log('removed from list');
            });
            }
        });

        //delete directory with all its content
        cs.deleteDir('screenshots/'+getDirnameFromUrl(url), {recursive: true}, function() {
            console.log('deleted directory');
        });
    }


    /**
    *   Function that gets data the list of followed urls from chrome storage and populates the table
    */

    function populateTable(){
        chrome.storage.sync.get({list: []}, function(data){
            if(!chrome.runtime.error){
                for(var i in data.list){
                    addRowInTable(data.list[i]);
                }
            }
        });
    }

    populateTable();


    function checkIfUrlIsFollowed(url) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get({list: []}, function(data){
                for(var i = 0; i < data.list.length; i++){
                    if(data.list[i].url == url) {
                        resolve(true);
                    }
                }
                resolve(false);
            });
        });
    }

    /**
    *   Function that is called when an user tries to add a new url in the followed list. If the url that user entered is invalid it will get an error message,
    *   also, if the url that the user is trying to follow is already being followed an error message will be shown to the user.
    */

    document.getElementById('addbutton').addEventListener('click', function(){
        var entry = document.getElementById('new-task');
        

        var regex = RegExp('(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})');
        if (entry.value.match(regex)){
            //add in table 
            
            var currentdate = new Date(); 
            var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();

            var row = {
                url: entry.value,
                time: datetime
            };
            
            checkIfUrlIsFollowed(row.url).then(function(result) {
                if(result == false) { 
                    chrome.storage.sync.get({list: []}, function(data){
                        if(!chrome.runtime.error){
                            data.list.push(row);

                            chrome.storage.sync.set({
                                list:data.list
                            }, function(){
                                 console.log('added to list');
                             });
                        }
                    });

                    var dirname = getDirnameFromUrl(row.url);
                    //create directory to store screenshots

                    cs.getDir('screenshots/'+dirname, {create : true}, function() {
                        console.log('Created dir', dirname);
                    });


                    cs.ls('screenshots', function(arr) {
                        for(var i = 0; i < arr.length; i++)
                            console.log(arr[i].name);
                    });

                    addRowInTable(row);
                } else {
                    document.getElementById('error-url').innerHTML = "You're already following this url!";
                }
            });
        } else {
            //scream
            console.log('do something');
            document.getElementById('error-url').innerHTML = 'Invalid url';
        }     
    });

    /**
    *   Function that changes to color of the sample web page with the new color provided by the user.
    */

    function updateViewColors(color){
        var ups = document.querySelectorAll('.updated-text');
        for(var i = 0; i < ups.length; i++){
            ups[i].style.backgroundColor = color;
        }
        console.log(color);
        document.querySelector('#updated-image').style.background = color;
    }

    /**
    *   Function that saves in the chrome storage the colour that the user choosed
    */ 

    function setColor(){
        chrome.storage.sync.get("color", function(data){
            if(!chrome.runtime.error){
                updateViewColors(data.color);
                document.querySelector('#color-picker').value=data.color;
            }
        });
    }
    setColor();

    document.getElementById('color-picker').addEventListener('change', function(){
        var color = document.querySelector('#color-picker').value;
        updateViewColors(color);
    });



    document.getElementById('choose-button').addEventListener('click', function(){
        var _color = document.querySelector('#color-picker').value;
        chrome.storage.sync.set({"color": _color}, function(){
            console.log('saved color');
        });
    });
});