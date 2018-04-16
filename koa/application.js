// 监听端口时候就会创建服务

let http = require('http');
let context = require('./context');
let request = require('./request');
let response = require('./response');
let Stream = require('stream');
let EventEmitter = require('events');

class Koa extends EventEmitter{
  constructor(){
    super();
    this.middlewares = [];
    this.callbackFn;
    this.context = context;
    this.request = request;
    this.response = response;
  }
  createContext(req,res){
    // let ctx = this.context;
    // ctx.a = 1; //这样的会就直接往context添加了一个a属性，这样每次请求都会有a这个属性 这样就污染了全局，不大好

    // ctx.__proto__ = this.context
    // ctx.a = 1 此时只会加在私有属性上
    let ctx = Object.create(this.context); //**
    ctx.request = Object.create(this.request);
    ctx.response = Object.create(this.response);
    // ctx.req = req;
    // console.log(ctx.request.query);
    ctx.req = ctx.request.req = req;
    ctx.res = ctx.response.res = res;
    return ctx;
  }
  compose(ctx,middlewares){
    function dispatch(index){
      let middleware = middlewares[index];
      if(middlewares.length === index)return Promise.resolve();
      return Promise.resolve(middleware(ctx,()=>dispatch(index+1)));
    }
    return dispatch(0);
  }
  handleRequest(){
    //console.log(this); //回调函数里的请求 http.createServer(function(){}) //这样的fn的this指向肯定不是实例
    return (req,res)=>{
      res.statusCode = 404;
      // 创建上下文对象
      let ctx = this.createContext(req,res); //之所以没有将context直接传给回调，而是要重新创建个...
      // 组合后的中间件 而且是一个promise
      let composeMiddleWare = this.compose(ctx,this.middlewares);
      // Promise.resolve(this.callbackFn(ctx)).then(function(){
      //   res.end(ctx.body);
      // });
      // composeMiddleWare.then()
      Promise.resolve(composeMiddleWare).then(function(){
        let body = ctx.body;
        if(body == undefined){
          return res.end('Not Found');
        }
        if(body instanceof Stream){
          return body.pipe(res);
        }
        if(typeof body === 'object'){
          return res.end(JSON.stringify(body));
        }
        res.end(ctx.body);
      }).catch(e=>{
        this.emit('error',e);
        res.end('Internal Server Error');
      });
      // 当函数执行完后将ctx.body的值进行返回
    }
  }
  listen(){
    const server = http.createServer(this.handleRequest());
    return server.listen(...arguments);
  }
  use(fn){ //调use先把函数存起来
    // this.callbackFn = fn;
    this.middlewares.push(fn);
  }
}

module.exports = Koa;