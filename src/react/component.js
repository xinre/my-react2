import {asyncSetstate} from './asyncSetstate.js';

class Component {
    constructor(props = {}) {
        this.isReactComponent = true;

        this.state = {};
        this.props = props;
    }
    setState(stateChange) {
        asyncSetstate(stateChange,this);
    }
}

export default Component;