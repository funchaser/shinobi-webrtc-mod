WebRtcCall = function(id,host) {
var webRtcServer = null;
webRtcServer = new WebRtcStreamer(id,"https://centos-pxe.rentandroam.com:8743");
webRtcServer.connect(host);
}
