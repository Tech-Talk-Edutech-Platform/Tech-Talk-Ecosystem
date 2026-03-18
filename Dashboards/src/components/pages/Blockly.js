// // src/pages/BlocklyEditor.js
// import React, { useEffect, useRef, useState } from "react";
// import * as Blockly from "blockly";
// import "blockly/blocks";
// import "blockly/msg/en";
// import { javascriptGenerator } from "blockly/javascript";
// import { pythonGenerator } from "blockly/python"; // Use the generator object

// export default function BlocklyEditor({ initialXml, darkMode, runPython }) {
//   const blocklyDiv = useRef(null);
//   const iframeRef = useRef(null);
//   const [workspace, setWorkspace] = useState(null);
//   const [output, setOutput] = useState("");
//   const [activeLang, setActiveLang] = useState("js"); // tabs: js, python, html

//   // --- Initialize Blockly workspace & define custom blocks ---
//   useEffect(() => {
//     if (!blocklyDiv.current) return;

//     // --- Custom HTML/CSS Blocks ---
//     if (!Blockly.Blocks['html_element']) {
//       Blockly.Blocks['html_element'] = {
//         init() {
//           this.appendDummyInput()
//             .appendField("HTML element")
//             .appendField(new Blockly.FieldDropdown([
//               ["div", "div"],
//               ["p", "p"],
//               ["h1", "h1"],
//               ["span", "span"],
//             ]), "TAG");
//           this.appendValueInput("CONTENT")
//             .setCheck("String")
//             .appendField("content");
//           this.setOutput(true, "String");
//           this.setColour(160);
//         },
//       };
//       javascriptGenerator.forBlock['html_element'] = function (block) {
//         const tag = block.getFieldValue("TAG");
//         const content = javascriptGenerator.valueToCode(block, "CONTENT", javascriptGenerator.ORDER_ATOMIC) || "";
//         return [`<${tag}>${content}</${tag}>`, javascriptGenerator.ORDER_NONE];
//       };
//       pythonGenerator.forBlock['html_element'] = function (block) {
//         const tag = block.getFieldValue("TAG");
//         const content = pythonGenerator.valueToCode(block, "CONTENT", pythonGenerator.ORDER_ATOMIC) || "''";
//         return [`f"<${tag}>{${content}}</${tag}>"`, pythonGenerator.ORDER_NONE];
//       };
//     }

//     if (!Blockly.Blocks['html_text']) {
//       Blockly.Blocks['html_text'] = {
//         init() {
//           this.appendDummyInput()
//             .appendField("Text")
//             .appendField(new Blockly.FieldTextInput("Hello"), "TEXT");
//           this.setOutput(true, "String");
//           this.setColour(160);
//         },
//       };
//       javascriptGenerator.forBlock['html_text'] = block => [`${block.getFieldValue("TEXT")}`, javascriptGenerator.ORDER_NONE];
//       pythonGenerator.forBlock['html_text'] = block => [`'${block.getFieldValue("TEXT")}'`, pythonGenerator.ORDER_ATOMIC];
//     }

//     if (!Blockly.Blocks['css_style']) {
//       Blockly.Blocks['css_style'] = {
//         init() {
//           this.appendDummyInput()
//             .appendField("CSS style")
//             .appendField(new Blockly.FieldTextInput("h1 { color:red; }"), "CSS");
//           this.setOutput(true, "String");
//           this.setColour(210);
//         },
//       };
//       javascriptGenerator.forBlock['css_style'] = block => [`<style>${block.getFieldValue("CSS")}</style>`, javascriptGenerator.ORDER_NONE];
//       pythonGenerator.forBlock['css_style'] = block => [`f"<style>{block.getFieldValue("CSS")}</style>"`, pythonGenerator.ORDER_NONE];
//     }

//     // --- Toolbox ---
//     const toolbox = {
//       kind: "categoryToolbox",
//       contents: [
//         {
//           kind: "category", name: "Logic", colour: "#5C81A6", contents: [
//             { kind: "block", type: "controls_if" },
//             { kind: "block", type: "logic_compare" },
//             { kind: "block", type: "logic_operation" },
//             { kind: "block", type: "logic_negate" },
//             { kind: "block", type: "logic_boolean" },
//           ]
//         },
//         {
//           kind: "category", name: "Loops", colour: "#5CA65C", contents: [
//             { kind: "block", type: "controls_repeat_ext" },
//             { kind: "block", type: "controls_whileUntil" },
//             { kind: "block", type: "controls_for" },
//             { kind: "block", type: "controls_forEach" },
//           ]
//         },
//         {
//           kind: "category", name: "Math", colour: "#5C68A6", contents: [
//             { kind: "block", type: "math_number" },
//             { kind: "block", type: "math_arithmetic" },
//             { kind: "block", type: "math_single" },
//           ]
//         },
//         {
//           kind: "category", name: "Text", colour: "#5CA68D", contents: [
//             { kind: "block", type: "text" },
//             { kind: "block", type: "text_join" },
//             { kind: "block", type: "text_print" },
//           ]
//         },
//         {
//           kind: "category", name: "HTML/CSS", colour: "#D65C5C", contents: [
//             { kind: "block", type: "html_element" },
//             { kind: "block", type: "html_text" },
//             { kind: "block", type: "css_style" },
//           ]
//         },
//         { kind: "category", name: "Variables", custom: "VARIABLE", colour: "#A65C81" },
//         { kind: "category", name: "Functions", custom: "PROCEDURE", colour: "#9A5CA6" },
//       ],
//     };

//     // --- Inject Blockly ---
//     const workspaceInstance = Blockly.inject(blocklyDiv.current, {
//       toolbox,
//       trashcan: true,
//       theme: Blockly.Themes.Classic,
//       zoom: { controls: true, wheel: true },
//       renderer: "zelos",
//     });

//     if (initialXml) {
//       const xml = Blockly.utils.xml.textToDom(initialXml);
//       Blockly.Xml.domToWorkspace(xml, workspaceInstance);
//     }

//     setWorkspace(workspaceInstance);
//     return () => workspaceInstance.dispose();
//   }, [initialXml]);

//   // --- Run Blockly code ---
//   const runCode = () => {
//     if (!workspace) return;
//     let code = "";

//     if (activeLang === "python") {
//       code = pythonGenerator.workspaceToCode(workspace);
//       if (runPython) {
//         runPython(code);
//         setOutput("🕹️ Running Python in Playground...");
//         return;
//       }
//     } else {
//       // Both 'js' and 'html' tabs use javascriptGenerator in this context
//       code = javascriptGenerator.workspaceToCode(workspace);
//     }

//     const iframe = iframeRef.current;
//     if (!iframe) return;

//     const wrappedCode = `
//       try {
//         const console = { log: (...args) => parent.postMessage({ type: 'log', data: args.join(' ') }, '*') };
//         ${code}
//       } catch(e) { parent.postMessage({ type: 'error', data: e.message }, '*'); }
//     `;

//     const blob = new Blob([wrappedCode], { type: "text/javascript" });
//     const blobUrl = URL.createObjectURL(blob);
//     iframe.src = blobUrl;
//     iframe.onload = () => URL.revokeObjectURL(blobUrl);
//     setOutput("");
//   };

//   // --- Capture console output ---
//   useEffect(() => {
//     const listener = (event) => {
//       if (event.data.type === "log") setOutput(prev => prev + event.data.data + "\n");
//       else if (event.data.type === "error") setOutput(prev => prev + "⚠️ Error: " + event.data.data + "\n");
//     };
//     window.addEventListener("message", listener);
//     return () => window.removeEventListener("message", listener);
//   }, []);

//   return (
//     <div className="w-screen h-screen flex flex-col md:flex-row" style={{ background: darkMode ? "#121212" : "#f9f9f9" }}>
//       <div className="flex flex-col flex-1">
//         {/* Language Tabs */}
//         <div className="flex gap-2 p-2">
//           {["js", "python", "html"].map(lang => (
//             <button
//               key={lang}
//               onClick={() => setActiveLang(lang)}
//               className={`px-3 py-1 rounded-t font-semibold ${activeLang === lang
//                 ? "bg-blue-600 text-white border-b-2 border-blue-600"
//                 : darkMode
//                   ? "bg-gray-800 text-gray-400"
//                   : "bg-gray-200 text-gray-600"
//                 }`}
//             >
//               {lang.toUpperCase()}
//             </button>
//           ))}
//         </div>

//         {/* Blockly Workspace */}
//         <div
//           ref={blocklyDiv}
//           className="flex-1"
//           style={{ height: "100%", width: "100%", background: darkMode ? "#1E1E1E" : "#fff" }}
//         />
//       </div>

//       {/* Controls + Output */}
//       <div className="md:w-1/3 w-full flex flex-col border-l border-gray-700 p-4" style={{ background: darkMode ? "#181818" : "#fafafa" }}>
//         <button onClick={runCode} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-3 w-full">
//           ▶ Run {activeLang.toUpperCase()}
//         </button>
//         <h3 className="font-semibold mb-2" style={{ color: darkMode ? "white" : "black" }}>Console Output</h3>
//         <pre className="p-3 rounded flex-1 overflow-auto" style={{ background: darkMode ? "#222" : "#f3f3f3", color: darkMode ? "#eee" : "#111" }}>
//           {output || "🕹️ Waiting for code to run..."}
//         </pre>
//         <iframe ref={iframeRef} sandbox="allow-scripts allow-same-origin" title="blockly-runner" style={{ display: "none" }} />
//       </div>
//     </div>
//   );
// }

// src/pages/BlocklyEditor.js
import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import "blockly/blocks";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/msg/en";
import "blockly/python"; // Python generator

export default function BlocklyEditor({ initialXml, darkMode, runPython }) {
  const blocklyDiv = useRef(null);
  const iframeRef = useRef(null);
  const [workspace, setWorkspace] = useState(null);
  const [output, setOutput] = useState("");

  // --- Inject Blockly workspace ---
  useEffect(() => {
    if (!blocklyDiv.current) return;

    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category", name: "Logic", colour: "#5C81A6", contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_negate" },
            { kind: "block", type: "logic_boolean" },
          ]
        },
        {
          kind: "category", name: "Loops", colour: "#5CA65C", contents: [
            { kind: "block", type: "controls_repeat_ext" },
            { kind: "block", type: "controls_whileUntil" },
            { kind: "block", type: "controls_for" },
            { kind: "block", type: "controls_forEach" },
          ]
        },
        {
          kind: "category", name: "Math", colour: "#5C68A6", contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_single" },
          ]
        },
        {
          kind: "category", name: "Text", colour: "#5CA68D", contents: [
            { kind: "block", type: "text" },
            { kind: "block", type: "text_join" },
            { kind: "block", type: "text_print" },
          ]
        },
        { kind: "category", name: "Variables", custom: "VARIABLE", colour: "#A65C81" },
        { kind: "category", name: "Functions", custom: "PROCEDURE", colour: "#9A5CA6" },
      ],
    };

    // --- Define custom dark theme ---
    const darkTheme = Blockly.Theme.defineTheme("darkTheme", {
      base: Blockly.Themes.Classic,
      componentStyles: {
        workspaceBackgroundColour: darkMode ? "#1E1E1E" : "#fff",
        toolboxBackgroundColour: darkMode ? "#2a2a2a" : "#f5f5f5",
        toolboxForegroundColour: darkMode ? "#eee" : "#111",
        flyoutBackgroundColour: darkMode ? "#2a2a2a" : "#f0f0f0",
        flyoutForegroundColour: darkMode ? "#eee" : "#111",
        scrollbarColour: darkMode ? "#555" : "#ccc",
      },
      blockStyles: {
        "logic_blocks": { colourPrimary: "#5C81A6", colourSecondary: "#4A6D8C", colourTertiary: "#3A5270" },
        "loop_blocks": { colourPrimary: "#5CA65C", colourSecondary: "#4A8A4A", colourTertiary: "#356E35" },
        "math_blocks": { colourPrimary: "#5C68A6", colourSecondary: "#4A568C", colourTertiary: "#374270" },
        "text_blocks": { colourPrimary: "#5CA68D", colourSecondary: "#4A8A74", colourTertiary: "#356E5B" },
        "variable_blocks": { colourPrimary: "#A65C81", colourSecondary: "#8A4A6D", colourTertiary: "#6E3552" },
        "procedure_blocks": { colourPrimary: "#9A5CA6", colourSecondary: "#7D4A8C", colourTertiary: "#603570" },
      },
    });

    const workspaceInstance = Blockly.inject(blocklyDiv.current, {
      toolbox,
      trashcan: true,
      theme: darkTheme,
      zoom: { controls: true, wheel: true },
      renderer: "zelos",
    });

    if (initialXml) {
      const xml = Blockly.Xml.textToDom(initialXml);
      Blockly.Xml.domToWorkspace(xml, workspaceInstance);
    }

    setWorkspace(workspaceInstance);
    return () => workspaceInstance.dispose();
  }, [darkMode, initialXml]);

  // --- Run code ---
  const runCode = (language = "js") => {
    if (!workspace) return;

    let code;
    if (language === "python") {
      code = Blockly.Python.workspaceToCode(workspace);
      if (runPython) {
        runPython(code);
        setOutput("🕹️ Running Python in Playground...");
        return;
      }
    } else {
      code = javascriptGenerator.workspaceToCode(workspace);
    }

    const iframe = iframeRef.current;
    if (!iframe) return;

    const wrappedCode = `
      try {
        const console = { log: (...args) => parent.postMessage({ type: 'log', data: args.join(' ') }, '*') };
        ${code}
      } catch (err) {
        parent.postMessage({ type: 'error', data: err.message }, '*');
      }
    `;

    const blob = new Blob([wrappedCode], { type: "text/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    iframe.src = blobUrl;
    iframe.onload = () => URL.revokeObjectURL(blobUrl);

    setOutput("");
  };

  // --- Capture iframe console ---
  useEffect(() => {
    const listener = (event) => {
      if (event.data.type === "log") setOutput((prev) => prev + event.data.data + "\n");
      if (event.data.type === "error") setOutput((prev) => prev + "⚠️ Error: " + event.data.data + "\n");
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col md:flex-row"
      style={{ background: darkMode ? "#121212" : "#f9f9f9", overflow: "hidden" }}
    >
      <div
        ref={blocklyDiv}
        className="flex-1"
        style={{ height: "100%", width: "100%" }}
      />

      <div
        className="md:w-1/3 w-full h-full flex flex-col border-l border-gray-700 p-4"
        style={{ background: darkMode ? "#181818" : "#fafafa" }}
      >
        <button
          onClick={() => runCode("js")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-3 w-full"
        >
          ▶ Run JavaScript
        </button>
        <button
          onClick={() => runCode("python")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-3 w-full"
        >
          🐍 Run Python
        </button>

        <h3 className="font-semibold mb-2">Console Output</h3>
        <pre
          className="p-3 rounded flex-1 overflow-auto"
          style={{ background: darkMode ? "#222" : "#f3f3f3", color: darkMode ? "#eee" : "#111" }}
        >
          {output || "🕹️ Waiting for code to run..."}
        </pre>

        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin"
          title="blockly-runner"
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
