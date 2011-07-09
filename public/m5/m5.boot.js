/*
 @@@@@@@@@@@@@>      @@@@@@@@@@>
 @>    @@@>  @>      @>         
 @>     @>   @>      @@@@@@@@@@>
 @>          @>               @>
 @>          @>               @>
 @>          @>      @@@@@@@@@>       

 (c) Scott Persinger 2011. See LICENSE.txt for license.
  
  Boot script for M5 apps.
  
    M5.silent_update(flag) => call with true to update cached app without prompting user
    M5.settings => hash of arbitrary app settings
    M5.orig_console => holds the native value of the 'console' object
    M5.setUpdateListener(callback) => Callback to invoke after app is updated
    M5.addConsoleListener(callback) => Register a callback to receive console.log calls
    M5.env => 'development|production|testing'
    M5.production => true if in production environment
    M5.development => true if in production environment
    M5.testing => true if in production environment
*/

M5 = (function() {
  var cacheStatusValues = [];
  cacheStatusValues[0] = 'uncached';
  cacheStatusValues[1] = 'idle';
  cacheStatusValues[2] = 'checking';
  cacheStatusValues[3] = 'downloading';
  cacheStatusValues[4] = 'updateready';
  cacheStatusValues[5] = 'obsolete';
  var updateListener;
  var silent_update;
  var log_handlers = [];
  var prod_env = true;
  var dev_env = false;
  var test_env = false;
  var environment = 'production';

  function set_env(val) {
    environment = val;
    M5.env = val;
    
    if (environment == 'development') {
      dev_env = true;
      prod_env = false;
      test_env = false;
    } else if (environment == 'testing') {
      dev_env = true;
      prod_env = false;
      test_env = true;
    } else {
      dev_env = false;
      prod_env = true;
      test_env = false;
    }
  }
  
  function setUpdateListener(callback) {
    updateListener = callback;
  }
  
  function silent_update(flag) {
    silent_update = flag;
  }
  
  function m5_log() {
    var args = Array.prototype.slice.call(arguments);  
    M5.orig_console.log.apply(M5.orig_console, args);
    $.each(log_handlers, function() {
      this(args);
    });
  }
  
  function addConsoleListener(callback) {
    log_handlers.push(callback);
  }
  
  /** Utility for specifying dependencies in your code to other modules. Use: M5.require('SimpleStorage'). */
  function require(module) {
    if (eval("typeof(" + module + ")") == "undefined") {
      var stack = null;
      try { throw Error() } catch(ex) { stack = ex.stack };
      
      alert("Missing required module '" + module + "' from " + stack);
    }
  }
  
  window.applicationCache.addEventListener('updateready', function(e){
        var cache = window.applicationCache;
        
        // Don't perform "swap" if this is the first cache
        if (cacheStatusValues[cache.status] != 'idle') {
            if (silent_update || confirm("Update the application?")) {
              cache.swapCache();
              console.log('Swapped/updated the Cache Manifest.');
              if (updateListener) {
                updateListener();
              }
            }
        }
    }
  , false);

  return {
    setUpdateListener: setUpdateListener,
    silent_update: silent_update,
    m5_log: m5_log,
    orig_console: console,
    addConsoleListener: addConsoleListener,
    production: prod_env,
    development: dev_env,
    require: require,
    testing: test_env,
    set_env: set_env,
    env: environment,
    settings: {}
  }
})();
 
console = {log: M5.m5_log};

 