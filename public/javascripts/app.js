// Делает контейнер калейдоскопа на всю страницу
$(window).on("load", function() {

    setTimeout(function() {
        $("#melinda-logo").addClass("fadein");
        
        setTimeout(function() {
            $("#melinda-logo").addClass("fadeout");
            $("#bar-layer").addClass("shown");
        }, 4000);
    }, 500);   




    var kaleidoscopeLayer = $('#kaleidoscope-layer');
    var dragdropLayer = $("#dragdrop-layer");

    window.scope = new Graphemescope( kaleidoscopeLayer[0] );
    window.model = {};

    var createNewScope = function(callback) {
        $.ajax({
            type : "PUT",
            data : model,
            url  : "/scopes"
        })
        .done(function(data) {
            model = data;
            page.show("/" + model._id, {}, false);
            callback();
        })
        .fail(function(err) {
            callback(err);
        });
    };

    dragdropLayer.click(function() {

        if( scope.analyser.paused ) {
            $("#play-image").show(0);
            $("#play-image").addClass("fadeout");

            scope.analyser.play();
        } else {
            $("#pause-image").show(0);
            $("#pause-image").addClass("fadeout");
            
            console.log("pause");
            scope.analyser.pause();
        }
    });

    dragdropLayer.mousemove(function() {
        var factorx = event.pageX / $(window).width();
        var factory = event.pageY / $(window).height();

        if(scope.analyser.paused) {
            scope.kaleidoscope.angleTarget = factorx;
            scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
        }
    });


    new DragDrop(dragdropLayer[0], function(files) {
        if(files.length <= 0) return;

        var formData = new FormData();
        formData.append('file', files[0]);

        createNewScope(function(err) {
            jQuery.ajax('/files', {
                type : "POST",
                processData: false,
                contentType: false,
                data: formData
            })
            .done(function(data) {
                var imageSrc = "files/" + data._id;

                var type = files[0].type.substring(0, 5);
                
                if(type === "audio") {
                    console.log("Set audio");

                    $.post('scopes/' + model._id, {
                       'audio' : data._id 
                    }).done(function() {
                        scope.setAudio("files/" + data._id);
                    });
                }

                if(type === "image") {
                    console.log("Set image");
                    
                    $.post('scopes/' + model._id, {
                       'image' : data._id 
                    }).done(function() {
                        scope.setImage("files/" + data._id);
                    });
                }
            });
        }); 
    });
    
    page('/:id?', function(req) {
        var id = req.params['id'] || "default";

        $.get("/scopes/" + id)
        .done(function(data) {
            model = data;

            console.log(model);

            scope.setImage("files/" + model.image);
            scope.setAudio("files/" + model.audio);
        })
        .fail(function() {
            page("/");
        });
    });
    page();




    var mainContainer = $("#main-container");

    
    var resizeHandler = function() {
        mainContainer.height( $(window).height() );
        mainContainer.width( $(window).width() );

        $(".centered-image").each(function() {
            $(this).css({
                "top"  : 0.5 * ($(window).height() - $(this).height()),
                "left" : 0.5 * ($(window).width() -  $(this).width())
            });
        });
    };

    $(window).resize(resizeHandler);
    $(window).resize();   


    $(".status-icon").on("transitionend", function() {
        $(this).removeClass("fadeout");
        $(this).hide();
    });
});


