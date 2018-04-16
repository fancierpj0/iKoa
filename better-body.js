let path = require('path');
let fs = require('fs');

Buffer.prototype.split = function(sep){
  let pos = 0;
  let len = Buffer.from(sep).length;
  let index = -1;
  let arr = [];
  while(-1!=(index = this.indexOf(sep,pos))){ //indexOf应该只支持英系字符 一个字符只占一个字节的 找不到sep了就会返回-1 找了就返回匹配上的第一个字符的索引
    arr.push(this.slice(pos,index));
    pos = index+len;
  }
  arr.push(this.slice(pos)); //最后一项
  return arr;
};

function bodyParser(options={}){
  let {uploadDir} = options;
  return async (ctx,next)=>{
    await new Promise((resolve,reject)=>{
      let buffers = [];
      ctx.req.on('data',function(data){
        buffers.push(data);
      });
      ctx.req.on('end',function(){
        let type = ctx.get('content-type');
        // console.log(type);//multipart/form-data; boundary=----WebKitFormBoundary8xKcmy8E9DWgqZT3
        let buff = Buffer.concat(buffers);
        let fields = {};

        if(type.includes('multipart/form-data')){
          // 多form-data格式
          let sep = '--'+type.split('=')[1];
          let lines = buff.split(sep).slice(1,-1);
          lines.forEach(line=>{
            // head是content-disposition，content是表单值
            let [head,content] = line.split('\r\n\r\n');
            head = head.slice(2).toString(); //\r\n是两个字符不是4个 //这里不分mac/linux win
            content = content.slice(0,-2); //slice去掉\r\n
            let [,name] = head.match(/name="(.*)"/);
            if(head.includes('filename')){
              // 处理文件
              // 文件的话，文件内容中也可能存在\r\n，so应该取head以外的部分而不再是content
              let [,filename] = head.match(/filename="(.*)"/);
              let c= line.slice(head.length+6);
              let p = path.join(uploadDir,new Date().getTime()+'_'+filename);
              // fs.writeFileSync(p,c);
              fs.writeFile(p,c,{mode:0o777,encoding:'utf8',flag:'w'},function(){
                //TODO
              });
              fields[name] = [{path:p}];
            }else{
              // {username:xxx,password:yyy}
              fields[name] = content.toString();
            }
          });
        }else if(type === 'application/x-www-form-urlencoded'){
          // a=b&&c=d
          fields = require('querystring').parse(buff.toString());
        }else if(type === 'application/json'){
          fields = JSON.parse(buff.toString());
        }else{
          // 是个文本
          fields = buff.toString();
        }
        ctx.request.fields = fields;
        resolve();
      });
    });
    await next();
  };
}

module.exports = bodyParser;