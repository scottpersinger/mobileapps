var SUPPORT_TOUCH = (typeof Touch != "undefined");
var START_EVENT = SUPPORT_TOUCH? 'touchstart' : 'mousedown';
var MOVE_EVENT = SUPPORT_TOUCH? 'touchmove' : 'mousemove';
var END_EVENT = SUPPORT_TOUCH? 'touchend' : 'mouseup';

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

function tc_scrape() {
  posts = [];

  $('.post').each(function() {
    post = {};

    root = $(this);
    post.title = root.find('.h2').text();
    post.url = root.find('.h2').attr('href');
    
    post.date = root.find('.calendar').text();
    post.author = root.find('.post-author').text().replace('Author: ','');
    post.body = root.find('.mainentry').text();
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
  
  $.post(scrapeUrl, 
    {url:tcurl, 
     body:body}, function(res) {
       console.log(res);
       callback(res);
  }).error(function(jqXHR, textStatus, errorThrown) {
     if (errorThrown) {
       errorThrown = errorThrown.message;
     }
     alert('TC scrape error (' + scrapeUrl + '): ' + textStatus + ': ' + errorThrown);
   });
}

function run_locally(flag) {
  if (flag) {
    localStorage.setItem('scrapeUrl', 'http://localhost:8080/scrape');
  } else {
    localStorage.removeItem('scrapeUrl');
  }
  
}

function clear_storage() {
  localStorage.removeItem('posts');
  localStorage.removeItem('urls');
}

function debug(msg) {
  console.log(msg);
  //$.get('http://localhost:8080/log', {msg: msg});
}

function demarshal_post(post) {
  post.date = new Date(Date.parse(post.date));
  return post;
}

// posts is an array stored locally with our current set of stories in reverse
// chron order. To maintain the order, we prepend new stories to the array.

function loadPosts(items, postBuilder) {
  console.log("loadPosts");
  
  var posts = localStorage.getObject('posts', demarshal_post) || [];
  var urls = localStorage.getObject('urls') || {};

  // items is newest first, latest last. So process them in reverse order
  // and prepend to the posts array.
  $.each(items.reverse(), function() {
    if (!urls[this.url]) {
      var m;
      if ((m = this.url.match(/20\d\d\/\d\d\/\d\d/))) {
        this.date = new Date(Date.parse(m[0]));
      } else {
        this.date = new Date();
      }
      
      posts.unshift(this);
      urls[this.url] = 'x';
    }
  });
  localStorage.setObject('urls', urls);
  localStorage.setObject('posts', posts);
  $.each(posts, function() {
    console.log("Calling postBulder with: ", this);
    postBuilder(this);
  });
}

