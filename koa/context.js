// context 代理request和response属性
// ctx.query -> ctx.request.query
// 设置getter和setter
let proto = {

};

function delateGetter(property,name){
  // 访问proto的$name 其实是 访问的 this[property][name]
  proto.__defineGetter__(name,function(){
    return this[property][name];
  });
}
// proto.query === request.query
// ctx.query === ctx.request.query
// delegate
// 让proto 代理 request上的query属性
delateGetter('request','query');
delateGetter('request','method');
delateGetter('response','body');

function delateSetter(property,name){
  proto.__defineSetter__(name,function(val){
    this[property][name] = val;
  });
}
delateSetter('response','body');
module.exports = proto;