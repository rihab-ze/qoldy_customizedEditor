import { useEnhancedNode } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC } from 'react';

import { ICustomizedEditorProps } from './CustomizedEditor.config';

const CustomizedEditor: FC<ICustomizedEditorProps> = ({ style, className, classNames = [] }) => {
  const {
    connectors: { connect },
  } = useEnhancedNode();

  return (
    <div
      ref={connect}
      style={style}
      className={cn(
        'font-sans',
        className,
        classNames
      )}
    >
      <div className="bg-white border border-[rgba(16,24,40,0.06)] rounded-[10px] p-3 shadow-[0_8px_28px_rgba(16,24,40,0.04)]">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #c7d2fe',
                  background: '#4b68ff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Attributes
              </button>
            </div>
          </div>
        </div>
        {/* Editor area */}
        <div
          className="mt-3 border border-[rgba(2,6,23,0.06)] rounded-lg min-h-[180px] p-3 bg-white text-gray-400 text-sm leading-relaxed flex items-center"
        >
          <span className="text-gray-300">Type here...</span>
        </div>
      </div>
    </div>
  );
};

export default CustomizedEditor;