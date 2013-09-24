$(function() {
    var app = Davis(function () {
        this.configure(function () {
            this.generateRequestOnPageLoad = true;
        });

        this.get('/:id?', function (req) {
            var id = req.params['id'] || "default";

            $.get("/scopes/" + id, function(data) {
                init(data);
            });
        })
    });

    app.start(); 
});
   
function init(payload) {
    // function DragDrop(context, callback) {
    //     var disable = function(event) {
    //         event.stopPropagation();
    //         event.preventDefault();
    //     };

    //     var onDrop = function(event) {
    //         disable(event);
    //         callback(event.dataTransfer.files);
    //     };

    //     context.addEventListener("dragleave", disable);
    //     context.addEventListener("dragenter", disable);
    //     context.addEventListener("dragover", disable);
    //     context.addEventListener("drop",  onDrop, false);
    // };

    // DragDrop(container[0], function(files) {
    //     var formData = new FormData();
    //     for (var i = 0; i < files.length; i++) {
    //         formData.append('file', files[i]);
    //     }

    //     jQuery.ajax('/upload', {
    //         type : "POST",
    //         processData: false,
    //         contentType: false,
    //         data: formData
    //     });
    // });

    var container = $("#container");

    var imageSrc = "files/" + payload.image;
    var musicSrc = "files/" + payload.music;

    new Graphemescope(container[0], imageSrc, musicSrc);

    var resizeHandler = function() {
        container.height( $(window).height() );
        container.width( $(window).width() );
    };

    $(window).resize(resizeHandler);
    $(window).resize();
}
