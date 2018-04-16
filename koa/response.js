let response = {
  get body(){
    return this._body;
  }
  ,set body(value){
    //ctx.body = 'hello'
    // this.res.statusCode = 200;
    this._body = value;
  }
};

module.exports = response;