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

    document.getElementById('urls').addEventListener('click', function(){
        openTab('urls-tab');
    });
    document.getElementById('view').addEventListener('click', function(){
        openTab('view-tab');
    });
    document.getElementById('third').addEventListener('click', function(){
        openTab('another-tab');
    });
});