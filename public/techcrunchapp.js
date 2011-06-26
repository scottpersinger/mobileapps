var SUPPORT_TOUCH = (typeof Touch != "undefined");
var START_EVENT = SUPPORT_TOUCH? 'touchstart' : 'mousedown';
var MOVE_EVENT = SUPPORT_TOUCH? 'touchmove' : 'mousemove';
var END_EVENT = SUPPORT_TOUCH? 'touchend' : 'mouseup';

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
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
  var scrapeUrl = 'http://' + window.location.hostname + ':8080/scrape';
  $.post(scrapeUrl, 
    {url:tcurl, 
     body:body}, function(res) {
       console.log(res);
       callback(res);
  }).error(function() {alert('error occurred scraping TC home page: ' + scrapeUrl);});
}
function clear_storage() {
  localStorage.removeItem('posts');
  localStorage.removeItem('urls');
}

function debug(msg) {
  console.log(msg);
  //$.get('http://localhost:8080/log', {msg: msg});
}

function loadPosts(items, postBuilder) {
  console.log("loadPosts");
  
  var posts = localStorage.getObject('posts') || [];
  var urls = localStorage.getObject('urls') || {};

  $.each(items.reverse(), function() {
    if (!urls[this.url]) {
      posts.push(this);
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

