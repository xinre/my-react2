import Component from '../react/component';

export function setAttribute(dom, name, value) {
    if (name === 'className') name = 'class';

    if (/on\w+/.test(name)) {
        name = name.toLowerCase();
        dom[name] = value || '';
    } else if (name === 'style') {
        if (!value || typeof value === 'string') {
            node.style.cssText = value || '';
        } else if (value && typeof value === 'object') {
            for (let name in value) {
                dom.style[name] = typeof value[name] === 'number' ? value[name] + 'px' : value[name];
            }
        }
    } else {
        if (name in dom) {
            dom[name] = value || '';
        }
        if (value) {
            dom.setAttribute(name, value);
        } else {
            dom.removeAttribute(name, value);
        }
    }
}

function createComponent(component, props) {
    let init;
    if (component.protype && component.protype.render) {
        init = new component(props);
    } else {
        init = new Component(props);
        init.constructor = component;
        init.render = function () {
            return this.constructor(props);
        }
    }
}

function _render(vnode) {
    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') vnode = '';
    if (typeof vnode === 'number') vnode = String(vnode);
    if (typeof vnode === 'string') {
        let textNode = document.createTextNode(vnode);
        return textNode;
    }
    if (typeof vnode.tag === 'function') {
        const component = createComponent(vnode.tag, vnode.attrs);
        setComponentProps(component, vnode.attrs);
        return component.base;
    }
    const dom = document.createElement(vnode.tag);
    if (vnode.attrs) {
        Object.keys(vnode.attrs).forEach(key => {
            const value = vnode.attrs[key];
            setAttribute(dom, key, value);
        });
    }
    if (vnode.children) {
        vnode.children.forEach(child => render(child, dom));
    }
    return dom;
}

export function render(vnode, container) {
    return container.appendChild(_render(vnode));
}