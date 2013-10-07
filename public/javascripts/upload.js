window.uploadFile = (function() {
	var busy = false;

	return function(file, callback) {
		if(busy) {
			return callback("Another file is uploading now!");
		}

		busy = true;
		$("#progress-bar").removeClass("hidden");
		var formData = new FormData();
		
		formData.append('file', file);

		var xhr = new XMLHttpRequest();
		xhr.open('POST', '/files');
		xhr.onload = function(data) {
			busy = false;

			$("#progress-bar").addClass("hidden");
			$("#progress-bar").width(0);

			var json = {};
			try {
				json = JSON.parse(this.response);
			}catch(err) {};
			callback(null, json);
		};

		xhr.upload.onprogress = function (event) {
		  if (event.lengthComputable) {
		    var progress = (event.loaded / event.total * 100 | 0);
		    
		    $("#progress-bar").width(progress.toFixed(0) + "%");	
		  }
		};

		xhr.send(formData);
	};
})();