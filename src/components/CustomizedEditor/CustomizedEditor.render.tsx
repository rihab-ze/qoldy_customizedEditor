import { splitDatasourceID, unsubscribeFromDatasource, useRenderer, useSources, useWebformPath } from '@ws-ui/webform-editor';
import cn from 'classnames';
import { FC, useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { ICustomizedEditorProps } from './CustomizedEditor.config';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact } from 'slate-react';
import { createEditor, Descendant, Transforms, Editor } from 'slate';
import debounce from 'lodash.debounce';

type Attribute = {
  key: string;
  label: string;
};

const CustomizedEditor: FC<ICustomizedEditorProps> = ({ template, style, className, classNames = [] }) => {
  const { connect } = useRenderer();
  const {
    sources: { datasource },
  } = useSources();
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [
        { text: 'This is editable plain text, just like a <textarea>!' },
      ],
    },
  ];

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [showAttributes, setShowAttributes] = useState(false);
  const [value, setValue] = useState<Descendant[]>(initialValue);
  const lastSavedValue = useRef<string>("");
  const initialized = useRef(false);
  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const path = useWebformPath();

  useEffect(() => {
    if (!template) return;

    const { id, namespace } = splitDatasourceID(template);
    const myTemplate =
      window.DataSource.getSource(id, namespace) || window.DataSource.getSource(template, path);
    if (!myTemplate) return;

    const updateTemplate = async () => {
      if (initialized.current) return;
      initialized.current = true;
      const val = await myTemplate.getValue();
      if (!val) return;
      const newNodes = [
        {
          type: 'paragraph' as const,
          children: [
            { text: val },
          ],
        },
      ];
      const { children } = editor;
      if (children && children.length > 0) {
        Transforms.removeNodes(editor, {
          at: [0],
          match: () => true,
        });
      }
      Transforms.insertNodes(editor, newNodes, { at: [0] });
      setValue([...newNodes]);
    };
    updateTemplate();
    setAttributes(
      Object.values(datasource.dataclass.getAllAttributes())
        .map(attr => ({
          key: attr.name,
          label: attr.name
        }))
    );
    myTemplate.addListener('changed', updateTemplate);
    return () => unsubscribeFromDatasource(myTemplate, updateTemplate);
  }, [datasource]);

  const handleSave = useCallback(
    debounce(async (customValue?: Descendant[]) => {
      if (!template) return;
      if (customValue && JSON.stringify(customValue) === template) return;
      const { id, namespace } = splitDatasourceID(template);
      const myTemplate =
        window.DataSource.getSource(id, namespace) || window.DataSource.getSource(template, path);
      if (!myTemplate) return;
      // Get plain text from editor
      const valToSave = customValue || value;
      const text = valToSave.map(block => (block as any).children?.map((c: any) => c.text).join('')).join('\n');
      if (lastSavedValue.current === text) return;
      lastSavedValue.current = text;
      myTemplate.setValue(null, text);
    }, 200),
    [template, path, value]
  );

  const toggleAttribute = (key: string) => {
    // insert the placeholder [attribute] at the cursor
    const placeholder = `[${key}]`;
    if (!editor.selection) {
      Transforms.select(editor, Editor.end(editor, [] as any));
    }
    Transforms.insertText(editor, placeholder);
    setShowAttributes(false);
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
          <Slate editor={editor} value={value} onChange={v => {
            handleSave(v);
          }}>
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
      </div>
    </div >
  );
};

export default CustomizedEditor;

