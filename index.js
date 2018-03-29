const LiveReplaceProxy = require('proxy');

export function proxy(hosts, scriptId, scriptFile, options) {
  return new LiveReplaceProxy(hosts, scriptId, scriptFile, options);
}
