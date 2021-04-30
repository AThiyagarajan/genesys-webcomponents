import {
  Component,
  Element,
  forceUpdate,
  h,
  Host,
  Listen,
  JSX,
  Prop,
  State,
  Watch
} from '@stencil/core';
import { ClickOutside } from 'stencil-click-outside';
import { createPopper, Instance } from '@popperjs/core';

import { buildI18nForComponent, GetI18nValue } from '../../../i18n';
import { onMutation } from '../../../utils/dom/on-mutation';
import { whenEventIsFrom } from '../../../utils/dom/when-event-is-from';
import simulateNativeEvent from '../../../utils/dom/simulate-native-event';
import { trackComponent } from '../../../usage-tracking';

import translationResources from './i18n/en.json';

/**
 * @slot - for gux-listbox component
 */
@Component({
  styleUrl: 'gux-dropdown-v3.less',
  tag: 'gux-dropdown-v3-beta',
  shadow: true
})
export class GuxDropdownV3Beta {
  private popperInstance: Instance;
  private i18n: GetI18nValue;
  private fieldButtonElement: HTMLElement;
  private listboxContainerElement: HTMLElement;
  private listboxElement: HTMLGuxListboxElement;
  private mutationObserver: MutationObserver;

  @Element()
  private root: HTMLElement;

  @Prop()
  value: string;

  @Prop()
  disabled: boolean = false;

  @Prop()
  placeholder: string;

  // filterable prop removed (for now)
  // @Prop()
  // filterable: boolean = false;

  // mode prop removed
  // @Prop()
  // mode: 'default' | 'page' | 'palette' = 'default';

  // setLabeledBy method removed
  // @Method()
  // async setLabeledBy(labeledBy: string): Promise<void> {}

  // setSelected method removed
  // @Method()
  // async setSelected(): Promise<void> {}

  @State()
  private listboxExpanded: boolean = false;

  @Watch('value')
  watchValue(newValue: string) {
    this.listboxElement.value = newValue;
  }

  @Watch('listboxExpanded')
  watchListboxExpanded(listboxExpanded: boolean) {
    if (listboxExpanded && this.listboxElement) {
      setTimeout(() => {
        this.listboxElement.focus();
      }, 25);
    }
  }

  @Listen('keydown')
  onKeydown(event: KeyboardEvent): void {
    event.stopPropagation();

    if (this.listboxExpanded) {
      switch (event.key) {
        case 'Escape':
          this.shrinkListbox(true);
          return;
      }
    }

    switch (event.key) {
      case 'Tab':
        this.shrinkListbox(false);
        return;
    }
  }

  @Listen('input')
  onInput(event: InputEvent): void {
    whenEventIsFrom('gux-listbox', event, () => {
      event.stopPropagation();

      const newValue = (event.target as HTMLGuxListElement).value;
      this.updateValue(newValue);
    });
  }

  @Listen('change')
  onChange(event: InputEvent): void {
    whenEventIsFrom('gux-listbox', event, () => {
      event.stopPropagation();
    });
  }

  @ClickOutside({ triggerEvents: 'mousedown' })
  checkForClickOutside() {
    if (this.listboxExpanded) {
      this.shrinkListbox(false);
    }
  }

  async componentWillLoad(): Promise<void> {
    trackComponent(this.root);
    this.i18n = await buildI18nForComponent(this.root, translationResources);

    this.listboxElement = this.root.querySelector('gux-listbox');
    this.listboxElement.value = this.value;
  }

  componentDidLoad(): void {
    this.runPopper();

    this.mutationObserver = onMutation(this.listboxElement, mutationRecords => {
      mutationRecords.some(mutationRecord => {
        if (
          Array.from(mutationRecord.addedNodes)
            .concat(Array.from(mutationRecord.removedNodes))
            .some(node => node.nodeName.toLowerCase() === 'gux-option-v3')
        ) {
          forceUpdate(this.root);
          return true;
        }

        return false;
      });
    });
  }

  disconnectedCallback(): void {
    this.mutationObserver.disconnect();
    this.destroyPopper();
  }

  private runPopper(): void {
    this.popperInstance = createPopper(
      this.fieldButtonElement,
      this.listboxContainerElement,
      {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 1]
            }
          },
          {
            name: 'sameWidth',
            enabled: true,
            phase: 'beforeWrite',
            requires: ['computeStyles'],
            fn({ state }) {
              state.styles.popper.width = `${state.rects.reference.width}px`;
            },
            effect({ state }) {
              state.elements.popper.style.width = `${
                state.elements.reference.getBoundingClientRect().width
              }px`;
            }
          }
        ],
        placement: 'bottom-start'
      }
    );
  }

  private destroyPopper(): void {
    if (this.popperInstance) {
      this.popperInstance.destroy();
      this.popperInstance = null;
    }
  }

  private slotChanged(): void {
    forceUpdate(this.root);
  }

  private getFieldButton(): JSX.Element {
    return (
      <button
        type="button"
        class="gux-field-button"
        disabled={this.disabled}
        onClick={this.fieldButtonClick.bind(this)}
        ref={el => (this.fieldButtonElement = el)}
        aria-haspopup="listbox"
        aria-expanded={this.listboxExpanded}
      >
        <div class="gux-selected-option">
          {this.getFieldButtonDisplayText()}
        </div>
        <gux-icon
          class="gux-expand-icon"
          decorative
          iconName="chevron-small-down"
        ></gux-icon>
      </button>
    );
  }

  private getFieldButtonDisplayText(): JSX.Element {
    const selectedListboxOptionElement = this.root.querySelector(
      `gux-option-v3[value="${this.value}"]`
    );

    if (selectedListboxOptionElement) {
      return (
        <div class="gux-selected-option">
          {selectedListboxOptionElement.textContent}
        </div>
      );
    } else if (this.value) {
      return (
        <div class="gux-unknown-option">
          {this.i18n('unknownSelection')} ({this.value})
        </div>
      );
    }

    return (
      <div class="gux-placeholder">
        {this.placeholder || this.i18n('noSelection')}
      </div>
    );
  }

  private getListboxContainer(): JSX.Element {
    return (
      <div
        class="gux-listbox-container"
        ref={el => (this.listboxContainerElement = el)}
      >
        <slot onSlotchange={() => this.slotChanged()} />
      </div>
    );
  }

  private fieldButtonClick(): void {
    this.listboxExpanded = !this.listboxExpanded;
  }

  private shrinkListbox(focusOnFieldButton: boolean): void {
    this.listboxExpanded = false;

    if (focusOnFieldButton) {
      this.fieldButtonElement.focus();
    }
  }

  private updateValue(newValue: string): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.shrinkListbox(true);
      simulateNativeEvent(this.root, 'input');
      simulateNativeEvent(this.root, 'change');
    }
  }

  render(): JSX.Element {
    return (
      <Host aria-disabled={this.disabled}>
        <div
          class={{
            'gux-dropdown-v3-container': true,
            'gux-disabled': this.disabled,
            'gux-listbox-expanded': this.listboxExpanded
          }}
        >
          {this.getFieldButton()}
          {this.getListboxContainer()}
        </div>
      </Host>
    );
  }
}
