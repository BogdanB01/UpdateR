document.addEventListener('DOMContentLoaded', () => {
    
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

    function deleteRowFromTable(row){
        row.parentNode.removeChild(row);       
        console.log(row);
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
    }


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

            addRowInTable(row);

        } else {
            //scream
            console.log('do something');
            document.getElementById('error-url').innerHTML = 'Invalid url';
        }     
    });
});