var Mpeg1Muxer, child_process, events, util;

child_process = require("child_process");

util = require("util");

events = require("events");
console.log("#");
Mpeg1Muxer = function (options) {
  var key;
  this.url = options.url;
  this.ffmpegOptions = options.ffmpegOptions;

  this.exitCode = undefined;
  this.additionalFlags = [];
  if (this.ffmpegOptions) {
    for (key in this.ffmpegOptions) {
      this.additionalFlags.push(key);
      if (String(this.ffmpegOptions[key]) !== "") {
        this.additionalFlags.push(String(this.ffmpegOptions[key]));
      }
    }
  }
  this.spawnOptions = [
    "-i",
    this.url,
    "-f",
    "mpegts",
    "-codec:v",
    "mpeg1video",
    // additional ffmpeg options go here
    ...this.additionalFlags,
    "-",
  ];
  this.stream = child_process.spawn(options.ffmpegPath, this.spawnOptions, {
    detached: false,
  });
  this.inputStreamStarted = true;
  this.stream.stdout.on("data", (data) => {
    // 직접 연결이 되어있을 때, 여기로 통신이 됨
    // loading 화면 제작을 해야할 듯
    return this.emit("mpeg1data", data);
  });
  this.stream.stderr.on("data", (data) => {
    return this.emit("ffmpegStderr", data);
  });
  this.stream.on("exit", (code, signal) => {
    if (code === 1) {
      console.error("RTSP stream exited with error");
      this.exitCode = 1;
      return this.emit("exitWithError");
    }
  });
  return this;
};

util.inherits(Mpeg1Muxer, events.EventEmitter);

module.exports = Mpeg1Muxer;
