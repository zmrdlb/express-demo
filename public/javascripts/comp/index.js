import moduleA from './moduleA.js';
import moduleB from './moduleB.js';

export default function(){
    return moduleA() + '&' + moduleB();
}
