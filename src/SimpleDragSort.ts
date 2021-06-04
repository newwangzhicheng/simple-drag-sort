import throttle from 'lodash/throttle';

interface Position {
  x: number,
  y: number,
};

interface AnimationOption {
  animation?: number,
  delay?: number,
  easing?: string,
};

interface SortOption extends AnimationOption {
  sortItem?: string,
  handle?: string,
};

interface ConfirmedSortOption {
  animation: number;
  delay: number,
  easing: string,
  sortItem: string,
  handle?: string,
};

export default class SimpleDragSort {
  protected draggingEl!: HTMLElement;
  protected targetEl!: HTMLElement;
  protected el!: HTMLElement;
  protected sortOption: ConfirmedSortOption = {
    sortItem: '.sort-item',
    animation: 150,
    delay: 0,
    easing: 'ease-out',
  };
  protected draggingElOrder!: number;
  protected targetElOrder!: number;
  protected enteredEl!: HTMLElement;
  constructor(el: HTMLElement, sortOption: SortOption) {
    this.el = el;
    Object.assign(this.sortOption, sortOption);

    this.el.addEventListener('mousedown', (e) => {
      const target = e.target as HTMLElement;
      if (target === this.getHandle(target)) {
        this.addDraggableAttribute(this.getSortItem(target) as HTMLElement);
      }
    });

    // add dragstart delegation to detect dragging element
    this.el.addEventListener('dragstart', (e: DragEvent) => {
      this.draggingEl = this.getSortItem(e.target as HTMLElement) as HTMLElement;
    });

    // add dragenter delegation to detect entered element
    this.el.addEventListener('dragenter', throttle(this.dragenterHandler.bind(this), 50, { trailing: false }));
  }

  protected dragenterHandler(e: DragEvent) {
    const target = e.target as HTMLElement;
    this.targetEl = this.getSortItem(target) as HTMLElement;
    if ((this.enteredEl as HTMLElement) === this.targetEl) {
      return;
    }
    if (this.targetEl && this.targetEl !== this.draggingEl) {
      this.draggingElOrder = SimpleDragSort.getIndexOf(this.draggingEl);
      this.targetElOrder = SimpleDragSort.getIndexOf(this.targetEl);
      // animate for every element between 
      const positionMap = this.getPositionMap();
      // change positions of draggingEl and targetEl
      this.changePosition();

      const animationList: Array<Promise<unknown>> = [];
      positionMap.forEach((position, child) => {
        animationList.push(SimpleDragSort.animate(child, position, this.sortOption));
      });
      Promise.all(animationList).then(() => {
        this.removeDraggableAttribute(this.draggingEl);
      })
    }
    this.enteredEl = this.targetEl;
  }

  /**
   * change positions of draggingEl and targetEl
   */
  protected changePosition(): void {
    if (this.draggingElOrder < this.targetElOrder) {
      // index of dragging element is smaller than entered element
      // dragging element insert after entered element
      this.targetEl.insertAdjacentElement('afterend', this.draggingEl);
    } else if (this.draggingElOrder > this.targetElOrder) {
      // index of dragging element is bigger than entered element
      // dragging element insert before entered element
      this.targetEl.insertAdjacentElement('beforebegin', this.draggingEl);
    }
  }

  /**
   * add draggable attribute for  element
   */
  protected addDraggableAttribute(el: HTMLElement): void {
    el.setAttribute('draggable', 'true');
  }

  /**
   * remove draggable attribute for  element
   */
  protected removeDraggableAttribute(el: HTMLElement): void {
    el.setAttribute('draggable', 'false');
  }

  /**
   * get the index of child
   * @param child child element
   */
  static getIndexOf(child: HTMLElement): number {
    return Array.from((child.parentElement as HTMLElement).children).indexOf(child)
  }

  /**
   * animate
   * @param el animate element
   * @param lastPosition last position of this element
   * @param initPosition animation parameters
   */
  static async animate(el: HTMLElement, lastPosition: Position, animationOption: AnimationOption): Promise<unknown> {
    return new Promise((resolve: (value?: unknown) => void) => {
      const currentPosition = el.getBoundingClientRect();
      el.style.transform = `translate(${lastPosition.x - currentPosition.x}px, ${lastPosition.y - currentPosition.y}px)`;
      requestAnimationFrame(() => {
        el.style.transition = `transform ${animationOption.animation}ms ${animationOption.easing} ${animationOption.delay}ms`;
        el.style.transform = `translate(0)`;
        el.addEventListener('transitionend', function transitionendHandler(this: HTMLElement): void {
          this.style.transform = '';
          this.style.transition = '';
          resolve(true);
          this.removeEventListener('transitionend', transitionendHandler);
        })
      });
    })
  }

  /**
   * get the last position of animating elements
   */
  protected getPositionMap(): Map<HTMLElement, Position> {
    const positionMap: Map<HTMLElement, Position> = new Map();
    const children: HTMLCollection = this.el.children;
    const start = Math.min(this.draggingElOrder, this.targetElOrder);
    const end = Math.max(this.draggingElOrder, this.targetElOrder);
    if (children.length > 0) {
      for (let i = start; i <= end; i++) {
        const child: HTMLElement = children[i] as HTMLElement;
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
  getHandle(el: HTMLElement) {
    if (this.sortOption.handle) {
      return el.closest(this.sortOption.sortItem)?.querySelector(this.sortOption.handle);
    } else {
      return el.closest(this.sortOption.sortItem);
    }
  }
  
  /**
   * get sort item
   */
  getSortItem(el: HTMLElement) {
    return el.closest(this.sortOption.sortItem);
  }

  /**
   * judge if it is sort item
   */
  isSortItem(el: HTMLElement) {
    return this.el.contains(el) && el.classList.contains(this.sortOption.sortItem);
  }
}
