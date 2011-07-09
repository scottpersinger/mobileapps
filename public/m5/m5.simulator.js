/*
 @@@@@@@@@@@@@>      @@@@@@@@@@>
 @>    @@@>  @>      @>         
 @>     @>   @>      @@@@@@@@@@>
 @>          @>               @>
 @>          @>               @>
 @>          @>      @@@@@@@@@>       
 
 (c) Scott Persinger 2011. See LICENSE.txt for license.
 
 M5 simulator
 
*/

M5.addTouchReady(function() {
  function debug(msg) {
    if (msg instanceof Array) {
        msg = msg.join(" ");
    }
    $('#m5-simpanel .m5-log').append(msg + "\n")
  }
  M5.addConsoleListener(debug);
  
  function loadBig() {
    setTimeout(function() {
      console.log("Setting margin");
      $(document.body).css('background', 'url(iphone.png) no-repeat');
    }, 200);
    var leftMargin = 28;
    var topMargin = 77;
    $('#jqt').css({width:(320), height:(480), 'margin-left' :'26px', 'margin-top': '77px', overflow:'hidden'});
    $(document.body).append(build_panel());
  }
  
  function loadInline() {
    $('#jqt').append('<div id="m5-sim" style="display:none"><div class="toolbar"><h1>Debug</h1><a class="button goback" href="#">Close</a></div>' +
      build_panel() + '</div>');
  }
  
  function build_panel() {  
    return '<div><div id="m5-simpanel">' +
      '<div>Environment: ' + M5.env + '</div>' +
      '<div>UserAgent: ' + navigator.userAgent + '</div>' +
      '<button class="m5-reload touch">Reload App</button><button class="m5-clear">Clear Log</button><br />' + 
      '<button class="m5-update touch">Update App Cache</button><br />' + 
      '<button class="m5-reset touch">Clear Local Storage</button><br />' +
      '<button class="m5-test1 touch">Test iframe</button><br />' +
      '<div class="m5-header">Log</div>' +
      '<textarea class="m5-log touch"></textarea>' +
      '</div></div>';
  }


  // Immediate code

  if (M5.settings.inline_sim || M5.iPhone || M5.Android) {
    loadInline();
  } else {
    loadBig();
  }
    
  $('#m5-simpanel .m5-reload').bind('click touchstart', function() {
    M5.setUpdateListener(function() {
      M5.silent_update(false);
      window.location.reload();
    });
    M5.silent_update(true);
    window.applicationCache.update();
  });
  $('#m5-simpanel .m5-update').click(function() {
    window.applicationCache.update();
  });
  $('#m5-simpanel .m5-clear').bind('click touchstart', function() {
    $('#m5-simpanel .m5-log').html('');
  });
  $('#m5-simpanel .m5-reset').click(function() {
    if (typeof(SimpleStorage) == "object") {
      SimpleStorage.db.tables(function(tables) {
        $.each(tables, function() {
          debug("Dropping: " +this);
          SimpleStorage.db.drop_table(this);
        });
      });
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      $.each(keys, function() { 
        debug("Removing localStorage: " + this);
        localStorage.removeItem(this) 
      });
      
    } else {
      debug("Please load SimpleStorage module");
    }
  });
  
  $('#m5-simpanel .m5-test1').click(function () {
    $('#fullstory').append('<iframe style="height:400px" src="http://www.google.com/" />');
  });
  
  M5.simulator = {
    
  }
});
