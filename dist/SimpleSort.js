var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
;
;
;
export default class SimpleSort {
    constructor(el, sortOption) {
        this.sortOption = {
            sortItemClass: 'sort-item',
            animation: 150,
            delay: 0,
            easing: 'ease-out',
        };
        this.el = el;
        if (sortOption) {
            this.sortOption.sortItemClass = (typeof sortOption.sortItemClass === 'string') ? sortOption.sortItemClass : this.sortOption.sortItemClass;
            this.sortOption.animation = (typeof sortOption.animation === 'number') ? sortOption.animation : this.sortOption.animation;
            this.sortOption.delay = (typeof sortOption.delay === 'number') ? sortOption.delay : this.sortOption.delay;
            this.sortOption.easing = (typeof sortOption.easing === 'string') ? sortOption.easing : this.sortOption.easing;
            this.sortOption.handleClass = (typeof sortOption.handleClass === 'string') ? sortOption.handleClass : this.sortOption.handleClass;
        }
        this.addDraggableAttribute();
        // add dragstart delegation to detect dragging element
        el.addEventListener('dragstart', (e) => {
            const target = e.target;
            if (target.classList.contains(this.sortOption.sortItemClass)) {
                this.draggingEl = target;
            }
        });
        // add dragenter delegation to detect entered element
        el.addEventListener('dragenter', this.dragenterHandler.bind(this));
    }
    dragenterHandler(e) {
        const target = e.target;
        if (target.classList.contains(this.sortOption.sortItemClass) && target !== this.draggingEl) {
            this.removeDraggableAttribute();
            this.targetEl = target;
            this.draggingElOrder = SimpleSort.getIndexOf(this.draggingEl);
            this.targetElOrder = SimpleSort.getIndexOf(this.targetEl);
            // animate for every element between 
            const positionMap = this.getPositionMap();
            // change positions of draggingEl and targetEl
            this.changePosition();
            const animationList = [];
            positionMap.forEach((position, child) => {
                animationList.push(SimpleSort.animate(child, position, this.sortOption));
            });
            Promise.all(animationList).then(() => {
                this.addDraggableAttribute();
            });
        }
    }
    /**
     * change positions of draggingEl and targetEl
     */
    changePosition() {
        // this.draggingElOrder = SimpleSort.getIndexOf(this.draggingEl);
        // this.targetElOrder = SimpleSort.getIndexOf(this.targetEl);
        if (this.draggingElOrder < this.targetElOrder) {
            // index of dragging element is smaller than entered element
            // dragging element insert after entered element
            this.targetEl.insertAdjacentElement('afterend', this.draggingEl);
        }
        else if (this.draggingElOrder > this.targetElOrder) {
            // index of dragging element is bigger than entered element
            // dragging element insert before entered element
            this.targetEl.insertAdjacentElement('beforebegin', this.draggingEl);
        }
    }
    /**
     * add draggable attribute for  element
     */
    addDraggableAttribute() {
        const children = this.el.querySelectorAll('.' + this.sortOption.sortItemClass);
        children.forEach((child) => {
            child.setAttribute('draggable', 'true');
        });
    }
    /**
     * remove draggable attribute for  element
     */
    removeDraggableAttribute() {
        const children = this.el.querySelectorAll('.' + this.sortOption.sortItemClass);
        children.forEach((child) => {
            child.setAttribute('draggable', 'false');
        });
    }
    /**
     * get the index of child
     * @param child child element
     */
    static getIndexOf(child) {
        return Array.from(child.parentElement.children).indexOf(child);
    }
    /**
     * animate
     * @param el animate element
     * @param lastPosition last position of this element
     * @param initPosition animation parameters
     */
    static animate(el, lastPosition, animationOption) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const currentPosition = el.getBoundingClientRect();
                el.style.transform = `translate(${lastPosition.x - currentPosition.x}px, ${lastPosition.y - currentPosition.y}px)`;
                requestAnimationFrame(() => {
                    el.style.transition = `transform ${animationOption.animation}ms ${animationOption.easing} ${animationOption.delay}ms`;
                    el.style.transform = `translate(0)`;
                    el.addEventListener('transitionend', function transitionendHandler() {
                        this.style.transform = '';
                        this.style.transition = '';
                        resolve(true);
                        this.removeEventListener('transitionend', transitionendHandler);
                    });
                });
            });
        });
    }
    /**
     * get the last position of animating elements
     */
    getPositionMap() {
        const positionMap = new Map();
        const children = this.el.children;
        const start = Math.min(this.draggingElOrder, this.targetElOrder);
        const end = Math.max(this.draggingElOrder, this.targetElOrder);
        if (children.length > 0) {
            for (let i = start; i <= end; i++) {
                const child = children[i];
                if (child !== this.draggingEl) {
                    const currentPosition = child.getBoundingClientRect();
                    positionMap.set(child, currentPosition);
                }
            }
        }
        return positionMap;
    }
}
