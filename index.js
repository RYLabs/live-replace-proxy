const LiveReplaceProxy = require("./lib/proxy");

function proxy(hosts, scriptId, scriptFile, options) {
  return new LiveReplaceProxy(hosts, scriptId, scriptFile, options);
}

exports.proxy = proxy;
