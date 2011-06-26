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
  
  $.post('http://localhost:8080/scrape', 
    {url:tcurl, 
     body:body}, function(res) {
       console.log(res);
       callback(res);
  }).error(function() {alert('error occurred scraping TC home page');});
}

function debug(msg) {
  //$.get('http://localhost:8080/log', {msg: msg});
}