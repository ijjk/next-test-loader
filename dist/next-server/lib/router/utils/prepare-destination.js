"use strict";exports.__esModule=true;exports.default=prepareDestination;var _querystring=require("./querystring");var _parseRelativeUrl=require("./parse-relative-url");var pathToRegexp=_interopRequireWildcard(require("next/dist/compiled/path-to-regexp"));function _getRequireWildcardCache(){if(typeof WeakMap!=="function")return null;var cache=new WeakMap();_getRequireWildcardCache=function(){return cache;};return cache;}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache();if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function prepareDestination(destination,params,query,appendParamsToQuery,basePath){let parsedDestination={};if(destination.startsWith('/')){parsedDestination=(0,_parseRelativeUrl.parseRelativeUrl)(destination);}else{const{pathname,searchParams,hash,hostname,port,protocol,search,href}=new URL(destination);parsedDestination={pathname,query:(0,_querystring.searchParamsToUrlQuery)(searchParams),hash,protocol,hostname,port,search,href};}const destQuery=parsedDestination.query;const destPath=`${parsedDestination.pathname}${parsedDestination.hash||''}`;const destPathParamKeys=[];pathToRegexp.pathToRegexp(destPath,destPathParamKeys);const destPathParams=destPathParamKeys.map(key=>key.name);let destinationCompiler=pathToRegexp.compile(destPath,// we don't validate while compiling the destination since we should
// have already validated before we got to this point and validating
// breaks compiling destinations with named pattern params from the source
// e.g. /something:hello(.*) -> /another/:hello is broken with validation
// since compile validation is meant for reversing and not for inserting
// params from a separate path-regex into another
{validate:false});let newUrl;// update any params in query values
for(const[key,strOrArray]of Object.entries(destQuery)){let value=Array.isArray(strOrArray)?strOrArray[0]:strOrArray;if(value){// the value needs to start with a forward-slash to be compiled
// correctly
value=`/${value}`;const queryCompiler=pathToRegexp.compile(value,{validate:false});value=queryCompiler(params).substr(1);}destQuery[key]=value;}// add path params to query if it's not a redirect and not
// already defined in destination query or path
const paramKeys=Object.keys(params);if(appendParamsToQuery&&!paramKeys.some(key=>destPathParams.includes(key))){for(const key of paramKeys){if(!(key in destQuery)){destQuery[key]=params[key];}}}const shouldAddBasePath=destination.startsWith('/')&&basePath;try{newUrl=`${shouldAddBasePath?basePath:''}${encodeURI(destinationCompiler(params))}`;const[pathname,hash]=newUrl.split('#');parsedDestination.pathname=pathname;parsedDestination.hash=`${hash?'#':''}${hash||''}`;delete parsedDestination.search;}catch(err){if(err.message.match(/Expected .*? to not repeat, but got an array/)){throw new Error(`To use a multi-match in the destination you must add \`*\` at the end of the param name to signify it should repeat. https://err.sh/vercel/next.js/invalid-multi-match`);}throw err;}// Query merge order lowest priority to highest
// 1. initial URL query values
// 2. path segment values
// 3. destination specified query values
parsedDestination.query={...query,...parsedDestination.query};return{newUrl,parsedDestination};}
//# sourceMappingURL=prepare-destination.js.map