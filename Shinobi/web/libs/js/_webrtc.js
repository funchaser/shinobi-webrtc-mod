//
//https://stackoverflow.com/questions/6686083/alternatives-to-window-onload/40768434
//
//https://www.w3schools.com/tags/ref_av_dom.asp
//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
//https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
//

window._var_webrtc = [];
window._var_webrtc_id = [];
window._var_webrtc_auth = "";
window._var_webrtc_host = [];

if( document.readyState === 'loading' ) {
    //alert("loading");  
    document.addEventListener( 'DOMContentLoaded', initWebRTC );
}
else if( document.readyState === 'interactive' || document.readyState === 'complete' ) {
    //alert("ready");
    initWebRTC();
}

function initWebRTC(x) {
  
//   if( document.documentElement.dataset['WebRTCLoaded'] === 'true' ) return;
//   do stuff...
//   document.documentElement.dataset['WebRTCLoaded'] = 'true';
//   }  
//    var elements = document.getElementsByTagName('div'); 
// document.getElementById(window._var_webrtc_auth).addEventListener('click', function (event) {  alert("CLICK");});
//          alert(document.getElementById('webrtc_'+key).readyState);
  
      ns=document.querySelectorAll("[id^='webrtc_']").length;
      if(ns > 0)
      {
//        alert(ns);
        for (const [key, value] of Object.entries(window._var_webrtc)){
        if (document.getElementById('webrtc_'+key)) {
//        alert('webrtc_'+key);
        if ( window._var_webrtc[key] < 1) {
        WebRtcCall(window._var_webrtc_id[key],window._var_webrtc_host[key]);
        window._var_webrtc[key] = 1;
//        setTimeout(arguments.callee, 100);  
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
webRtcServer = new WebRtcStreamer(id,"https://centos-pxe.rentandroam.com:8743");
webRtcServer.connect(host);
//console.log("+++++++++++++ ... connecting to webRTC stream ... +++++++++++++");
}
