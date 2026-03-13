import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/msg/en";

export default function BlocklyEditor({ initialXml, darkMode }) {
  const blocklyDiv = useRef(null);
  const iframeRef = useRef(null);
  const [workspace, setWorkspace] = useState(null);
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // 🧩 Define toolbox XML (must be a string, not ref)
    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Logic",
          colour: "#5C81A6",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_negate" },
            { kind: "block", type: "logic_boolean" },
          ],
        },
        {
          kind: "category",
          name: "Loops",
          colour: "#5CA65C",
          contents: [
            { kind: "block", type: "controls_repeat_ext" },
            { kind: "block", type: "controls_whileUntil" },
            { kind: "block", type: "controls_for" },
            { kind: "block", type: "controls_forEach" },
          ],
        },
        {
          kind: "category",
          name: "Math",
          colour: "#5C68A6",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_single" },
          ],
        },
        {
          kind: "category",
          name: "Text",
          colour: "#5CA68D",
          contents: [
            { kind: "block", type: "text" },
            { kind: "block", type: "text_join" },
            { kind: "block", type: "text_print" },
          ],
        },
        { kind: "category", name: "Variables", custom: "VARIABLE", colour: "#A65C81" },
        { kind: "category", name: "Functions", custom: "PROCEDURE", colour: "#9A5CA6" },
      ],
    };

    // 🧠 Inject Blockly workspace
    const workspaceInstance = Blockly.inject(blocklyDiv.current, {
      toolbox,
      trashcan: true,
      theme: darkMode ? Blockly.Themes.Dark : Blockly.Themes.Classic,
      zoom: {
        controls: true,
        wheel: true,
      },
    });

    // Load initial XML if provided
    if (initialXml) {
      const xml = Blockly.Xml.textToDom(initialXml);
      Blockly.Xml.domToWorkspace(xml, workspaceInstance);
    }

    setWorkspace(workspaceInstance);

    return () => workspaceInstance.dispose();
  }, [darkMode, initialXml]);

  // 🚀 Run code in iframe sandbox
  const runCode = () => {
    if (!workspace) return;

    const code = javascriptGenerator.workspaceToCode(workspace);
    const iframe = iframeRef.current;
    if (!iframe) return;

    const wrappedCode = `
      try {
        const console = { 
          log: (...args) => parent.postMessage({ type: 'log', data: args.join(' ') }, '*')
        };
        ${code}
      } catch (err) {
        parent.postMessage({ type: 'error', data: err.message }, '*');
      }
    `;

    const blob = new Blob([wrappedCode], { type: "text/javascript" });
    iframe.src = URL.createObjectURL(blob);
    setOutput(""); // clear previous
  };

  // 🧾 Capture console messages
  useEffect(() => {
    const listener = (event) => {
      if (event.data.type === "log") {
        setOutput((prev) => prev + event.data.data + "\n");
      } else if (event.data.type === "error") {
        setOutput((prev) => prev + "⚠️ Error: " + event.data.data + "\n");
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col md:flex-row"
      style={{ background: darkMode ? "#121212" : "#f9f9f9", overflow: "hidden" }}
    >
      {/* Blockly Workspace */}
      <div
        ref={blocklyDiv}
        className="flex-1"
        style={{
          height: "100%",
          width: "100%",
          background: darkMode ? "#1E1E1E" : "#fff",
        }}
      />

      {/* Run + Output Panel */}
      <div
        className="md:w-1/3 w-full h-full flex flex-col border-l border-gray-300 p-4"
        style={{ background: darkMode ? "#181818" : "#fafafa" }}
      >
        <button
          onClick={runCode}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-3 w-full"
        >
          ▶ Run Code
        </button>

        <h3 className="font-semibold mb-2">Console Output</h3>
        <pre
          className="p-3 rounded flex-1 overflow-auto"
          style={{
            background: darkMode ? "#222" : "#f3f3f3",
            color: darkMode ? "#eee" : "#111",
          }}
        >
          {output || "🕹️ Waiting for code to run..."}
        </pre>
<iframe
  ref={iframeRef}
  sandbox="allow-scripts allow-same-origin"
  title="blockly-runner"
  style={{ display: "none" }}
/>

        {/* <iframe ref={iframeRef} sandbox="allow-scripts" style={{ display: "none" }} /> */}
      </div>
    </div>
  );
}
