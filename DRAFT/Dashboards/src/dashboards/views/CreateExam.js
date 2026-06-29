import React, { useState } from 'react';

export default function CreateExam() {
  const [questions, setQuestions] = useState([{ question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '', marks: 5 }]);

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-xl rounded-3xl mt-10">
      <div className="border-b pb-6 mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Exam Builder</h1>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 shadow-lg">Save Exam</button>
      </div>
      
      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-gray-50 p-6 rounded-2xl mb-6 border border-gray-200">
          <input 
            placeholder="Type your question here..." 
            className="w-full bg-transparent text-lg font-medium border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2 mb-4"
          />
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(q.options).map((key) => (
              <input 
                key={key}
                placeholder={`Option ${key}`}
                className="bg-white border rounded-lg px-4 py-2 outline-none focus:ring-2 ring-blue-100"
              />
            ))}
          </div>
        </div>
      ))}
      
      <button 
        onClick={() => setQuestions([...questions, { question: '', options: { A: '', B: '', C: '', D: '' } }])}
        className="text-blue-600 font-semibold hover:text-blue-700 py-2"
      >
        + Add another question
      </button>
    </div>
  );
};
// import React, { useState } from 'react';

// export default function CreateExam() {
//   const [exam, setExam] = useState({ title: '', duration: 60 });
//   const [questions, setQuestions] = useState([{ question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '', marks: 5 }]);

//   const addQuestion = () => {
//     setQuestions([...questions, { question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: '', marks: 5 }]);
//   };

//   const saveExam = async () => {
//     // 1. First, save the exam to the 'exams' table
//     const examRes = await fetch('/api/exams', { method: 'POST', body: JSON.stringify(exam) });
//     const { id: examId } = await examRes.json();

//     // 2. Then, save each question to the 'questions' table
//     await fetch('/api/questions', { 
//       method: 'POST', 
//       body: JSON.stringify({ questions, examId }) 
//     });
    
//     alert("Exam created successfully!");
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6">
//       <h1 className="text-2xl mb-4">Create New Exam</h1>
//       <input 
//         placeholder="Exam Title" 
//         onChange={(e) => setExam({...exam, title: e.target.value})}
//         className="border p-2 w-full mb-4"
//       />
      
//       {questions.map((q, qIdx) => (
//         <div key={qIdx} className="border-b pb-4 mb-4">
//           <input 
//             placeholder="Question Text" 
//             className="border p-2 w-full"
//             onChange={(e) => {
//               const newQs = [...questions];
//               newQs[qIdx].question = e.target.value;
//               setQuestions(newQs);
//             }}
//           />
//           {Object.keys(q.options).map((optKey) => (
//             <input 
//               key={optKey}
//               placeholder={`Option ${optKey}`}
//               className="border p-1 w-1/4 mt-2"
//               onChange={(e) => {
//                 const newQs = [...questions];
//                 newQs[qIdx].options[optKey] = e.target.value;
//                 setQuestions(newQs);
//               }}
//             />
//           ))}
//           <input 
//             placeholder="Correct Option (e.g. A)" 
//             className="border p-2 w-full mt-2"
//             onChange={(e) => {
//               const newQs = [...questions];
//               newQs[qIdx].correctAnswer = e.target.value;
//               setQuestions(newQs);
//             }}
//           />
//         </div>
//       ))}
      
//       <button onClick={addQuestion} className="bg-green-600 text-white p-2">+ Add Question</button>
//       <button onClick={saveExam} className="bg-blue-600 text-white p-2 ml-4">Save Exam</button>
//     </div>
//   );
// };
// // import { useState } from "react";
// // import { supabase } from "../../supabase";

// // export default function CreateExam() {
// //     const [title, setTitle] = useState("");
// //     const [duration, setDuration] = useState(60);
// //     const [questions, setQuestions] = useState([]);

// //     const addQuestion = () => {
// //         setQuestions([
// //             ...questions,
// //             {
// //                 id: Date.now().toString(),
// //                 type: "mcq",
// //                 question: "",
// //                 options: ["", "", "", ""],
// //                 correct_answer: "",
// //                 marks: 5
// //             }
// //         ]);
// //     };

// //     const saveExam = async () => {
// //         const examId = Date.now().toString();

// //         await supabase.from("exams").insert({
// //             id: examId,
// //             title,
// //             duration_minutes: duration
// //         });

// //         for (let q of questions) {
// //             await supabase.from("questions").insert({
// //                 ...q,
// //                 exam_id: examId
// //             });
// //         }

// //         alert("Exam created!");
// //     };

// //     return (
// //         <div className="p-6">
// //             <h1 className="text-xl font-bold mb-4">Create Exam</h1>

// //             <input
// //                 placeholder="Exam Title"
// //                 className="border p-2 w-full mb-2"
// //                 onChange={e => setTitle(e.target.value)}
// //             />

// //             <input
// //                 type="number"
// //                 placeholder="Duration (mins)"
// //                 className="border p-2 w-full mb-4"
// //                 onChange={e => setDuration(e.target.value)}
// //             />

// //             <button
// //                 onClick={addQuestion}
// //                 className="bg-green-600 text-white px-4 py-2 mb-4"
// //             >
// //                 + Add Question
// //             </button>

// //             {questions.map((q, i) => (
// //                 <div key={q.id} className="border p-4 mb-4">
// //                     <input
// //                         placeholder="Question"
// //                         className="border p-2 w-full mb-2"
// //                         onChange={e => {
// //                             q.question = e.target.value;
// //                             setQuestions([...questions]);
// //                         }}
// //                     />

// //                     {q.options.map((opt, idx) => (
// //                         <input
// //                             key={idx}
// //                             placeholder={`Option ${idx + 1}`}
// //                             className="border p-2 w-full mb-1"
// //                             onChange={e => {
// //                                 q.options[idx] = e.target.value;
// //                                 setQuestions([...questions]);
// //                             }}
// //                         />
// //                     ))}

// //                     <input
// //                         placeholder="Correct Answer"
// //                         className="border p-2 w-full"
// //                         onChange={e => {
// //                             q.correct_answer = e.target.value;
// //                             setQuestions([...questions]);
// //                         }}
// //                     />
// //                 </div>
// //             ))}

// //             <button
// //                 onClick={saveExam}
// //                 className="bg-blue-600 text-white px-6 py-2"
// //             >
// //                 Save Exam
// //             </button>
// //         </div>
// //     );
// // }