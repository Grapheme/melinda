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
        }, 3000);
    }, 500);   

    function toggleHelp() {
        if( $("#howto-layer").is(":visible") ) {
            $("#howto-layer").fadeOut(500);
            
            $("#kaleidoscope-layer").css({ "-webkit-filter" : "none" });
    
        } else {
            $("#howto-layer").fadeIn(500);
            $("#kaleidoscope-layer").css({ "-webkit-filter" : "blur(5px)" });
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
        var image = location.origin + "/images/share-image.png";

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
        if( window.currentDancer ) {
            if( !window.currentDancer.isPlaying() ) {
                $("#play-image").removeClass("hidden");

                setTimeout(function() {
                    $("#play-image").addClass("hidden");
                }, 0);

               window.currentDancer.play();
            } else {
                $("#pause-image").removeClass("hidden");

                setTimeout(function() {
                    $("#pause-image").addClass("hidden");
                }, 0);

                window.currentDancer.pause();
            }
        }
    });

    function moveKaleidoscope(factorx, factory) {
        if( window.currentDancer && window.currentDancer.isPlaying()) {
            return;
        }
        scope.angleTarget = factorx;
        scope.zoomTarget  = 1.0 + 0.5 * factory;
    }

    var x = 0, v = 0, r = 0;

    
    function dancerAnalyzeHandler() {
        var one = 0.15 * x;
        var two = 100 * this.getFrequency(32, 128);
        r += 0.1 * (two - r);
        scope.angleTarget = r;
        scope.zoomTarget  = 1.0 + 5.0 * one;

        var a = 4;
        var b = 1;
        var dt = 0.1;

        var force = a * (-x) + b * (-v);
        v += force * dt;
        x += v * dt;
    }

    function dancerKickHandler(a) {  x = a; }

    function setAudio(audioUrl) {
        var dancer = new Dancer();

        dancer.bind("loaded", function() {
            if(window.currentDancer) {
                window.currentDancer.pause();
            }
            dancer.play();
            window.currentDancer = dancer;
        });

        dancer.createKick({
            onKick: dancerKickHandler
        }).on();

        dancer.after(0, dancerAnalyzeHandler);
        // Using an audio object
        var audioElement = new Audio();


        document.body.appendChild(audioElement);
        audioElement.style.display = "none";

        audioElement.addEventListener("canplay", function() {
            dancer.load( audioElement );
        });

        audioElement.src = audioUrl;
        
    }


    dragdropLayer.mousemove(function(event) {
        moveKaleidoscope(
            event.pageX / $(window).width(),
            event.pageY / $(window).height()
        );
    });

    dragdropLayer.on("touchmove", function(evt) {
        evt.preventDefault();
        var originalEvent = evt.originalEvent;
        
        var touch = originalEvent.touches[0];  
        moveKaleidoscope(
            touch.pageX / $(window).width(),
            touch.pageY / $(window).height()
        );
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
                        setAudio("files/" + fileId);
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


    DragDrop($("#dragdrop-layer")[0], dropHandler);
    DragDrop($("#howto-layer")[0], dropHandler);

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
            setAudio("files/" + model.audio);
        })
        .fail(function() {
            page("/");
        });
    });

    page();
});


