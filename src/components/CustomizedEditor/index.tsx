import config, { ICustomizedEditorProps } from './CustomizedEditor.config';
import { T4DComponent, useEnhancedEditor } from '@ws-ui/webform-editor';
import Build from './CustomizedEditor.build';
import Render from './CustomizedEditor.render';

const CustomizedEditor: T4DComponent<ICustomizedEditorProps> = (props) => {
  const { enabled } = useEnhancedEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return enabled ? <Build {...props} /> : <Render {...props} />;
};

CustomizedEditor.craft = config.craft;
CustomizedEditor.info = config.info;
CustomizedEditor.defaultProps = config.defaultProps;

export default CustomizedEditor;
