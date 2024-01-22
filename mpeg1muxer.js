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
    "-rtsp_transport",
    "tcp",
    "-correct_ts_overflow",
    "0",
    "-i",
    this.url,
    "-f",
    "mpegts",
    "-codec:v",
    "mpeg1video",
    "-b:v", // 비디오 비트레이트를 설정. 이 경우, 비디오 스트림은 1000Kbps (1Mbps)로 제한.
    "2000k",
    "-maxrate", // 비디오의 최대 비트레이트를 4000Kbps로 제한. 이것은 비트레이트 컨트롤에 사용.
    "4000k",
    "-an", // 오디오를 무시. -an 옵션은 오디오 스트림을 무시하고 비디오만 처리하도록 설정.
    "-r", // 비디오의 프레임 속도를 설정. 이 경우, 비디오 스트림은 초당 24프레임으로 설정.
    "30",
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
