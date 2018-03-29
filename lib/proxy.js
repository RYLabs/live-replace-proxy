const AnyProxy = require("anyproxy"),
  liveReplacePlugin = require("./live_replace_plugin");

class LiveReplaceProxy {
  constructor(hosts, scriptId, scriptFile, options) {
    const proxyOptions = {
      port: 8888,
      silent: true
    };
    Object.assign(proxyOptions, options);
    proxyOptions.rule = liveReplacePlugin(hosts, scriptId, scriptFile);

    this.port = proxyOptions.port;
    this.ssl = !!proxyOptions.ssl;

    delete proxyOptions.ssl;

    this.server = new AnyProxy.ProxyServer(proxyOptions);
  }

  start() {
    this.server.on("ready", () => {
      console.log("Proxy listening on port " + this.port);
    });
    this.server.on("error", err => {
      console.log("Error staring proxy:", err);
    });
    this.server.start();
  }

  configureProxySettings() {
    console.log("configuring system proxy settings...");
    AnyProxy.utils.systemProxyMgr.enableGlobalProxy(
      "127.0.0.1",
      "" + this.port,
      "http"
    );
    if (this.ssl) {
      AnyProxy.utils.systemProxyMgr.enableGlobalProxy(
        "127.0.0.1",
        "" + this.port,
        "https"
      );
    }
  }

  unconfigureProxySettings() {
    console.log("unconfiguring system proxy settings...");
    AnyProxy.utils.systemProxyMgr.disableGlobalProxy("http");
    if (this.ssl) {
      AnyProxy.utils.systemProxyMgr.disableGlobalProxy("https");
    }
  }

  generateRootCA() {
    if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
      AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
        // let users to trust this CA before using proxy
        if (!error) {
          const certDir = require("path").dirname(keyPath);
          console.log("The cert is generated at", certDir);
          const isWin = /^win/.test(process.platform);
          if (isWin) {
            exec("start .", { cwd: certDir });
          } else {
            exec("open .", { cwd: certDir });
          }
        } else {
          console.error("error when generating rootCA", error);
        }
      });
    }
  }
}

module.exports = LiveReplaceProxy;
