"use strict";exports.__esModule=true;exports.default=getRouteFromEntrypoint;var _normalizePagePath=require("./normalize-page-path");// matches static/<buildid>/pages/:page*.js
// const SERVER_ROUTE_NAME_REGEX = /^static[/\\][^/\\]+[/\\]pages[/\\](.*)$/
// matches pages/:page*.js
const SERVER_ROUTE_NAME_REGEX=/^pages[/\\](.*)$/;// matches static/pages/:page*.js
const BROWSER_ROUTE_NAME_REGEX=/^static[/\\]pages[/\\](.*)$/;function matchBundle(regex,input){const result=regex.exec(input);if(!result){return null;}return(0,_normalizePagePath.denormalizePagePath)(`/${result[1]}`);}function getRouteFromEntrypoint(entryFile,// TODO: Remove this parameter
_isServerlessLike=false){let pagePath=matchBundle(SERVER_ROUTE_NAME_REGEX,entryFile);if(pagePath){return pagePath;}// Potentially the passed item is a browser bundle so we try to match that also
return matchBundle(BROWSER_ROUTE_NAME_REGEX,entryFile);}
//# sourceMappingURL=get-route-from-entrypoint.js.map