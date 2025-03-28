import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Code2 } from "lucide-react";
import { useCodeStore } from "../store/useCodeStore";
import Editor from "@monaco-editor/react";
import "./../styles/Lobby.css";

// Represents the structure of each code block fetched from the backend
interface CodeBlock {
  _id: string;
  name: string;
  initialCode: string;
  solution: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const { codeBlocks, fetchCodeBlocks } = useCodeStore();
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  // Fetch the code blocks from the backend on component mount
  useEffect(() => {
    fetchCodeBlocks();
  }, [fetchCodeBlocks]);

  return (
    <div className="lobby-container">
      <div className="lobby-inner">
        <h1 className="lobby-title">Choose code block</h1>
        <p className="lobby-subtitle">
          Select a code block to start practicing or mentoring
        </p>
        <div className="lobby-grid">
          {Array.isArray(codeBlocks) && codeBlocks.length > 0 ? (
            (codeBlocks as unknown as CodeBlock[]).map((block: CodeBlock) => (
              <div
                key={block._id}
                className="code-card"
                onMouseEnter={() => setHoveredBlock(block._id)}
                onMouseLeave={() => setHoveredBlock(null)}
                onClick={() => navigate(`/block/${block._id}`)}
              >
                <div className="code-card-title">
                  <Code2 style={{ color: "#4f46e5" }} />
                  {block.name}
                </div>
                <p className="code-card-desc">Click to start coding</p>
                {hoveredBlock === block._id && (
                  <div className="preview-popup">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={block.initialCode}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "off",
                        folding: false,
                        scrollBeyondLastLine: false,
                        renderLineHighlight: "none",
                        contextmenu: false,
                        quickSuggestions: false,
                        parameterHints: { enabled: false },
                        suggestOnTriggerCharacters: false,
                        acceptSuggestionOnEnter: "off",
                        tabCompletion: "off",
                        wordBasedSuggestions: "off",
                        scrollbar: {
                          vertical: "hidden",
                          horizontal: "hidden",
                        },
                      }}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No code blocks available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
