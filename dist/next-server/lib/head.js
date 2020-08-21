"use strict";exports.__esModule=true;exports.defaultHead=defaultHead;exports.default=void 0;var _react=_interopRequireWildcard(require("react"));var _sideEffect=_interopRequireDefault(require("./side-effect"));var _ampContext=require("./amp-context");var _headManagerContext=require("./head-manager-context");var _amp=require("./amp");function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _getRequireWildcardCache(){if(typeof WeakMap!=="function")return null;var cache=new WeakMap();_getRequireWildcardCache=function(){return cache;};return cache;}function _interopRequireWildcard(obj){if(obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache();if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function defaultHead(inAmpMode=false){const head=[/*#__PURE__*/_react.default.createElement("meta",{charSet:"utf-8"})];if(!inAmpMode){head.push(/*#__PURE__*/_react.default.createElement("meta",{name:"viewport",content:"width=device-width"}));}return head;}function onlyReactElement(list,child){// React children can be "string" or "number" in this case we ignore them for backwards compat
if(typeof child==='string'||typeof child==='number'){return list;}// Adds support for React.Fragment
if(child.type===_react.default.Fragment){return list.concat(_react.default.Children.toArray(child.props.children).reduce((fragmentList,fragmentChild)=>{if(typeof fragmentChild==='string'||typeof fragmentChild==='number'){return fragmentList;}return fragmentList.concat(fragmentChild);},[]));}return list.concat(child);}const METATYPES=['name','httpEquiv','charSet','itemProp'];/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/function unique(){const keys=new Set();const tags=new Set();const metaTypes=new Set();const metaCategories={};return h=>{let isUnique=true;if(h.key&&typeof h.key!=='number'&&h.key.indexOf('$')>0){const key=h.key.slice(h.key.indexOf('$')+1);if(keys.has(key)){isUnique=false;}else{keys.add(key);}}// eslint-disable-next-line default-case
switch(h.type){case'title':case'base':if(tags.has(h.type)){isUnique=false;}else{tags.add(h.type);}break;case'meta':for(let i=0,len=METATYPES.length;i<len;i++){const metatype=METATYPES[i];if(!h.props.hasOwnProperty(metatype))continue;if(metatype==='charSet'){if(metaTypes.has(metatype)){isUnique=false;}else{metaTypes.add(metatype);}}else{const category=h.props[metatype];const categories=metaCategories[metatype]||new Set();if(categories.has(category)){isUnique=false;}else{categories.add(category);metaCategories[metatype]=categories;}}}break;}return isUnique;};}/**
 *
 * @param headElements List of multiple <Head> instances
 */function reduceComponents(headElements,props){return headElements.reduce((list,headElement)=>{const headElementChildren=_react.default.Children.toArray(headElement.props.children);return list.concat(headElementChildren);},[]).reduce(onlyReactElement,[]).reverse().concat(defaultHead(props.inAmpMode)).filter(unique()).reverse().map((c,i)=>{const key=c.key||i;if(process.env.__NEXT_OPTIMIZE_FONTS&&!props.inAmpMode){if(c.type==='link'&&c.props['href']&&// TODO(prateekbh@): Replace this with const from `constants` when the tree shaking works.
['https://fonts.googleapis.com/css'].some(url=>c.props['href'].startsWith(url))){const newProps={...(c.props||{})};newProps['data-href']=newProps['href'];newProps['href']=undefined;return _react.default.cloneElement(c,newProps);}}return _react.default.cloneElement(c,{key});});}/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */function Head({children}){const ampState=(0,_react.useContext)(_ampContext.AmpStateContext);const headManager=(0,_react.useContext)(_headManagerContext.HeadManagerContext);return/*#__PURE__*/_react.default.createElement(_sideEffect.default,{reduceComponentsToState:reduceComponents,headManager:headManager,inAmpMode:(0,_amp.isInAmpMode)(ampState)},children);}// TODO: Remove in the next major release
Head.rewind=()=>{};var _default=Head;exports.default=_default;
//# sourceMappingURL=head.js.map