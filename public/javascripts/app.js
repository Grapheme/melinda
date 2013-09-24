$(function() {
    container = $('#container');

    window.kaleidoscope = new Kaleidoscope( container[0] );

    var resizeHandler = function() {
        container.height( $(window).height() );
        container.width( $(window).width() );
    };

    $(window).resize(resizeHandler);
    $(window).resize();

    setInterval(function() {
        kaleidoscope.draw();
    }, 1000 / 30);

    function DragDrop(context, callback) {
        var disable = function(event) {
            event.stopPropagation();
            event.preventDefault();
        };

        var onDrop = function(event) {
            disable(event);
            callback(event.dataTransfer.files);
        };

        context.addEventListener("dragleave", disable);
        context.addEventListener("dragenter", disable);
        context.addEventListener("dragover", disable);
        context.addEventListener("drop",  onDrop, false);
    };

    DragDrop(container[0], function(files) {
        if(files.length <= 0) return;

        var formData = new FormData();
        formData.append('file', files[0]);
        

        jQuery.ajax('/files', {
            type : "POST",
            processData: false,
            contentType: false,
            data: formData
        }).done(function(data) {
            var imageSrc = "files/" + data.id;

            changeResources(imageSrc);

            $.post('scopes/' + window.currentId, {
               'image' : data.id 
            }).done(function() {

            });
        });
    });

    var app = Davis(function () {
        this.configure(function () {
            this.generateRequestOnPageLoad = true;
        });

        this.get('/:id?', function (req) {
            var id = req.params['id'] || "default";
            window.currentId = id;

            $.get("/scopes/" + id, function(data) {
                changeResources("files/" + data.image);
            });
        })
    });

    app.start(); 
});

function changeResources(imageSrc) {
    var image = new Image();
    image.src = imageSrc;
    image.onload = function() {
        kaleidoscope.image = image;
    };
}

