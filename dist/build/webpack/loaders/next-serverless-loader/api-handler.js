"use strict";exports.__esModule=true;exports.getApiHandler=getApiHandler;var _url=require("url");var _apiUtils=require("../../../../next-server/server/api-utils");var _utils=require("./utils");function getApiHandler(ctx){const{pageModule,encodedPreviewProps,pageIsDynamic,experimental:{initServer,onError}}=ctx;const{handleRewrites,handleBasePath,dynamicRouteMatcher,normalizeDynamicRouteParams}=(0,_utils.getUtils)(ctx);return async(req,res)=>{try{await initServer();// We need to trust the dynamic route params from the proxy
// to ensure we are using the correct values
const trustQuery=req.headers[_utils.vercelHeader];const parsedUrl=handleRewrites((0,_url.parse)(req.url,true));if(parsedUrl.query.nextInternalLocale){delete parsedUrl.query.nextInternalLocale;}handleBasePath(req,parsedUrl);let params={};if(pageIsDynamic){const result=normalizeDynamicRouteParams(trustQuery?parsedUrl.query:dynamicRouteMatcher(parsedUrl.pathname));params=result.params;}await(0,_apiUtils.apiResolver)(req,res,Object.assign({},parsedUrl.query,params),await pageModule,encodedPreviewProps,true,onError);}catch(err){console.error(err);await onError(err);// TODO: better error for DECODE_FAILED?
if(err.code==='DECODE_FAILED'){res.statusCode=400;res.end('Bad Request');}else{// Throw the error to crash the serverless function
throw err;}}};}
//# sourceMappingURL=api-handler.js.map