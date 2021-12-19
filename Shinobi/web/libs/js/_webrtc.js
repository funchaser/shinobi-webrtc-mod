// see etc/systemd/system/webrtc-streamer.service file ....
// if you are using domain name for you host:
// webRtcServer = new WebRtcStreamer(id,"https://shinobi-host.someserver.com:8743");
// if you are not using domain name for you host, use the locahost or whatever.... :
// webRtcServer = new WebRtcStreamer(id,"http://localhost:8743");

window._var_webrtc = [];
window._var_webrtc_id = [];
window._var_webrtc_auth = "";
window._var_webrtc_host = [];

if( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', initWebRTC );
}
else if( document.readyState === 'interactive' || document.readyState === 'complete' ) {
    initWebRTC();
}

function initWebRTC() {
 
      ns=document.querySelectorAll("[id^='webrtc_']").length;
      if(ns > 0)
      {
        for (const [key, value] of Object.entries(window._var_webrtc)){
        if (document.getElementById('webrtc_'+key)) {
        if ( window._var_webrtc[key] < 1) {
        WebRtcCall(window._var_webrtc_id[key],window._var_webrtc_host[key]);
        window._var_webrtc[key] = 1;
        }
        }
        }  
      }
      else 
      {
      setTimeout(arguments.callee, 100); // call myself again in 300 msecs
      }
}

WebRtcCall = function(id,host) {
var webRtcServer = null;
webRtcServer = new WebRtcStreamer(id,"https://shinobi-host.someserver.com:8743");
webRtcServer.connect(host);
}
