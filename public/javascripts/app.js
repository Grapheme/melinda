$(window).on("load", function() {
    Typekit.load();

    /* -------------------------------------------------------------------- */
    // UI-related stuff goes below
    /* -------------------------------------------------------------------- */
    setTimeout(function() {
        $("#melinda-logo").addClass("fadein");
        
        setTimeout(function() {
            $("#melinda-logo").addClass("fadeout");
            $("#bar-layer").addClass("shown");
        }, 2000);
    }, 500);   

    function toggleHelp() {
        if( !$("#howto-layer").is(":visible") ) {
            $("#howto-layer").show(0);
            $("#kaleidoscope-layer").css({ "-webkit-filter" : "blur(5px)" });
        } else {
            $("#howto-layer").hide();
            $("#kaleidoscope-layer").css({ "-webkit-filter" : "none" });
        }
     
    }
    $("#howto-button").click(toggleHelp);
    $("#howto-layer").click(toggleHelp); 


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
            $("#play-image").removeClass("hidden");

            setTimeout(function() {
                $("#play-image").addClass("hidden");
            }, 0);

            scope.analyser.play();
        } else {
            $("#pause-image").removeClass("hidden");

            setTimeout(function() {
                $("#pause-image").addClass("hidden");
            }, 0);

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


    function dropHandler(files) {
        if(files.length <= 0) return;

        var file = files[0];

        uploadFile(files[0])
        .done(function(data) {
            var fileId = data._id;

            createNewScope(function(err) {
                var type = files[0].type.substring(0, 5);
                
                if(type === "audio") {

                    $.post('scopes/' + model._id, {
                       'audio' : fileId 
                    }).done(function() {
                        model.audio = fileId;
                        scope.setAudio("files/" + fileId);
                    });
                }

                if(type === "image") {

                    $.post('scopes/' + model._id, {
                       'image' : fileId 
                    }).done(function() {
                        model.image = fileId;
                        scope.setImage("files/" + fileId);
                    });
                }
            });

        });      
    }


    new DragDrop($("#dragdrop-layer")[0], dropHandler);
    new DragDrop($("#howto-layer")[0], dropHandler);

    /* -------------------------------------------------------------------- */
    // Application pushState routing
    /* -------------------------------------------------------------------- */
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


