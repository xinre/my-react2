import {createComponent,setComponentProps,setAttribute} from './render.js';

/**
 * @param {HTMLElement} dom 真实DOM
 * @param {vnode} vnode 虚拟DOM
 * @param {HTMLElement} container 容器
 * @returns {HTMLElement} 更新后的DOM
 */

 export function diff(dom,vnode,container){
     const ret = diffNode(dom,vnode);
     if(container && ret.parentNode !== container){
        container.appendChild(ret);
     }
     return ret;
 }

 export function diffNode(dom,vnode){
    let out = dom;
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';
     
    if ( typeof vnode === 'number' ) vnode = String( vnode );

    //为字符串
    if(typeof vnode == 'string'){
        if(dom && dom.nodeType === 3){
            if(dom.textContent !== vnode){
                dom.textContent = vnode;
            }
        } else {
            out = document.createTextNode(vnode);
            if( dom && dom.parentNode ){
                dom.parentNode.replaceChild(out,dom);
            }
        }
        return out;
    }
    //为字符串
    //为组件
    if(typeof vnode.tag === 'function'){
        return diffComponent(dom,vnode);
    }
    //为组件
    //为dom
    if(!dom || !isSameNodeType(dom,vnode)){
        out = document.createElement(vnode.tag);

        if(dom){
            [...dom.childNodes].map(out.appendChild);

            if(dom.parentNode){
                dom.parentNode.replaceChild( out, dom );
            }
        }
    }
    if(vnode.children && vnode.children.length > 0 || (out.childNodes && out.childNodes.length>0)){
        diffChildren( out, vnode.children );
    }
    diffAttributes( out, vnode );

    return out
    //为dom
 }

 function diffChildren( dom, vchildren ) {
     const domChildren = dom.childNodes;
     const children = [];

     const keyed = {};

     if(domChildren.length > 0){
         for(let i=0;i<domChildren.length;i++){
             const child = domChildren[i];
             const key = child.key;
             if(key){
                 keyed[key] = child;
             }else{
                 children.push(child);
             }
         }
     }

     if(vchildren && vchildren.length > 0){
         let min = 0;
         let childrenLen = children.length;

         for(let i = 0; i<vchildren.length;i++){
             const vchild = vchildren[i];
             const key = vchild.key;
             let child;

             if(key){
                 if(keyed[key]){
                     child = keyed[key];
                     keyed[key] = undefined;
                 }
             } else if(min<childrenLen){
                 for(let j = min; j<childrenLen;j++){
                     let c = children[j];
                     if(c && isSameNodeType(c,vchild)){
                         child = c;
                         children[j] = undefined;
                         if(j===childrenLen - 1) j=childrenLen;
                         if(j===min) min++;
                         break;
                     }
                 }
             }
             child = diff( child, vchild );
             const f = domChildren[i];
             if(child && child !== dom && child !== f){
                 if(!f){
                     dom.appendChild(child)
                 }else if(child === f.nextSibling){
                     removeNode(f);
                 }else{
                    dom.insertBefore( child, f );
                 }
             }
         }
     }
     
 }

 function diffAttributes(dom,vnode){
     const old = {};
     const attrs = vnode.attrs;

    for ( let i = 0 ; i < dom.attributes.length; i++ ) {
        const attr = dom.attributes[ i ];
        old[ attr.name ] = attr.value;
    }
    for ( let name in old ) { 
        if ( !( name in attrs ) ) {
            setAttribute( dom, name, undefined );
        }
    }
    for ( let name in attrs ) {
        if ( old[ name ] !== attrs[ name ] ) {
            setAttribute( dom, name, attrs[ name ] );
        }
    }
 }

 function diffComponent(dom,vnode){
     let c = dom && dom._component;
     let oldDom = dom;

     if(c && c.constructor === vnode.tag){
        setComponentProps(c,vnode.attrs);
        dom = c.base;
     } else {
        if(c){
            unmountComponent( c );
            oldDom = null;
        }
        c = createComponent(vnode.tag,vnode.attrs);

        setComponentProps(c,vnode.attrs);
        dom = c.base;

        if ( oldDom && dom !== oldDom ) {
            oldDom._component = null;
            removeNode( oldDom );
        }
     }

     return dom;
 }

 function removeNode( dom ) {
    
    if ( dom && dom.parentNode ) {
        dom.parentNode.removeChild( dom );
    }
    
}

 function unmountComponent( component ) {
    if ( component.componentWillUnmount ) component.componentWillUnmount();
    removeNode( component.base);
}

function isSameNodeType( dom, vnode ) {
    if ( typeof vnode === 'string' || typeof vnode === 'number' ) {
        return dom.nodeType === 3;
    }

    if ( typeof vnode.tag === 'string' ) {
        return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
    }

    return dom && dom._component && dom._component.constructor === vnode.tag;
}