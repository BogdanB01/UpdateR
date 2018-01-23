
var image = document.getElementById('image');

document.getElementById('last').addEventListener('click', function() {
	image.src = document.getElementById('last-photo').textContent;
});

document.getElementById('current').addEventListener('click', function() {
	image.src = document.getElementById('current-photo').textContent;
});

document.getElementById('diff').addEventListener('click', function() {
	image.src = document.getElementById('diff-photo').textContent;
});