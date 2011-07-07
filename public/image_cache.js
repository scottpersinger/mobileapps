/**
 * Tricky script to paint images onto a canvas, then store the image data in localStorage so that
 * the images are available offline.
 * @class Utility for storing images for offline access.
 */

var ImageCache = {
  cache : function(img) {
    var key = img.src;
    if (!localStorage.getItem('key')) {
      console.log("Caching: " + key);
      var canv = $('#img-cache-canvas');
      if (canv.length == 0) {
        canv = document.createElement("canvas");
        canv.style.display = 'none';
        document.body.appendChild(canv);
      } else {
        canv = canv[0];
      }
      canv.style.width = img.width;
      canv.style.height = img.height;
      var context = canv.getContext('2d');
      context.drawImage(img, 0, 0);
    
      var dataURL = canv.toDataURL();
      localStorage.setItem(key, dataURL);
    }   
  }
}
