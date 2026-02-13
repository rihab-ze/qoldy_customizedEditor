import { useRenderer, useSources } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useMemo, useState } from 'react';

import { ICustomizedEditorProps } from './CustomizedEditor.config';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { createEditor, Descendant, Transforms, Editor } from 'slate';

type Attribute = {
  key: string;
  label: string;
};

const CustomizedEditor: FC<ICustomizedEditorProps> = ({ style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const {
    sources: { datasource },
  } = useSources();

  const [record, setRecord] = useState<datasources.IEntity>();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [showAttributes, setShowAttributes] = useState(false);
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])


  useEffect(() => {
    if (!datasource) return;

    const listener = async (/* event */) => {
      const v = await datasource.getValue();
      setRecord(v);
      setAttributes(
        Object.values(datasource.dataclass.getAllAttributes())
          .map(attr => ({
            key: attr.name,
            label: attr.name
          }))
      );
    };

    listener();

    datasource.addListener('changed', listener);

    return () => {
      datasource.removeListener('changed', listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasource]);

  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [
        { text: 'This is editable plain text, just like a <textarea>! [UUID]' },
      ],
    },
  ];

  const [value, setValue] = useState<Descendant[]>(initialValue);
  const [showPreview, setShowPreview] = useState(false);

  const toggleAttribute = (key: string) => {
    // Always insert the placeholder [attribute] at the cursor
    const placeholder = `[${key}]`;
    if (!editor.selection) {
      Transforms.select(editor, Editor.end(editor, [] as any));
    }
    Transforms.insertText(editor, placeholder);
    setShowAttributes(false);
  };

  // Helper to flatten Slate value to plain text
  const getEditorText = () => {
    return value.map(block => (block as any).children?.map((c: any) => c.text).join('')).join('\n');
  };

  // Helper to replace [attribute] with record values
  const getPreviewText = () => {
    const text = getEditorText();
    if (!record) return text;
    return text.replace(/\[([^\]]+)\]/g, (_m, key) => {
      const val = (record as any)[key];
      return val === undefined || val === null ? '' : String(val);
    });
  };

  return (
    <div
      ref={connect}
      style={{ ...style, fontFamily: 'Inter, system-ui, Arial, sans-serif' }}
      className={cn(className, classNames)}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid rgba(16,24,40,0.06)',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 8px 28px rgba(16,24,40,0.04)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowAttributes(s => !s)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #c7d2fe',
                  background: showAttributes ? '#eef2ff' : '#4b68ff',
                  color: showAttributes ? '#111' : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {showAttributes ? 'Close' : 'Attributes'}
              </button>

              {showAttributes && (
                <div
                  role="list"
                  aria-label="attributes"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    padding: 12,
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 10,
                    boxShadow: '0 10px 30px rgba(2,6,23,0.12)',
                    background: '#fff',
                    zIndex: 50,
                    width: 360,
                    maxHeight: 240,
                    overflow: 'auto',
                  }}
                >
                  {attributes.length === 0 ? (
                    <div style={{ color: '#666' }}>No attributes available</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {attributes.map(attr => {
                        return (
                          <button
                            key={attr.key}
                            type="button"
                            onClick={() => toggleAttribute(attr.key)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 12px',
                              borderRadius: 999,
                              border: '1px solid rgba(0,0,0,0.06)',
                              background: '#f8fafc',
                              cursor: 'pointer',
                              fontSize: 13,
                            }}
                          >
                            <span>{attr.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editor area */}
        <div
          style={{
            marginTop: 12,
            border: '1px solid rgba(2,6,23,0.06)',
            borderRadius: 8,
            minHeight: 180,
            padding: 12,
            background: '#fff',
          }}
        >
          <Slate editor={editor} value={value} onChange={v => setValue(v)}>
            <Editable
              placeholder="Type here..."
              style={{
                minHeight: 140,
                outline: 'none',
                fontSize: 14,
                lineHeight: '1.6',
              }}
            />
          </Slate>
        </div>

        {/* View button and preview */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => setShowPreview(s => !s)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid #4b68ff',
              background: showPreview ? '#eef2ff' : '#4b68ff',
              color: showPreview ? '#111' : '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {showPreview ? 'Hide View' : 'View'}
          </button>
        </div>
        {showPreview && (
          <div
            style={{
              marginTop: 12,
              padding: 16,
              background: '#f8fafc',
              border: '1px solid #c7d2fe',
              borderRadius: 8,
              fontSize: 15,
              color: '#222',
              whiteSpace: 'pre-wrap',
              minHeight: 60,
            }}
          >
            {getPreviewText()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizedEditor;
