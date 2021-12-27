WebRtcCall = function(id,host) {
var webRtcServer = null;
webRtcServer = new WebRtcStreamer(id,"https://shinobi-host.someserver.com:8743");
webRtcServer.connect(host);
}
