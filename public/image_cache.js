/**
 * Tricky script to paint images onto a canvas, then store the image data in localStorage so that
 * the images are available offline.
 * @class Utility for storing images for offline access.
 */

var ImageCache = {
  warning_printed: false,
  
  cache : function(img, width, height) {
    var key = img.src;
    if (!key.match(new RegExp("https?://" + window.location.hostname))) {
      if (!ImageCache.warning_printed) {
        console.log("Can't cache image from different domain: " + key);
        ImageCache.warning_printed = true;
      }
      return;
    }
    
    width = (width || img.width) * 2;
    height = (height || img.height) * 2;
    if (key.match(/^http:/) && !localStorage.getItem('key')) {
      console.log("Caching: " + key + " at size " + width + " x " + height);
      var canv = $('#img-cache-canvas');
      if (canv.length == 0) {
        canv = document.createElement("canvas");
        canv.style.display = 'none';
        document.body.appendChild(canv);
      } else {
        canv = canv[0];
      }
      canv.style.width = width;
      canv.style.height = height;
      var context = canv.getContext('2d');
      context.drawImage(img, 0, 0, width, height);
    
      var dataURL = canv.toDataURL();
      localStorage.setItem(key, dataURL);
    }   
  },
  
  image_src: function(img_src) {
    return localStorage.getItem(img_src) || img_src;
  },
  
  VERSION:0.1
}
