import { EComponentKind, T4DComponentConfig } from '@ws-ui/webform-editor';
import { Settings } from '@ws-ui/webform-editor';
import { MdOutlineTextSnippet } from 'react-icons/md';

import CustomizedEditorSettings, { BasicSettings } from './CustomizedEditor.settings';

export default {
  craft: {
    displayName: 'CustomizedEditor',
    kind: EComponentKind.BASIC,
    props: {
      name: '',
      classNames: [],
      events: [],
    },
    related: {
      settings: Settings(CustomizedEditorSettings, BasicSettings),
    },
  },
  info: {
    settings: CustomizedEditorSettings,
    displayName: 'CustomizedEditor',
    exposed: true,
    icon: MdOutlineTextSnippet,
    events: [
      {
        label: 'On Click',
        value: 'onclick',
      },
      {
        label: 'On Blur',
        value: 'onblur',
      },
      {
        label: 'On Focus',
        value: 'onfocus',
      },
      {
        label: 'On MouseEnter',
        value: 'onmouseenter',
      },
      {
        label: 'On MouseLeave',
        value: 'onmouseleave',
      },
      {
        label: 'On KeyDown',
        value: 'onkeydown',
      },
      {
        label: 'On KeyUp',
        value: 'onkeyup',
      },
    ],
    datasources: {
      accept: ['entity'],
    },
  },
  defaultProps: {
  },
} as T4DComponentConfig<ICustomizedEditorProps>;

export interface ICustomizedEditorProps extends webforms.ComponentProps {
  template?: string;
}
