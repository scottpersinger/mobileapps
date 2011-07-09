/*
 @@@@@@@@@@@@@>      @@@@@@@@@@>
 @>    @@@>  @>      @>         
 @>     @>   @>      @@@@@@@@@@>
 @>          @>               @>
 @>          @>               @>
 @>          @>      @@@@@@@@@>       

 (c) Scott Persinger 2011. See LICENSE.txt for license.
 
 M5 support
*/

/* System class additions */
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key, demarshal) {
    var result = JSON.parse(this.getItem(key));
    if (demarshal && result && typeof(result.length) != "undefined") {
      result = $.map(result, demarshal);
    }
    return result;
}

Date.prototype.datesEqual = function(other) {
  if (other && typeof(other) == 'object') {
    return this.toDateString() == other.toDateString();
  } else {
    return false;
  }
}

/** M5.util defines a set of utility functions.
 */
 
M5.util = (function() {
  var benchmarks = [];
  
  return {
    benchmark: benchmark,
    bench_start: bench_start,
    bench_end: bench_end,
    hash: hash
  }
  
  /**#@+
     @public
     @memberOf M5.util#
  */
  
  /** Mark the time that event 'key' starts. */
  function bench_start(key) {
    benchmarks[key] = new Date();
  }

  /** Report the time since bench_start(key) was called. */
  function bench_end(key) {
    var start;
    if (start = benchmarks[key]) {
      console.log("Benchmark == " + key + "  == " + ((new Date() - start)/1000) );
    }  
  }

  /** Report the time required to execute function f. */
  function benchmark(label, f) {
    var start = new Date();
    f();
    console.log("Benchmark == " + label + "  == " + ((new Date() - start)/1000) );
  }

  /** Return a hash generated from 'key' */
  function hash(key, tableSize) {
    tableSize = tableSize || 99999999;
    var s = key;

    var b = 27183, h = 0, a = 31415;

    if (tableSize > 1) {
      for (i = 0; i < s.length; i++) {
        h = (a * h + s[i].charCodeAt()) % tableSize;
        a = ((a % tableSize) * (b % tableSize)) % (tableSize);
      }
    }

    return h;
  }
  
})();
