import parse5 from 'parse5';

import AttributesPanel from './panels/attributes';
import { createPreview } from './panels/preview';
import { createEditor } from './panels/editor';
import EventsPanel from './panels/events';
import { toHTML } from '../utils/to-html';
import '../styles/component-viewer.less';

window.toHTML = toHTML;
window.webcomponentsDocsMain = (example = '', renderCallback = () => {}) =>
  bootstrap(example.trim(), renderCallback);

function createLayout() {
  let template = toHTML(`
    <div class="component-viewer content">
      <div class="left-column">
        <div class="tab" hidden>
          <button class="tablinks light active">Light Theme</button>
          <button class="tablinks dark">Dark Theme</button>
          <button class="tablinks inherited">Inherited Theme</button>
        </div>
        <div class="preview gux-light-theme"></div>
        <div class="editor"></div>
      </div>
      <gux-disclosure-button position="right">
        <div slot="panel-content" class="controls-column">
          <details>
            <summary class="heading">Event Descriptions</summary>
            <div class="events"></div>
          </details>
          <details>
            <summary class="heading">Attributes</summary>
            <div class="attributes"></div>
          </details>
        </div>
      </gux-disclosure-button>
      <div class="notification"></div>
    </div>
  `);
  document.body.appendChild(template);

  const inheritedThemeButton = template.querySelector('.tablinks.inherited');
  const lightThemeButton = template.querySelector('.tablinks.light');
  const darkThemeButton = template.querySelector('.tablinks.dark');
  const preview = template.querySelector('.preview');
  const attribute = template.querySelector('.attributes');
  const events = template.querySelector('.events');
  const notification = template.querySelector('.notification');
  const editor = template.querySelector('.editor');

  return {
    inheritedThemeButton,
    lightThemeButton,
    darkThemeButton,
    preview,
    attribute,
    events,
    notification,
    editor
  };
}

function setNewTheme(theme, panel, button, buttons) {
  // Clear Old Theme
  panel.classList.remove(
    'gux-inherited-theme',
    'gux-light-theme',
    'gux-dark-theme'
  );
  buttons.forEach(btn => btn.classList.remove('active'));

  // Set New Theme
  panel.classList.add(theme);
  button.classList.add('active');
}

export const bootstrap = (exampleCode, callback) => {
  const {
    inheritedThemeButton,
    lightThemeButton,
    darkThemeButton,
    preview,
    attribute,
    events,
    notification,
    editor
  } = createLayout();

  //Theme Setter
  const buttons = [inheritedThemeButton, lightThemeButton, darkThemeButton];
  inheritedThemeButton.addEventListener('click', () =>
    setNewTheme('gux-inherited-theme', preview, inheritedThemeButton, buttons)
  );
  lightThemeButton.addEventListener('click', () =>
    setNewTheme('gux-light-theme', preview, lightThemeButton, buttons)
  );
  darkThemeButton.addEventListener('click', () =>
    setNewTheme('gux-dark-theme', preview, darkThemeButton, buttons)
  );

  // Code Setter
  const attributesPanel = new AttributesPanel(attribute);
  const eventsPanel = new EventsPanel(events, preview, notification);
  const updatePreview = createPreview(preview);

  const updateCode = createEditor(editor, newCode => {
    let ast = parse5.parseFragment(newCode);
    let html = parse5.serialize(ast);

    updatePreview(html);
    attributesPanel.updateFromTree(ast);
    eventsPanel.updateFromTree(ast);

    try {
      callback();
    } catch (e) {
      console.error('error in render callback: ', e);
    }
  });

  attributesPanel.onChange(ast => {
    updateCode(parse5.serialize(ast));
  });

  updateCode(exampleCode);
};
