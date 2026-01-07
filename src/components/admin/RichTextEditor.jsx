import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link, Image, Code, Quote, Type, Undo, Redo 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync initial value
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const ToolbarButton = ({ icon: Icon, command, arg = null, label }) => (
    <button
      type="button"
      onClick={() => execCommand(command, arg)}
      className="p-2 text-gray-500 hover:text-[#5D9CEC] hover:bg-[#E8F4F8] rounded-lg transition-colors"
      title={label}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className={`border rounded-xl overflow-hidden bg-white transition-all ${isFocused ? 'border-[#5D9CEC] ring-2 ring-[#5D9CEC]/20' : 'border-gray-200'}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton icon={Undo} command="undo" label="Undo" />
          <ToolbarButton icon={Redo} command="redo" label="Redo" />
        </div>
        
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton icon={Bold} command="bold" label="Bold" />
          <ToolbarButton icon={Italic} command="italic" label="Italic" />
          <ToolbarButton icon={Underline} command="underline" label="Underline" />
        </div>

        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton icon={AlignLeft} command="justifyLeft" label="Align Left" />
          <ToolbarButton icon={AlignCenter} command="justifyCenter" label="Align Center" />
          <ToolbarButton icon={AlignRight} command="justifyRight" label="Align Right" />
        </div>

        <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton icon={List} command="insertUnorderedList" label="Bullet List" />
          <ToolbarButton icon={ListOrdered} command="insertOrderedList" label="Numbered List" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton icon={Quote} command="formatBlock" arg="blockquote" label="Quote" />
          <button
            type="button"
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url);
            }}
            className="p-2 text-gray-500 hover:text-[#5D9CEC] hover:bg-[#E8F4F8] rounded-lg transition-colors"
          >
            <Link size={18} />
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        dir="ltr"
        className="min-h-[300px] p-4 focus:outline-none prose max-w-none text-gray-800 font-roboto"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

export default RichTextEditor;