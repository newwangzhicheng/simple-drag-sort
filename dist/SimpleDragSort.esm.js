import throttle from 'lodash/throttle';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class SimpleDragSort {
    constructor(el, sortOption) {
        this.sortOption = {
            sortItem: '.sort-item',
            animation: 150,
            delay: 0,
            easing: 'ease-out',
        };
        this.el = el;
        Object.assign(this.sortOption, sortOption);
        this.el.addEventListener('mousedown', (e) => {
            const target = e.target;
            if (target === this.getHandle(target)) {
                this.addDraggableAttribute(this.getSortItem(target));
            }
        });
        // add dragstart delegation to detect dragging element
        this.el.addEventListener('dragstart', (e) => {
            this.draggingEl = this.getSortItem(e.target);
        });
        // add dragenter delegation to detect entered element
        this.el.addEventListener('dragenter', throttle(this.dragenterHandler.bind(this), 50, { trailing: false }));
    }
    dragenterHandler(e) {
        const target = e.target;
        this.targetEl = this.getSortItem(target);
        if (this.enteredEl === this.targetEl) {
            return;
        }
        if (this.targetEl && this.targetEl !== this.draggingEl) {
            this.draggingElOrder = SimpleDragSort.getIndexOf(this.draggingEl);
            this.targetElOrder = SimpleDragSort.getIndexOf(this.targetEl);
            // animate for every element between 
            const positionMap = this.getPositionMap();
            // change positions of draggingEl and targetEl
            this.changePosition();
            const animationList = [];
            positionMap.forEach((position, child) => {
                animationList.push(SimpleDragSort.animate(child, position, this.sortOption));
            });
            Promise.all(animationList).then(() => {
                this.removeDraggableAttribute(this.draggingEl);
            });
        }
        this.enteredEl = this.targetEl;
    }
    /**
     * change positions of draggingEl and targetEl
     */
    changePosition() {
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
    addDraggableAttribute(el) {
        el.setAttribute('draggable', 'true');
    }
    /**
     * remove draggable attribute for  element
     */
    removeDraggableAttribute(el) {
        el.setAttribute('draggable', 'false');
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
    /**
     * get handle
     */
    getHandle(el) {
        var _a;
        if (this.sortOption.handle) {
            return (_a = el.closest(this.sortOption.sortItem)) === null || _a === void 0 ? void 0 : _a.querySelector(this.sortOption.handle);
        }
        else {
            return el.closest(this.sortOption.sortItem);
        }
    }
    /**
     * get sort item
     */
    getSortItem(el) {
        return el.closest(this.sortOption.sortItem);
    }
    /**
     * judge if it is sort item
     */
    isSortItem(el) {
        return this.el.contains(el) && el.classList.contains(this.sortOption.sortItem);
    }
}

export default SimpleDragSort;
