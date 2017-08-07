(function(){
  var currentScript = document.currentScript;
  if (!currentScript || !currentScript.parentNode) {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0, n = scripts.length; i < n; i++) {
      var s = scripts[i];
      if (!s.processed && -1 != s.src.indexOf('meteo_widget.js')) {
        s.processed = true;
        currentScript = s;
        break;
      }
    }
  }
  if (!currentScript || !currentScript.parentNode) {
    return;
  }
  var id = currentScript.src.split('?')[1].split('=')[1];
  if (!id)
    return;

  var widget = document.createElement("div");
  widget.innerHTML = "Loading...";
  currentScript.parentNode.insertBefore(widget, currentScript);

  var baseUrl = currentScript.src.split('meteo_widget.js')[0];
  var url = baseUrl + 'meteo_widget/' + id

  var xmlhttp = createRequest();
  xmlhttp.open("GET", url, true);
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4) {
      widget.innerHTML = xmlhttp.responseText;
    }
  };
  xmlhttp.send(null);

  function createRequest()
  {
    var xmlhttp=false;
    /*@cc_on @*/
    /*@if (@_jscript_version >= 5)
    // JScript gives us Conditional compilation, we can cope with old IE versions.
    // and security blocked creation of the objects.
    try {
      xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (E) {
        xmlhttp = false;
      }
    }
    @end @*/
    if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
      try {
        xmlhttp = new XMLHttpRequest();
      } catch (e) {
        xmlhttp=false;
      }
    }
    if (!xmlhttp && window.createRequest) {
      try {
        xmlhttp = window.createRequest();
      } catch (e) {
        xmlhttp=false;
      }
    }
    return xmlhttp;
  }
})();
