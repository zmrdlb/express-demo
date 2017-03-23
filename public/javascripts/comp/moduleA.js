var name = 'moduleA';

export default function(){
    var fun = (a) => a + name;
    var bindfun = function(){
        return this.name;
    };
    return bindfun.bind({name: 'newname-'})() + fun('fun-');
}
