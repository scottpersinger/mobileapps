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

/* Utils */

var Utils = Utils || {};

Utils.benchmarks = {};

Utils.bench_start = function(key) {
  Utils.benchmarks[key] = new Date();
}

Utils.bench_end = function(key) {
  var start;
  if (start = Utils.benchmarks[key]) {
    console.log("Benchmark == " + key + "  == " + ((new Date() - start)/1000) );
  }  
}

Utils.benchmark = function(label, f) {
  var start = new Date();
  f();
  console.log("Benchmark == " + label + "  == " + ((new Date() - start)/1000) );
}

Utils.hash = function(key, tableSize) {
  tableSize = tableSize || 999999;
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

Utils.require = function(name) {
  // make sure some script is loaded
}

/* BlogReader class */

function BlogReader(db) {
  Utils.require('Storage');

  var tc_home = 'http://techcrunch.com';
  //tcurl = 'http://localhost:8000/jqtouch-bee/test/techcrunch.html';
  
  function demarshal_post(post) {
    var datestr = post.date.substring(0,10).replace(/-/g,'/');
    res = new Date(Date.parse(datestr));
    post.date = res;
    return post;
  }

  function tc_scrape() {
    posts = [];

    $('.post').each(function() {
      post = {};

      root = $(this);
      post.title = root.find('.h2').text();
      post.url = root.find('.h2').attr('href');

      post.date = root.find('.calendar').text();
      post.author = root.find('.post-author').text().replace('Author: ','');
      post.body = root.find('.mainentry').html();
      post.img = root.find('.mainentry img').attr('src');

      return posts.push(post);
    });

    return posts;
  }

  function load_tc_home(callback) {
    var lines = tc_scrape.toString().split("\n");
    var body = lines.splice(1, lines.length-2).join("\n");

    var tcurl = 'http://techcrunch.com';
    //tcurl = 'http://localhost:8000/jqtouch-bee/test/techcrunch.html';

    debug("Loading Techcrunch home page");
    var scrapeUrl = localStorage.getItem('scrapeUrl');
    scrapeUrl = scrapeUrl || 'http://simple-cloud-843.herokuapp.com/scrape';

    Utils.bench_start("scrape");
    $.post(scrapeUrl, 
      {url:tcurl, 
       body:body}, function(res) {
         Utils.bench_end("scrape");
         callback(res);
    }).error(function(jqXHR, textStatus, errorThrown) {
       if (errorThrown) {
         errorThrown = errorThrown.message;
       }
       alert('TC scrape error (' + scrapeUrl + '): ' + textStatus + ': ' + errorThrown);
     });
  }

  function loadStory(url, elt) {
    var scrapeUrl = localStorage.getItem('scrapeUrl');
    scrapeUrl = scrapeUrl || 'http://simple-cloud-843.herokuapp.com/scrape';
    
    var uid = Utils.hash(url, 999999);
    db.select_all('stories', {where: {uid: uid}}, function(results) {
      if (results.length > 0) {
        console.log("Setting story content to: " + elt);
        $(elt).html(results[0].body);
      } else {
        $.post(scrapeUrl,
            {url: url, body: "return $('#singlentry').text()" },
            function(res) {
              console.log("Setting story content to: " + elt);
              $(elt).html(res);
              story = {uid: uid, body: res};
              db.save('stories', story);
            }
        );
      }
    });
  }
  
  function run_locally(flag) {
    alert("Set local: " + flag);
    if (flag) {
      localStorage.setItem('scrapeUrl', 'http://localhost:8080/scrape');
    } else {
      localStorage.removeItem('scrapeUrl');
    }

  }

  function clear_storage() {
    db.delete_all('posts');
  }

  function debug(msg) {
    console.log(msg);
    //$.get('http://localhost:8080/log', {msg: msg});
  }

  var $posts = null;
  var $uids = {};
  
  // posts is an array stored locally with our current set of stories in reverse
  // chron order. To maintain the order, we prepend new stories to the array.

  function loadStoredPosts(postBuilder, completion) {
    db.select_all('posts', {order:{'id': 'desc'}}, function(posts) {
      $posts = posts;
      $.each(posts, function() {
        $uids[this.uid] = true;
        postBuilder(this);
      });
      completion(true);
    });
  }
  
  function loadNewPosts(postsBuilder, completion) {
    load_tc_home(function(results) {
      if (results && $.isArray(results)) {
        decorate_posts(results);
        // display and save any new posts
        var new_posts = [];
        $.each(results.reverse() /* oldest first */, function(index, item) {
          if (!$uids[item.uid]) {
            $uids[item.uid] = true;
            new_posts.push(item);
            $posts.unshift(item);
            postBuilder(item, true);
          }
        });
        
        // save new posts
        db.save('posts', new_posts, function() {
          db.create_index('posts', 'uid');
        });
        
        completion(true);
      } else {
        completion(false);
      }
    });
  }

  function decorate_posts(items) {
    $.each(items, function() {
      var m;
      if ((m = this.url.match(/20\d\d\/\d\d\/\d\d/))) {
        //console.log("Parsing date: " + m[0]);
        this.date = new Date(Date.parse(m[0]));
      } else {
        this.date = new Date();
      }
      this.uid = Utils.hash(this.url, 999999);
    });
  }
  
  function showPosts(new_items, postBuilder) {
    console.log("loadNewPosts");

    Utils.bench_start("getObject:posts");
    db.select_all('posts', {order:'id'}, function(posts) {
      // new_items is newest first, latest last. So process them in reverse order
      // and prepend to the posts array.
      Utils.bench_start("process posts");

      db.save('posts', new_items, function() {
        db.create_index('posts', 'uid');
        Utils.bench_end("setObject:urls:items");
        
        Utils.benchmark('display posts', function() {
        });
      })

      
    });

  }

  return {
    loadStoredPosts: loadStoredPosts,
    loadNewPosts: loadNewPosts,
    loadStory: loadStory,
    runLocally: run_locally,
    reset: clear_storage
  }
};
  



