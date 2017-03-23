class Cat { 
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return this.name + ' Cat类';
  }
}
class Lion extends Cat {
  constructor(name,sex) {
      super(name);
      this.sex = sex;
  }
  speak() {
      return this.name + '|' + this.sex + ' Lion类' + super.speak();
  }
}

var obj1 = new Lion('zmr','女');
exports.speak = function(){
    return obj1.speak();
};
