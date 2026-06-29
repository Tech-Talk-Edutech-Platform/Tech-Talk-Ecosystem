import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../supabase";
import { useParams } from "react-router-dom";

// const ContentRenderer = ({ q }) => {
//   switch(q.type) {
//     case 'code':
//       return <pre className="bg-black text-green-400 p-4 rounded overflow-x-auto">{q.content}</pre>;
//     case 'image':
//       return <img src={q.media_url} alt="Question Graphic" className="rounded-lg shadow-sm" />;
//     default:
//       return <p className="text-lg text-gray-800">{q.content}</p>;
//   }
// };
export default function ExamPage({ user }) {
    const { id } = useParams(); // ✅ Correct: Inside the component

    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);

    // 1. Load Exam and Questions first
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Fetch Exam
            const { data: examData } = await supabase
                .from("exams")
                .select("*")
                .eq("id", id)
                .single();

            if (examData) {
                setExam(examData);
                setTimeLeft(examData.duration_minutes * 60);

                // Fetch Questions
                const { data: qData } = await supabase
                    .from("questions")
                    .select("*")
                    .eq("exam_id", examData.id);

                setQuestions(qData || []);

                // 2. Start/Initialize Attempt
                const { data: attemptData } = await supabase
                    .from("attempts")
                    .insert({
                        exam_id: examData.id,
                        student_id: user?.id,
                        start_time: new Date()
                    })
                    .select()
                    .single();

                setAttempt(attemptData);
            }
            setLoading(false);
        };

        if (id && user) fetchData();
    }, [id, user]);

    // 🧠 Submit Function (defined with useCallback to avoid re-initialization issues)
    const submitExam = useCallback(async () => {
        if (!attempt) return;

        const { data: allAnswers } = await supabase
            .from("answers")
            .select("*")
            .eq("attempt_id", attempt.id);

        let score = 0;
        allAnswers?.forEach(a => {
            const q = questions.find(q => q.id === a.question_id);
            if (q?.type === "mcq" && a.answer === q.correct_answer) {
                score += q.marks;
            }
        });

        await supabase
            .from("attempts")
            .update({ score, end_time: new Date() })
            .eq("id", attempt.id);

        alert(`Exam submitted! Your score: ${score}`);
    }, [attempt, questions]);

    // ⏱ Timer Logic
    useEffect(() => {
        if (!attempt || !exam) return;

        const interval = setInterval(() => {
            const elapsed = (Date.now() - new Date(attempt.start_time)) / 1000;
            const remaining = (exam.duration_minutes * 60) - elapsed;

            setTimeLeft(Math.max(0, remaining));

            if (remaining <= 0) {
                clearInterval(interval);
                submitExam();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [attempt, exam, submitExam]);

    // 💾 Save answer
    const saveAnswer = async (qId, value) => {
        if (!attempt) return;
        setAnswers(prev => ({ ...prev, [qId]: value }));

        await supabase.from("answers").upsert({
            attempt_id: attempt.id,
            question_id: qId,
            answer: value
        });
    };

    if (loading) return <div className="p-10">Loading Exam Content...</div>;
    if (!exam) return <div className="p-10">Exam not found.</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-mono shadow-lg">
                ⏱ {Math.floor(timeLeft / 60)}:
                {("0" + Math.floor(timeLeft % 60)).slice(-2)}
            </div>

            <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
            <p className="text-gray-600 mb-8">Total Questions: {questions.length}</p>

            {questions.map((q, index) => (
                <div key={q.id} className="mb-8 p-6 bg-white border rounded-xl shadow-sm">
                    <p className="text-lg font-medium mb-4">{index + 1}. {q.question}</p>

                    {q.type === "mcq" && q.options && (
                        <div className="space-y-2">
                            {q.options.map(opt => (
                                <label key={opt} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="radio"
                                        name={q.id}
                                        className="w-4 h-4 text-blue-600"
                                        onChange={() => saveAnswer(q.id, opt)}
                                    />
                                    <span>{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {(q.type === "short" || q.type === "debug") && (
                        <textarea
                            className="w-full border rounded-lg p-3 mt-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows="4"
                            placeholder="Type your answer here..."
                            onChange={e => saveAnswer(q.id, e.target.value)}
                        />
                    )}
                </div>
            ))}

            <button
                onClick={submitExam}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
                Finish and Submit Exam
            </button>
        </div>
    );
}
// import { useEffect, useState } from "react";
// import { supabase } from "../../supabase";
// import { useParams } from "react-router-dom";

// export default function ExamPage({ user }) {
//     const { id } = useParams(); // ✅ inside component

//     const [exam, setExam] = useState(null);
//     const [questions, setQuestions] = useState([]);
//     const [attempt, setAttempt] = useState(null);
//     const [answers, setAnswers] = useState({});
//     const [timeLeft, setTimeLeft] = useState(0);

//     // ✅ Load exam
//     useEffect(() => {
//         const loadExam = async () => {
//             const { data } = await supabase
//                 .from("exams")
//                 .select("*")
//                 .eq("id", id)
//                 .single();

//             if (data) {
//                 setExam(data);
//                 setTimeLeft(data.duration_minutes * 60);
//             }
//         };

//         loadExam();
//     }, [id]);

//     // ✅ Load questions
//     useEffect(() => {
//         if (!exam) return;

//         const loadQuestions = async () => {
//             const { data } = await supabase
//                 .from("questions")
//                 .select("*")
//                 .eq("exam_id", exam.id);

//             setQuestions(data || []);
//         };

//         loadQuestions();
//     }, [exam]);

//     // ✅ Start attempt
//     useEffect(() => {
//         if (!exam) return;

//         const start = async () => {
//             const { data } = await supabase
//                 .from("attempts")
//                 .insert({
//                     exam_id: exam.id,
//                     student_id: user.id,
//                     start_time: new Date()
//                 })
//                 .select()
//                 .single();

//             setAttempt(data);
//         };

//         start();
//     }, [exam]);

//     // ⏱ Timer
//     useEffect(() => {
//         if (!attempt || !exam) return;

//         const interval = setInterval(() => {
//             const elapsed =
//                 (Date.now() - new Date(attempt.start_time)) / 1000;

//             const remaining =
//                 exam.duration_minutes * 60 - elapsed;

//             setTimeLeft(Math.max(0, remaining));

//             if (remaining <= 0) submitExam();
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [attempt, exam]);

//     // 💾 Save answer
//     const saveAnswer = async (qId, value) => {
//         if (!attempt) return;

//         setAnswers(prev => ({ ...prev, [qId]: value }));

//         await supabase.from("answers").upsert({
//             attempt_id: attempt.id,
//             question_id: qId,
//             answer: value
//         });
//     };

//     // 🧠 Submit
//     const submitExam = async () => {
//         if (!attempt) return;

//         const { data: allAnswers } = await supabase
//             .from("answers")
//             .select("*")
//             .eq("attempt_id", attempt.id);

//         let score = 0;

//         allAnswers.forEach(a => {
//             const q = questions.find(q => q.id === a.question_id);

//             if (q?.type === "mcq" && a.answer === q.correct_answer) {
//                 score += q.marks;
//             }
//         });

//         await supabase
//             .from("attempts")
//             .update({
//                 score,
//                 end_time: new Date()
//             })
//             .eq("id", attempt.id);

//         alert("Exam submitted!");
//     };

//     if (!exam) return <p>Loading exam...</p>;

//     return (
//         <div className="p-6">
//             {/* ⏱ Timer */}
//             <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded">
//                 ⏱ {Math.floor(timeLeft / 60)}:
//                 {("0" + (timeLeft % 60)).slice(-2)}
//             </div>

//             <h1 className="text-xl font-bold mb-4">{exam.title}</h1>

//             {questions.map(q => (
//                 <div key={q.id} className="mb-6 p-4 border rounded">
//                     <p className="font-semibold">{q.question}</p>

//                     {q.type === "mcq" &&
//                         q.options.map(opt => (
//                             <label key={opt} className="block">
//                                 <input
//                                     type="radio"
//                                     name={q.id}
//                                     onChange={() => saveAnswer(q.id, opt)}
//                                 />
//                                 {opt}
//                             </label>
//                         ))}

//                     {(q.type === "short" || q.type === "debug") && (
//                         <textarea
//                             className="w-full border p-2 mt-2"
//                             onChange={e => saveAnswer(q.id, e.target.value)}
//                         />
//                     )}

//                     {q.type === "practical" && (
//                         <input
//                             type="text"
//                             placeholder="Paste Scratch project link"
//                             className="w-full border p-2 mt-2"
//                             onChange={e => saveAnswer(q.id, e.target.value)}
//                         />
//                     )}
//                 </div>
//             ))}

//             <button
//                 onClick={submitExam}
//                 className="bg-blue-600 text-white px-6 py-2 rounded"
//             >
//                 Submit Exam
//             </button>
//         </div>
//     );
// }
// // import { useEffect, useState } from "react";
// // import { supabase } from "../supabase";
// // import { useParams } from "react-router-dom";

// // const { id } = useParams();

// // export default function ExamPage({ exam, user }) {
// //     const [questions, setQuestions] = useState([]);
// //     const [attempt, setAttempt] = useState(null);
// //     const [answers, setAnswers] = useState({});
// //     const [timeLeft, setTimeLeft] = useState(0);
// //     const { data: exam } = await supabase
// //         .from("exams")
// //         .select("*")
// //         .eq("id", id)
// //         .single();

// //     // 🚀 Start exam
// //     useEffect(() => {
// //         const start = async () => {
// //             const { data } = await supabase
// //                 .from("attempts")
// //                 .insert({
// //                     exam_id: exam.id,
// //                     student_id: user.id,
// //                     start_time: new Date()
// //                 })
// //                 .select()
// //                 .single();

// //             setAttempt(data);
// //             setTimeLeft(exam.duration_minutes * 60);
// //         };

// //         start();
// //     }, []);

// //     // ⏱ Timer
// //     useEffect(() => {
// //         if (!attempt) return;

// //         const interval = setInterval(() => {
// //             const elapsed =
// //                 (Date.now() - new Date(attempt.start_time)) / 1000;
// //             const remaining =
// //                 exam.duration_minutes * 60 - elapsed;

// //             setTimeLeft(Math.max(0, remaining));

// //             if (remaining <= 0) submitExam();
// //         }, 1000);

// //         return () => clearInterval(interval);
// //     }, [attempt]);

// //     // 📥 Load questions
// //     useEffect(() => {
// //         const load = async () => {
// //             const { data } = await supabase
// //                 .from("questions")
// //                 .select("*")
// //                 .eq("exam_id", exam.id);

// //             setQuestions(data);
// //         };

// //         load();
// //     }, []);

// //     // 💾 Save answer
// //     const saveAnswer = async (qId, value) => {
// //         setAnswers(prev => ({ ...prev, [qId]: value }));

// //         await supabase.from("answers").upsert({
// //             attempt_id: attempt.id,
// //             question_id: qId,
// //             answer: value
// //         });
// //     };

// //     // 🧠 Submit
// //     const submitExam = async () => {
// //         const { data: allAnswers } = await supabase
// //             .from("answers")
// //             .select("*")
// //             .eq("attempt_id", attempt.id);

// //         const { data: qs } = await supabase
// //             .from("questions")
// //             .select("*")
// //             .eq("exam_id", exam.id);

// //         let score = 0;

// //         allAnswers.forEach(a => {
// //             const q = qs.find(q => q.id === a.question_id);

// //             if (q.type === "mcq" && a.answer === q.correct_answer) {
// //                 score += q.marks;
// //             }
// //         });

// //         await supabase
// //             .from("attempts")
// //             .update({
// //                 score,
// //                 end_time: new Date()
// //             })
// //             .eq("id", attempt.id);

// //         alert("Exam submitted!");
// //     };

// //     return (
// //         <div className="p-6">
// //             {/* ⏱ Timer */}
// //             <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded">
// //                 ⏱ {Math.floor(timeLeft / 60)}:
// //                 {("0" + (timeLeft % 60)).slice(-2)}
// //             </div>

// //             <h1 className="text-xl font-bold mb-4">{exam.title}</h1>

// //             {questions.map(q => (
// //                 <div key={q.id} className="mb-6 p-4 border rounded">
// //                     <p className="font-semibold">{q.question}</p>

// //                     {/* MCQ */}
// //                     {q.type === "mcq" &&
// //                         q.options.map(opt => (
// //                             <label key={opt} className="block">
// //                                 <input
// //                                     type="radio"
// //                                     name={q.id}
// //                                     onChange={() => saveAnswer(q.id, opt)}
// //                                 />
// //                                 {opt}
// //                             </label>
// //                         ))}

// //                     {/* Short / Debug */}
// //                     {(q.type === "short" || q.type === "debug") && (
// //                         <textarea
// //                             className="w-full border p-2 mt-2"
// //                             onChange={e =>
// //                                 saveAnswer(q.id, e.target.value)
// //                             }
// //                         />
// //                     )}

// //                     {/* Practical */}
// //                     {q.type === "practical" && (
// //                         <input
// //                             type="text"
// //                             placeholder="Paste Scratch project link"
// //                             className="w-full border p-2 mt-2"
// //                             onChange={e =>
// //                                 saveAnswer(q.id, e.target.value)
// //                             }
// //                         />
// //                     )}
// //                 </div>
// //             ))}

// //             <button
// //                 onClick={submitExam}
// //                 className="bg-blue-600 text-white px-6 py-2 rounded"
// //             >
// //                 Submit Exam
// //             </button>
// //         </div>
// //     );
// // }