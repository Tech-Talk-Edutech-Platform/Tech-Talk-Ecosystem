import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function StudentAssignmentManager() {
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentDetails, setStudentDetails] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);

    // Fetch tutors
    const { data: tutorsData, error: tutorsError } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "tutor")
      .eq("is_active", true);

    if (tutorsError) {
      console.error("Error fetching tutors:", tutorsError);
    } else {
      setTutors(tutorsData);
    }

    // Fetch students
    const { data: studentsData, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .order("full_name", { ascending: true });

    if (studentsError) {
      console.error("Error fetching students:", studentsError);
    } else {
      setStudents(studentsData);
    }

    setLoading(false);
  }

  async function handleAssign(studentId, tutorId) {
    const { error } = await supabase
      .from("students")
      .update({ assigned_tutor_id: tutorId || null })
      .eq("id", studentId);

    if (!error) fetchData();
  }

  async function handleStudentClick(studentId) {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
      return;
    }

    // Fetch full details of the student
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (error) {
      console.error("Error fetching student details:", error);
      return;
    }

    setStudentDetails(data);
    setExpandedStudentId(studentId);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">
        Student Tutor Assignments
      </h2>

      <div className="space-y-4">
        {students.map((student) => {
          const assignedTutor = tutors.find(
            (t) => t.id === student.assigned_tutor_id
          );

          return (
            <div key={student.id} className="border rounded-xl">
              {/* Main Row */}
              <div className="flex items-center justify-between p-4 cursor-pointer">
                <span
                  className="font-medium text-blue-600 hover:underline"
                  onClick={() => handleStudentClick(student.id)}
                >
                  {student.full_name}
                </span>

                <select
                  className="border rounded-lg px-3 py-2"
                  value={student.assigned_tutor_id || ""}
                  onChange={(e) =>
                    handleAssign(student.id, e.target.value)
                  }
                >
                  <option value="">Unassigned</option>
                  {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                      {tutor.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expanded Student Details */}
              {expandedStudentId === student.id && studentDetails && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl space-y-2">
                  <p><strong>Full Name:</strong> {studentDetails.full_name}</p>
                  <p><strong>Parent:</strong> {studentDetails.parent_name}</p>
                  <p><strong>Phone:</strong> {studentDetails.parent_phone}</p>
                  <p><strong>Grade:</strong> {studentDetails.grade || "-"}</p>
                  <p>
                    <strong>Assigned Tutor:</strong>{" "}
                    {assignedTutor ? assignedTutor.full_name : "Unassigned"}
                  </p>
                  <p><strong>Progress:</strong> {studentDetails.progress || 0}%</p>
                  <p><strong>Created At:</strong> {new Date(studentDetails.created_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}