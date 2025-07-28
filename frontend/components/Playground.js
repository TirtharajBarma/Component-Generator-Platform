"use client";
import { useEffect, useRef } from "react";
import { LiveProvider, LivePreview } from "react-live";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import css from "react-syntax-highlighter/dist/esm/languages/hljs/css";
import docco from "react-syntax-highlighter/dist/esm/styles/hljs/docco";
import { FaRegCopy, FaDownload } from "react-icons/fa";
import { useAppDispatch, useSession, useUI } from "../store/hooks";
import { generateComponent, updateSession } from "../store/thunks";
import { addChatMessage, setCode } from "../store/slices/sessionSlice";
import { setActiveTab, setChatInputValue, addNotification } from "../store/slices/uiSlice";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("css", css);

export default function Playground({ session }) {
  const dispatch = useAppDispatch();
  const { chat, code, generating, generationError } = useSession();
  const { activeTab, playground } = useUI();
  const chatEndRef = useRef(null);

  // Scroll chat to bottom on update
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // Send prompt to backend and update session
  const handleSend = async (e) => {
    e.preventDefault();
    const inputValue = playground.chatInputValue;
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: inputValue, timestamp: new Date().toISOString() };
    dispatch(addChatMessage(userMessage));
    dispatch(setChatInputValue(""));

    try {
      // Generate component
      const result = await dispatch(generateComponent({ 
        prompt: inputValue, 
        chat: [...chat, userMessage], 
        code 
      })).unwrap();

      // Add AI response to chat
      const hasJsx = result.jsx && result.jsx.trim();
      const hasCss = result.css && result.css.trim();
      
      let responseMessage = "Component updated.";
      if (!hasJsx && !hasCss) {
        responseMessage = "I couldn't generate the component. Please try rephrasing your request.";
      } else if (hasJsx && hasCss) {
        responseMessage = "Component generated with JSX and CSS.";
      } else if (hasJsx) {
        responseMessage = "Component generated with JSX.";
      } else {
        responseMessage = "Component generated with CSS only.";
      }
      
      const aiMessage = {
        role: "ai",
        content: responseMessage,
        timestamp: new Date().toISOString(),
      };
      
      dispatch(addChatMessage(aiMessage));
      dispatch(setCode({ jsx: result.jsx || '', css: result.css || '' }));

      // Auto-save session
      await dispatch(updateSession({
        sessionId: session._id,
        updates: { 
          chat: [...chat, userMessage, aiMessage], 
          code: { jsx: result.jsx || '', css: result.css || '' }
        }
      }));
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  // Copy code to clipboard
  const handleCopy = (type) => {
    navigator.clipboard.writeText(type === "jsx" ? code.jsx : code.css);
    dispatch(addNotification({
      type: 'success',
      message: `${type.toUpperCase()} code copied to clipboard!`
    }));
  };

  // Download code as zip (simple: 2 files in a zip)
  const handleDownload = async () => {
    try {
      const zip = await import("jszip");
      const JSZip = zip.default;
      const zipFile = new JSZip();
      zipFile.file("Component.jsx", code.jsx);
      zipFile.file("styles.css", code.css);
      const blob = await zipFile.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "component.zip";
      a.click();
      URL.revokeObjectURL(url);
      
      dispatch(addNotification({
        type: 'success',
        message: 'Component downloaded as ZIP!'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to download component'
      }));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-[80vh] bg-white rounded-xl shadow overflow-hidden border border-black/10 transition-all duration-200">
      {/* Sidebar Chat */}
      <aside className="w-full sm:w-80 border-b sm:border-b-0 sm:border-r border-black/10 bg-white flex flex-col">
        <div className="p-4 font-bold border-b border-black/10 text-black text-lg">Chat</div>
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          {chat.length === 0 && <div className="text-gray-400">No chat yet.</div>}
          {chat.map((msg, i) => (
            <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === "user" ? "bg-black text-white" : "bg-gray-100 text-black border border-black/10"}`}>
                {msg.content}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {generating && (
            <div className="flex items-center justify-center text-black mt-2">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              Generating...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form className="p-4 border-t border-black/10 flex gap-2 bg-white" onSubmit={handleSend}>
          <input
            className="flex-1 p-2 border border-black/10 rounded-lg bg-white text-black placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black/20 transition"
            placeholder="Send a prompt..."
            value={playground.chatInputValue}
            onChange={(e) => dispatch(setChatInputValue(e.target.value))}
            disabled={generating}
          />
          <button
            type="submit"
            className="playground-ui bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-white hover:text-black border border-black transition disabled:opacity-50"
            disabled={generating || !playground.chatInputValue.trim()}
          >
            {generating ? "..." : "Send"}
          </button>
        </form>
        {generationError && <div className="p-2 text-red-600 text-xs text-center">{generationError}</div>}
      </aside>
      {/* Main Preview & Code */}
      <main className="flex-1 flex flex-col bg-white">
        {/* Live Preview */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 border-b border-black/10">
          <div className="relative w-full h-full flex items-center justify-center">
            {generating && (
              <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-10">
                <svg className="animate-spin h-8 w-8 text-black" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              </div>
            )}
            {code.jsx ? (
              <div className="component-preview-container p-4 sm:p-8 bg-white rounded-xl border border-black/10 shadow-inner min-w-[200px] min-h-[100px] max-w-full max-h-full flex items-center justify-center">
                <style dangerouslySetInnerHTML={{ __html: code.css }} />
                <LiveProvider code={code.jsx} noInline>
                  <LivePreview className="w-full h-full" />
                </LiveProvider>
              </div>
            ) : (
              <div className="text-gray-400 text-center">
                <p>No component generated yet.</p>
                <p className="text-sm">Send a prompt to generate a React component!</p>
              </div>
            )}
          </div>
        </div>
        {/* Code Tabs */}
        <div className="border-t border-black/10 bg-white">
          <div className="flex space-x-2 sm:space-x-4 p-2 border-b border-black/10 bg-white">
            <button
              className={`tab px-4 py-1 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "jsx" ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
              onClick={() => dispatch(setActiveTab("jsx"))}
            >
              JSX
            </button>
            <button
              className={`tab px-4 py-1 rounded-lg font-semibold text-sm sm:text-base ${activeTab === "css" ? "bg-black text-white" : "text-black hover:bg-gray-100"}`}
              onClick={() => dispatch(setActiveTab("css"))}
            >
              CSS
            </button>
            <button
              className="playground-ui ml-auto flex items-center gap-1 px-3 py-1 text-xs bg-white border border-black/10 rounded-lg hover:bg-black hover:text-white transition focus:outline-none focus:ring-2 focus:ring-black/20"
              onClick={() => handleCopy(activeTab)}
              type="button"
            >
              <FaRegCopy className="inline-block" />
              Copy
            </button>
            <button
              className="playground-ui flex items-center gap-1 px-3 py-1 text-xs bg-white border border-black/10 rounded-lg hover:bg-black hover:text-white transition focus:outline-none focus:ring-2 focus:ring-black/20"
              onClick={handleDownload}
              type="button"
            >
              <FaDownload className="inline-block" />
              Download ZIP
            </button>
          </div>
          <div className="p-4 text-sm overflow-auto bg-white" style={{ maxHeight: 200 }}>
            {(activeTab === "jsx" ? code.jsx : code.css) ? (
              <SyntaxHighlighter language={activeTab === "jsx" ? "javascript" : "css"} style={docco} customStyle={{ background: 'transparent', color: '#111', fontSize: '1em', padding: 0 }}>
                {activeTab === "jsx" ? code.jsx : code.css}
              </SyntaxHighlighter>
            ) : (
              <div className="text-gray-400 italic">
                No {activeTab.toUpperCase()} code generated yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 