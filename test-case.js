let Koa = require('koa');
let app = new Koa();
// let bodyparser = require('koa-bodyparser');
let bodyparser = require('./better-body');
let path = require('path');
app.use(bodyparser({
  uploadDir:path.join(__dirname,'koa')
}))
app.listen(3000);


app.use(async (ctx,next)=>{
  if(ctx.path === '/user'&&ctx.method==='GET'){
    ctx.body = (`
      <form method = 'post' enctype="multipart/form-data">
        <input type="text" name="username">
        <input type="text" name="password">
        <input type="file" name="avatar">
        <input type="submit">
      </form>
    `)
  }else{
    await next();
  }
});

app.use(async (ctx,next)=>{
  if(ctx.path === '/user' && ctx.method === 'POST'){
    ctx.set('Content-Type','text/html;charset=utf8');
    ctx.body = ctx.request.fields;
  }
});



/* 静态服务器 */

// let util = require('util');
// let fs = require('fs');
// let stat = util.promisify(fs.stat);
// let path = require('path');
// let Koa = require('./koa/application.js');

// let app = new Koa();

// function static(p){

//   return async(ctx,next)=>{
//     try{
//       p = path.join(p,'.'+ctx.path);
//       let statObj = await stat(p);
//       if(statObj.isDirectory()){

//       }else{
//         console.log('ok');
//         ctx.body = fs.createReadStream(p);
//       }
//     }catch(e) {
//       await next();
//     }
//   }
// }

// app.use(static(path.join(__dirname,'public')));
// app.use(async (ctx,next)=>{
//   ctx.body = 'not found';
// });
// app.listen(8000);