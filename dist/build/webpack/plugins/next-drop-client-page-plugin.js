"use strict";exports.__esModule=true;exports.DropClientPage=exports.ampFirstEntryNamesMap=void 0;var _constants=require("../../../next-server/lib/constants");const ampFirstEntryNamesMap=new WeakMap();exports.ampFirstEntryNamesMap=ampFirstEntryNamesMap;const PLUGIN_NAME='DropAmpFirstPagesPlugin';// Recursively look up the issuer till it ends up at the root
function findEntryModule(mod){const queue=new Set([mod]);for(const module of queue){for(const reason of module.reasons){if(!reason.module)return module;queue.add(reason.module);}}return null;}function handler(parser){function markAsAmpFirst(){const entryModule=findEntryModule(parser.state.module);if(!entryModule){return;}// @ts-ignore buildInfo exists on Module
entryModule.buildInfo.NEXT_ampFirst=true;}parser.hooks.varDeclarationConst.for(_constants.STRING_LITERAL_DROP_BUNDLE).tap(PLUGIN_NAME,markAsAmpFirst);parser.hooks.varDeclarationLet.for(_constants.STRING_LITERAL_DROP_BUNDLE).tap(PLUGIN_NAME,markAsAmpFirst);parser.hooks.varDeclaration.for(_constants.STRING_LITERAL_DROP_BUNDLE).tap(PLUGIN_NAME,markAsAmpFirst);}// Prevents outputting client pages when they are not needed
class DropClientPage{constructor(){this.ampPages=new Set();}apply(compiler){compiler.hooks.compilation.tap(PLUGIN_NAME,(compilation,{normalModuleFactory})=>{normalModuleFactory.hooks.parser.for('javascript/auto').tap(PLUGIN_NAME,handler);if(!ampFirstEntryNamesMap.has(compilation)){ampFirstEntryNamesMap.set(compilation,[]);}const ampFirstEntryNamesItem=ampFirstEntryNamesMap.get(compilation);compilation.hooks.seal.tap(PLUGIN_NAME,()=>{// Remove preparedEntrypoint that has bundle drop marker
// This will ensure webpack does not create chunks/bundles for this particular entrypoint
for(let i=compilation._preparedEntrypoints.length-1;i>=0;i--){var _entrypoint$module,_entrypoint$module$bu;const entrypoint=compilation._preparedEntrypoints[i];if(entrypoint===null||entrypoint===void 0?void 0:(_entrypoint$module=entrypoint.module)===null||_entrypoint$module===void 0?void 0:(_entrypoint$module$bu=_entrypoint$module.buildInfo)===null||_entrypoint$module$bu===void 0?void 0:_entrypoint$module$bu.NEXT_ampFirst){ampFirstEntryNamesItem.push(entrypoint.name);compilation._preparedEntrypoints.splice(i,1);}}for(let i=compilation.entries.length-1;i>=0;i--){var _entryModule$buildInf;const entryModule=compilation.entries[i];if(entryModule===null||entryModule===void 0?void 0:(_entryModule$buildInf=entryModule.buildInfo)===null||_entryModule$buildInf===void 0?void 0:_entryModule$buildInf.NEXT_ampFirst){compilation.entries.splice(i,1);}}});});}}exports.DropClientPage=DropClientPage;
//# sourceMappingURL=next-drop-client-page-plugin.js.map