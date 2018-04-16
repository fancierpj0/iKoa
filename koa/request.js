let url = require('url');
// request.req = req;
let request = {
  get query(){
    return url.parse(this.req.url,true).query;
  }
  ,get method(){
    return this.req.method;
  }
};

// let request = {
//   get query(){
//     return this.a;
//   }
//   ,set query(val){
//     this.a = val;
//   }
// };
// console.log(request.query); //undefined
// request.query = 100; //100
// console.log(request.query);
module.exports = request;