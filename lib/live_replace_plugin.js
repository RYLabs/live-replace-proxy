const fs = require("fs");

function liveReplacePlugin(hosts, scriptId, scriptFile) {
  const scriptTagRegExp = new RegExp(
    '<script id="' + scriptId + '">[.\\s\\S]*?<\\/script>'
  );

  hosts = [hosts].reduce((acc, e) => acc.concat(e), []);

  return {
    summary: "Replace JavaScript block with local script file",

    *beforeSendResponse(requestDetail, responseDetail) {
      const { hostname } = requestDetail.requestOptions;
      if (hosts.indexOf(hostname) >= 0) {
        const newResponse = responseDetail.response;
        return new Promise((resolve, reject) => {
          fs.readFile(scriptFile, "utf8", (err, contents) => {
            if (err) {
              reject(err);
            } else {
              newResponse.body = newResponse.body
                .toString()
                .replace(
                  scriptTagRegExp,
                  '<script id="' + scriptId + '">' + contents + "</script>"
                );
              resolve({ response: newResponse });
            }
          });
        });
      }
    },

    *beforeDealHttpsRequest(requestDetail) {
      const { host } = requestDetail;
      if (hosts.indexOf(host) >= 0) {
        return true;
      }
      if (host.endsWith(":443")) {
        return hosts.indexOf(host.substring(0, host.length - 4)) >= 0;
      }
      return false;
    }
  };
}

module.exports = liveReplacePlugin;
