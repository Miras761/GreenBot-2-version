
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts = content.split(codeBlockRegex);

  return (
    <div className="prose prose-invert text-white">
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          // This is a code block
          return (
            <pre key={index} className="bg-black/50 p-3 rounded-md overflow-x-auto my-2">
              <code>{part.trim()}</code>
            </pre>
          );
        } else {
          // This is regular text
          return part.split('\n').map((line, lineIndex) => {
            if (line.trim() === '') return null;
            
            // Simple bold and italic
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            return <p key={`${index}-${lineIndex}`} dangerouslySetInnerHTML={{ __html: line }} className="mb-2 last:mb-0" />;
          });
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
