import { useState } from "react";
import { supabase } from "../../supabase";

export default function CreateExam() {
    const [title, setTitle] = useState("");
    const [duration, setDuration] = useState(60);
    const [questions, setQuestions] = useState([]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                id: Date.now().toString(),
                type: "mcq",
                question: "",
                options: ["", "", "", ""],
                correct_answer: "",
                marks: 5
            }
        ]);
    };

    const saveExam = async () => {
        const examId = Date.now().toString();

        await supabase.from("exams").insert({
            id: examId,
            title,
            duration_minutes: duration
        });

        for (let q of questions) {
            await supabase.from("questions").insert({
                ...q,
                exam_id: examId
            });
        }

        alert("Exam created!");
    };

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Create Exam</h1>

            <input
                placeholder="Exam Title"
                className="border p-2 w-full mb-2"
                onChange={e => setTitle(e.target.value)}
            />

            <input
                type="number"
                placeholder="Duration (mins)"
                className="border p-2 w-full mb-4"
                onChange={e => setDuration(e.target.value)}
            />

            <button
                onClick={addQuestion}
                className="bg-green-600 text-white px-4 py-2 mb-4"
            >
                + Add Question
            </button>

            {questions.map((q, i) => (
                <div key={q.id} className="border p-4 mb-4">
                    <input
                        placeholder="Question"
                        className="border p-2 w-full mb-2"
                        onChange={e => {
                            q.question = e.target.value;
                            setQuestions([...questions]);
                        }}
                    />

                    {q.options.map((opt, idx) => (
                        <input
                            key={idx}
                            placeholder={`Option ${idx + 1}`}
                            className="border p-2 w-full mb-1"
                            onChange={e => {
                                q.options[idx] = e.target.value;
                                setQuestions([...questions]);
                            }}
                        />
                    ))}

                    <input
                        placeholder="Correct Answer"
                        className="border p-2 w-full"
                        onChange={e => {
                            q.correct_answer = e.target.value;
                            setQuestions([...questions]);
                        }}
                    />
                </div>
            ))}

            <button
                onClick={saveExam}
                className="bg-blue-600 text-white px-6 py-2"
            >
                Save Exam
            </button>
        </div>
    );
}