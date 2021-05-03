"use strict";exports.__esModule=true;exports.trace=exports.Span=exports.SpanStatus=void 0;var _crypto=require("crypto");var _report=require("./report");const NUM_OF_MICROSEC_IN_SEC=BigInt('1000');const getId=()=>(0,_crypto.randomBytes)(8).toString('hex');// eslint typescript has a bug with TS enums
/* eslint-disable no-shadow */let SpanStatus;exports.SpanStatus=SpanStatus;(function(SpanStatus){SpanStatus[SpanStatus["Started"]=0]="Started";SpanStatus[SpanStatus["Stopped"]=1]="Stopped";})(SpanStatus||(exports.SpanStatus=SpanStatus={}));class Span{constructor(name,parentId,attrs){this.name=void 0;this.id=void 0;this.parentId=void 0;this.duration=void 0;this.attrs=void 0;this.status=void 0;this._start=void 0;this.name=name;this.parentId=parentId;this.duration=null;this.attrs=attrs?{...attrs}:{};this.status=SpanStatus.Started;this.id=getId();this._start=process.hrtime.bigint();}// Durations are reported as microseconds. This gives 1000x the precision
// of something like Date.now(), which reports in milliseconds.
// Additionally, ~285 years can be safely represented as microseconds as
// a float64 in both JSON and JavaScript.
stop(){const end=process.hrtime.bigint();const duration=(end-this._start)/NUM_OF_MICROSEC_IN_SEC;this.status=SpanStatus.Stopped;if(duration>Number.MAX_SAFE_INTEGER){throw new Error(`Duration is too long to express as float64: ${duration}`);}const timestamp=this._start/NUM_OF_MICROSEC_IN_SEC;(0,_report.report)(this.name,Number(duration),Number(timestamp),this.id,this.parentId,this.attrs);}traceChild(name,attrs){return new Span(name,this.id,attrs);}setAttribute(key,value){this.attrs[key]=value;}traceFn(fn){try{return fn();}finally{this.stop();}}async traceAsyncFn(fn){try{return await fn();}finally{this.stop();}}}exports.Span=Span;const trace=(name,parentId,attrs)=>{return new Span(name,parentId,attrs);};exports.trace=trace;
//# sourceMappingURL=trace.js.map