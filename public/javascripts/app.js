// Делает контейнер калейдоскопа на всю страницу
$(window).on("load", function() {
    Typekit.load();

    setTimeout(function() {
        $("#melinda-logo").addClass("fadein");
        
        setTimeout(function() {
            $("#melinda-logo").addClass("fadeout");
            $("#bar-layer").addClass("shown");
        }, 2000);
    }, 500);   

    $("#howto-button").click(function() {
        $("#howto-layer").show(0);
        $("#kaleidoscope-layer").css({
            "-webkit-filter" : "blur(5px)"
        });
    });

    $("#howto-layer").click(function() {
        $("#howto-layer").hide();
           $("#kaleidoscope-layer").css({
            "-webkit-filter" : ""
        });
    }); 

    
    // TODO: avoid this
    $(".status-icon").on("transitionend", function() {
        $(this).removeClass("fadeout");
        $(this).hide();
    });


    function updateURL() {
        var url = window.location.host;

        if(window.location.pathname !== "/") {
            url += window.location.pathname;
        }

        var description = "Melinda lets you create Scopes: interactive kaleidoscopic visualizations that are moving along with the music. #melinda #grapheme";
        var title = "Check this out!";
        var shortDescription = "Check this out! #melinda #grapheme";
        var image = location.origin + "/images/melinda-logo.png";

        $("#scope-address").val(url);
       
        $("#facebook-button").attr({
            "href" : "http://www.facebook.com/sharer/sharer.php?s=100&p[url]=" + encodeURIComponent(location.href) 
                    + "&p[title]=" + encodeURIComponent(title)
                    + "&p[summary]=" + encodeURIComponent(description)
                    + "&p[images][0]=" + encodeURIComponent(image)
        });

        $("#twitter-button").attr({
            "href" : "http://twitter.com/share?url=" + encodeURIComponent(location.href)
                    + "&text=" + encodeURIComponent(shortDescription)
        });

        $("#vk-button").attr({
            "href" : "http://vk.com/share.php?url=" + encodeURIComponent(location.href) 
                    + "&title=" + encodeURIComponent(title) 
                    + "&description=" + encodeURIComponent(description)
                    + "&image=" + encodeURIComponent(image)
        });
        
    }



    var kaleidoscopeLayer = $('#kaleidoscope-layer');
    var dragdropLayer = $("#dragdrop-layer");

    window.scope = new Graphemescope( kaleidoscopeLayer[0] );
    window.model = {};

    var createNewScope = function(callback) {
        $.ajax({
            type : "PUT",
            data : window.model,
            url  : "/scopes"
        })
        .done(function(data) {
            model = data;
            page.show("/" + model._id, {}, false);
            updateURL();
            callback();
        })
        .fail(function(err) {
            callback(err);
        });
    };

    dragdropLayer.click(function() {

        if( scope.analyser.isPaused() ) {
            $("#play-image").show(0);
            $("#play-image").addClass("fadeout");

            scope.analyser.play();
        } else {
            $("#pause-image").show(0);
            $("#pause-image").addClass("fadeout");

            scope.analyser.pause();
        }
    });

    dragdropLayer.mousemove(function() {
        var factorx = event.pageX / $(window).width();
        var factory = event.pageY / $(window).height();

        if(scope.analyser.isPaused() ) {
            scope.kaleidoscope.angleTarget = factorx;
            scope.kaleidoscope.zoomTarget  = 1.0 + 0.5 * factory;
        }
    });


    new DragDrop(dragdropLayer[0], function(files) {
        if(files.length <= 0) return;

        var file = files[0];

        uploadFile(files[0])
        .done(function(data) {
            var fileId = data._id;

            createNewScope(function(err) {
                var type = files[0].type.substring(0, 5);
                
                if(type === "audio") {
                    console.log("Set audio");

                    $.post('scopes/' + model._id, {
                       'audio' : fileId 
                    }).done(function() {

                        model.audio = fileId;
                        scope.setAudio("files/" + fileId);
                    });
                }

                if(type === "image") {
                    console.log("Set image");
                    
                    $.post('scopes/' + model._id, {
                       'image' : fileId 
                    }).done(function() {

                        model.image = fileId;
                        scope.setImage("files/" + fileId);
                    });
                }
            });

        });      
    });


    page("/*", function(req, next) {
        updateURL();
        next();
    });
    
    page('/:id?', function(req) {
        var id = req.params['id'] || "default";

        $.get("/scopes/" + id)
        .done(function(data) {
            window.model = data;

            scope.setImage("files/" + model.image);
            scope.setAudio("files/" + model.audio);
        })
        .fail(function() {
            page("/");
        });
    });
    page();



});


