import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { ICustomizedEditorProps } from './CustomizedEditor.config';

const CustomizedEditor: FC<ICustomizedEditorProps> = ({ name, style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  return (
    <span ref={connect} style={style} className={cn(className, classNames)}>
      Hello {name}!
    </span>
  );
};

export default CustomizedEditor;