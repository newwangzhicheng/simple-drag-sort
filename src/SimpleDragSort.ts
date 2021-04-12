interface Position {
  x: number,
  y: number,
};

interface AnimationOption {
  animation?: number,
  delay?: number,
  easing?: string,
  handleClass?: string,
};

interface SortOption extends AnimationOption {
  sortItemClass: string,
};

export default class SimpleDragSort {
  protected draggingEl!: HTMLElement;
  protected targetEl!: HTMLElement;
  protected el!: HTMLElement;
  protected sortOption: SortOption = {
    sortItemClass: 'sort-item',
    animation: 150,
    delay: 0,
    easing: 'ease-out',
  };
  protected draggingElOrder!: number;
  protected targetElOrder!: number;
  protected enteredEl!: HTMLElement;
  constructor(el: HTMLElement, sortOption: SortOption | undefined) {
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
    el.addEventListener('dragstart', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains(this.sortOption.sortItemClass)) {
        this.draggingEl = target;
      }
    });

    // add dragenter delegation to detect entered element
    el.addEventListener('dragenter', this.dragenterHandler.bind(this));
  }

  protected dragenterHandler(e: DragEvent) {
    const target = e.target as HTMLElement;
    if (target.classList.contains(this.sortOption.sortItemClass) && target !== this.draggingEl) {
      this.removeDraggableAttribute();

      this.targetEl = target;
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
        this.addDraggableAttribute();
      })
    }
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
  protected addDraggableAttribute(): void {
    const children = this.el.querySelectorAll('.' + this.sortOption.sortItemClass);
    children.forEach((child: Element) => {
      child.setAttribute('draggable', 'true');
    });
  }

  /**
   * remove draggable attribute for  element
   */
  protected removeDraggableAttribute(): void {
    const children = this.el.querySelectorAll('.' + this.sortOption.sortItemClass);
    children.forEach((child: Element) => {
      child.setAttribute('draggable', 'false');
    });
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
}
