import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../supabase';
import {
  User,
  Calendar,
  BookOpen,
  Code,
  Monitor,
  Lightbulb,
  Star,
  MessageSquare,
  Rocket,
  ExternalLink,
  Camera,
  Activity,
  Award,
  ChevronDown,
  ChevronUp,
  History,
  X,
  HelpCircle,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Printer,
  Trophy
} from 'lucide-react';

const StudentDashboard = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [exams, setExams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [badges, setBadges] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const [selectedExamForPrompt, setSelectedExamForPrompt] = useState(null);
  const [activeDetailedExam, setActiveDetailedExam] = useState(null);

  useEffect(() => {
    fetchCompleteStudentMatrix();
  }, [slug]);

  async function fetchCompleteStudentMatrix() {
    if (!slug) return;
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('student_results')
        .select('*')
        .eq('slug', slug)
        .single();

      if (profileErr) throw profileErr;
      setData(profileData);

      if (profileData) {
        // Fetch exams
        const { data: examData } = await supabase
          .from('student_exams')
          .select('*')
          .eq('student_id', profileData.id)
          .order('exam_date', { ascending: false });
        setExams(examData || []);

        // Fetch projects
        const { data: projectData } = await supabase
          .from('student_projects')
          .select('*')
          .eq('student_id', profileData.id)
          .order('created_at', { ascending: false });
        setProjects(projectData || []);

        // Fetch unlocked milestones/badges
        const { data: badgeData } = await supabase
          .from('student_badges')
          .select('*')
          .eq('student_id', profileData.id)
          .order('unlocked_at', { ascending: false });
        setBadges(badgeData || []);
      }
    } catch (err) {
      console.error("Data Matrix load failure:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAvatarChange = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file || !data?.id) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${data.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('student-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('student_results')
        .update({ avatar_url: publicUrl })
        .eq('id', data.id);

      if (updateError) throw updateError;

      setData({ ...data, avatar_url: publicUrl });
      alert("Profile picture updated!");
    } catch (err) {
      alert("Upload error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleShareDashboard = async () => {
    const shareData = {
      title: `${data.student_name}'s Coding Dashboard`,
      text: `Check out ${data.student_name}'s latest projects and coding milestones at Tech Talk Hub!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Dashboard link copied to clipboard for easy sharing!');
      }
    } catch (err) {
      console.log('Sharing canceled or failed', err);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
  if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

  const totalAllocated = data.total_classes_allocated || 12;
  const attended = data.classes_attended || 0;
  const remainingClasses = totalAllocated - attended;

  const milestoneTarget = totalAllocated;
  const rawProgressPercent = Math.min(100, Math.round((attended / milestoneTarget) * 100));

  const latestProject = projects[0] || (data.project_url ? { project_title: "Active Core Project", project_url: data.project_url } : null);
  const archivedProjects = projects.slice(1);

  const latestExam = exams[0];
  const historicalExams = exams.slice(1);

  const cumulativeAverage = exams.length > 0 
    ? Math.round(exams.reduce((sum, ex) => sum + ex.overall_score, 0) / exams.length)
    : (data.overall_score || 0);

  const triggerExamPrompt = (exam) => {
    setSelectedExamForPrompt(exam);
  };

  const handleConfirmViewQuestions = () => {
    setActiveDetailedExam(selectedExamForPrompt);
    setSelectedExamForPrompt(null);
  };

  /* ================= DETAILED QUESTIONS & ANSWERS VIEW ================= */
  if (activeDetailedExam) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl print:bg-white print:shadow-none">
        <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveDetailedExam(null)} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-600">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-extrabold text-gray-800 text-sm truncate max-w-[200px]">{activeDetailedExam.exam_title}</h1>
              <p className="text-[10px] text-gray-400 font-medium">Questions & Answers Ledger</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="p-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200">
            <Printer size={14} /> Print
          </button>
        </div>

        {/* PINNED EXAM SPECIFIC TUTOR FEEDBACK */}
        <div className="p-4">
          <div className="bg-indigo-600 p-5 rounded-2xl shadow-md text-white">
            <div className="flex gap-2 items-center font-bold mb-2 text-xs uppercase tracking-wider">
              <MessageSquare size={16} /> Exam Specific Tutor Feedback
            </div>
            {/* whitespace-pre-line honors enter key lines precisely */}
            <p className="text-sm text-indigo-50 italic leading-relaxed font-medium whitespace-pre-line">
              "{activeDetailedExam.tutor_feedback || "No specific feedback logged for this specific exam cycle yet."}"
            </p>
          </div>
        </div>

        <div className="px-4 mb-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Overall Metric</span>
              <p className="text-xs text-gray-500 font-medium">{new Date(activeDetailedExam.exam_date).toDateString()}</p>
            </div>
            <div className="text-2xl font-black text-green-500">{activeDetailedExam.overall_score}%</div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide px-1 flex items-center gap-1">
            <HelpCircle size={14} className="text-indigo-500" /> Reviewed Curriculum Items
          </h2>
          
          {activeDetailedExam.questions_and_answers && activeDetailedExam.questions_and_answers.length > 0 ? (
            activeDetailedExam.questions_and_answers.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 break-inside-avoid">
                <div className="flex gap-2 items-start">
                  <span className="bg-indigo-50 text-indigo-600 font-bold text-xs px-2 py-0.5 rounded-md mt-0.5">Q{idx + 1}</span>
                  <p className="text-sm font-bold text-gray-800 leading-snug">{item.question}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Student Submission</span>
                  <p className="text-xs font-semibold text-gray-700">{item.student_answer || "No response provided."}</p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/70 space-y-1">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">Correct Reference Matrix</span>
                  <p className="text-xs font-bold text-emerald-800">{item.correct_answer}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-400 font-medium shadow-sm">
              No digital structural breakdown arrays logged for this sheet.
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= MAIN DASHBOARD VIEW ================= */
  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl relative print:bg-white print:shadow-none">

      {/* 1. HEADER SECTION */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <button onClick={handleShareDashboard} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-indigo-100 transition ml-auto">
            <Share2 size={14} /> Share Report
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
              {data.avatar_url && data.avatar_url.trim() !== "" ? (
                <img
                  key={data.avatar_url}
                  src={`${data.avatar_url}?t=${new Date().getTime()}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = ""; }}
                />
              ) : (
                <User size={40} className="text-indigo-500" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform print:hidden">
              <Camera size={14} />
              <input type="file" className="hidden" onChange={handleAvatarChange} disabled={uploading} accept="image/*" />
            </label>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
            <p className="text-sm text-indigo-600 font-semibold">Grade {data.grade_level} • {data.course_name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Active Student</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC MILESTONE TRACKER */}
      <div className="p-4 pb-0">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={12} className="text-indigo-500" /> Milestone Path
            </span>
            <span className="text-xs font-black text-indigo-600">{rawProgressPercent}% Finished</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${rawProgressPercent}%` }}></div>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {remainingClasses > 0 ? `${remainingClasses} more classes until next core certification boundary.` : 'Course phase milestone achieved!'}
          </p>
        </div>
      </div>

      {/* 3. SUBSCRIPTION TRACKER PANEL */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <Activity size={14} className="text-indigo-500" /> Subscription Balance
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 block font-medium">Allocated</span>
              <span className="text-lg font-black text-slate-800">{totalAllocated}</span>
            </div>
            <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-600 block font-semibold">Attended</span>
              <span className="text-lg font-black text-emerald-700">{attended}</span>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
              <span className="text-xs text-indigo-600 block font-semibold">Remaining</span>
              <span className="text-lg font-black text-indigo-700">{remainingClasses}</span>
            </div>
          </div>
        </div>
      </div>
      

      {/* 4. UNLOCKED ACHIEVEMENTS & BADGES RACK */}
      {badges.length > 0 && (
        <div className="px-4 mb-2">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-amber-500" /> Earned Skill Badges
            </h2>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                  <span className="text-base">{badge.badge_icon || '🏆'}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-none">{badge.badge_title}</p>
                    <p className="text-[8px] text-gray-400 mt-0.5 uppercase tracking-tighter">{badge.badge_criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. TODAY'S LESSON SUMMARY */}
      <div className="px-4 mb-2">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
            <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Today's Class Summary</h2>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">
            {data.today_summary || "No specific recap compiled for today's curriculum milestone yet."}
          </p>
        </div>
      </div>

      {/* 6. PROJECT SHOWCASE */}
      {latestProject && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
            <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
              <Rocket size={18} className="animate-bounce" /> Student Project
            </div>
            <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
            <a href={latestProject.project_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all print:hidden">
              Launch Project <ExternalLink size={18} />
            </a>

            {archivedProjects.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/20 print:hidden">
                <button onClick={() => setShowAllProjects(!showAllProjects)} className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-orange-100 hover:text-white transition">
                  <span>View All Projects ({projects.length})</span>
                  {showAllProjects ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showAllProjects && (
                  <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                    {archivedProjects.map((proj) => (
                      <a key={proj.id} href={proj.project_url} target="_blank" rel="noreferrer" className="flex justify-between items-center bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-xs font-semibold transition">
                        <span className="truncate max-w-[200px]">{proj.project_title}</span>
                        <ExternalLink size={12} className="opacity-80 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. OVERALL PERFORMANCE */}
      <div className="p-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
          <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1 flex items-center gap-1.5">
            <Award size={15} className="text-green-500" /> Overall Performance
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full flex-shrink-0">
              <div className="text-center">
                <span className="text-2xl font-black text-gray-800">{cumulativeAverage}%</span>
                <p className="text-[8px] text-green-500 font-bold uppercase">{data.performance_label || 'Average'}</p>
              </div>
            </div>
            <p className="flex-1 text-sm text-gray-600 leading-tight">
              <span className="font-bold text-gray-800">{data.performance_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is demonstrating structural mastery across standard metrics.
            </p>
          </div>
        </div>
      </div>

      {/* 8. LATEST EXAM CARD */}
      <div className="px-4 mb-2">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 px-1">Latest Exam Result</h2>
        <div onClick={() => triggerExamPrompt(latestExam || data)} className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500 cursor-pointer hover:bg-slate-50 transition active:scale-[0.99]">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600"><Code size={20} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight">
                  {latestExam ? latestExam.exam_title : (data.exam_title || "Initial Setup Profile")}
                </h3>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
                  <Calendar size={12} /> {latestExam?.exam_date ? new Date(latestExam.exam_date).toDateString() : 'Recent'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-green-500">{latestExam ? latestExam.overall_score : data.overall_score}%</div>
              <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-tighter mt-1 print:hidden">View Q&A →</p>
            </div>
          </div>
        </div>
      </div>

      {/* 9. SKILL BREAKDOWN */}
      <div className="p-4">
        <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
        <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
          <StatRow label="Theory" score={latestExam ? latestExam.theory_score : data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
          <StatRow label="Practical" score={latestExam ? latestExam.practical_score : data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
          <StatRow label="Logic" score={latestExam ? latestExam.problem_solving_score : data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
          <StatRow label="Creative" score={latestExam ? latestExam.creativity_score : data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
        </div>
      </div>

      {/* 10. HISTORICAL EXAMS LEDGER */}
      {historicalExams.length > 0 && (
        <div className="px-4 mb-4 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1"><History size={10} /> Previous Grading Records</p>
          {historicalExams.map((ex) => (
            <div key={ex.id} onClick={() => triggerExamPrompt(ex)} className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center opacity-85 hover:opacity-100 cursor-pointer transition">
              <div>
                <h4 className="font-bold text-gray-700 text-xs">{ex.exam_title}</h4>
                <span className="text-[9px] text-gray-400 font-medium block">{new Date(ex.exam_date).toLocaleDateString()}</span>
              </div>
              <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{ex.overall_score}%</span>
            </div>
          ))}
        </div>
      )}
      {/* 10. BEAUTIFIED EXAMS LEDGER */}
<div className="px-4 mb-4">
  <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide mb-3 px-1 flex items-center gap-1.5">
    <History size={15} className="text-indigo-500" /> All Exam Results
  </h2>
  <div className="space-y-3">
    {exams.map((ex) => (
      <div 
        key={ex.id} 
        onClick={() => triggerExamPrompt(ex)} 
        className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <BookOpen size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-xs">{ex.exam_title}</h4>
            <p className="text-[10px] text-gray-400 font-medium">{new Date(ex.exam_date).toDateString()}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-emerald-600 block">{ex.overall_score}%</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase">Score</span>
        </div>
      </div>
    ))}
  </div>
</div>

      {/* 11. GLOBAL TUTOR FEEDBACK */}
      <div className="px-4">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl shadow-xl border border-indigo-500/20 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex gap-2.5 items-center font-bold mb-3.5 text-xs uppercase tracking-widest text-indigo-300">
            <MessageSquare size={16} className="text-indigo-400" /> 
            <span>Instructor Feedback Notes</span>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 shadow-inner">
            {/* Added whitespace-pre-line to render user paragraph wraps/breaks perfectly */}
            <p className="text-sm text-slate-100 italic leading-relaxed font-medium tracking-tight whitespace-pre-line">
              "{data.tutor_feedback || "No structural feedback summary compiled for this phase yet."}"
            </p>
          </div>
          
          <div className="mt-4 pt-3.5 border-t border-white/5 text-[9px] font-bold uppercase tracking-wider text-indigo-300/70 flex justify-between items-center">
            <span>Verified Academic Snaplog</span>
            <span className="bg-indigo-500/20 px-2 py-0.5 rounded-md text-indigo-200 border border-indigo-400/20">
              Tech Talk Hub
            </span>
          </div>
        </div>
      </div>

      {/* ================= CONFIRMATION MODAL ================= */}
      {selectedExamForPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto"><HelpCircle size={24} /></div>
            <div>
              <h3 className="text-base font-extrabold text-gray-800">Review Exam Sheet?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Are you sure you want to view the questions and reference answers for <span className="font-bold text-gray-700">"{selectedExamForPrompt.exam_title}"</span>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setSelectedExamForPrompt(null)} className="py-2.5 px-4 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl">Cancel</button>
              <button onClick={handleConfirmViewQuestions} className="py-2.5 px-4 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">OK, Show Me</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatRow = ({ label, score, icon, color }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
        <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
      </div>
      <div className="text-xs font-black text-gray-800">{score || 0}%</div>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className="bg-green-500 h-full rounded-full" style={{ width: `${score || 0}%` }}></div>
    </div>
  </div>
);

export default StudentDashboard;
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { supabase } from '../supabase';
// import {
//   User,
//   Calendar,
//   BookOpen,
//   Code,
//   Monitor,
//   Lightbulb,
//   Star,
//   MessageSquare,
//   Rocket,
//   ExternalLink,
//   Camera,
//   Activity,
//   Award,
//   ChevronDown,
//   ChevronUp,
//   History,
//   X,
//   HelpCircle,
//   ArrowLeft
// } from 'lucide-react';

// const StudentDashboard = () => {
//   const { slug } = useParams();
//   const [data, setData] = useState(null);
//   const [exams, setExams] = useState([]);
//   const [projects, setProjects] = useState([]);
  
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState(false);
//   const [showAllProjects, setShowAllProjects] = useState(false);

//   // Modal and Details state management
//   const [selectedExamForPrompt, setSelectedExamForPrompt] = useState(null);
//   const [activeDetailedExam, setActiveDetailedExam] = useState(null);

//   useEffect(() => {
//     fetchCompleteStudentMatrix();
//   }, [slug]);

//   async function fetchCompleteStudentMatrix() {
//     if (!slug) return;
//     try {
//       const { data: profileData, error: profileErr } = await supabase
//         .from('student_results')
//         .select('*')
//         .eq('slug', slug)
//         .single();

//       if (profileErr) throw profileErr;
//       setData(profileData);

//       if (profileData) {
//         const { data: examData } = await supabase
//           .from('student_exams')
//           .select('*')
//           .eq('student_id', profileData.id)
//           .order('exam_date', { ascending: false });
        
//         setExams(examData || []);

//         const { data: projectData } = await supabase
//           .from('student_projects')
//           .select('*')
//           .eq('student_id', profileData.id)
//           .order('created_at', { ascending: false });

//         setProjects(projectData || []);
//       }
//     } catch (err) {
//       console.error("Data Matrix load failure:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleAvatarChange = async (e) => {
//     try {
//       setUploading(true);
//       const file = e.target.files[0];
//       if (!file || !data?.id) return;

//       const fileExt = file.name.split('.').pop();
//       const fileName = `${data.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
//       const filePath = `avatars/${fileName}`;

//       let { error: uploadError } = await supabase.storage
//         .from('student-assets')
//         .upload(filePath, file);

//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('student-assets')
//         .getPublicUrl(filePath);

//       const { error: updateError } = await supabase
//         .from('student_results')
//         .update({ avatar_url: publicUrl })
//         .eq('id', data.id);

//       if (updateError) throw updateError;

//       setData({ ...data, avatar_url: publicUrl });
//       alert("Profile picture updated!");
//     } catch (err) {
//       alert("Upload error: " + err.message);
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
//   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

//   const totalAllocated = data.total_classes_allocated || 12;
//   const attended = data.classes_attended || 0;
//   const remainingClasses = totalAllocated - attended;

//   const latestProject = projects[0] || (data.project_url ? { project_title: "Active Core Project", project_url: data.project_url } : null);
//   const archivedProjects = projects.slice(1);

//   const latestExam = exams[0];
//   const historicalExams = exams.slice(1);

//   const cumulativeAverage = exams.length > 0 
//     ? Math.round(exams.reduce((sum, ex) => sum + ex.overall_score, 0) / exams.length)
//     : (data.overall_score || 0);

//   // Action to trigger confirmation prompt
//   const triggerExamPrompt = (exam) => {
//     setSelectedExamForPrompt(exam);
//   };

//   // Action when user selects "OK" on confirmation
//   const handleConfirmViewQuestions = () => {
//     setActiveDetailedExam(selectedExamForPrompt);
//     setSelectedExamForPrompt(null);
//   };

//   /* ================= DETAILED QUESTIONS & ANSWERS VIEW ================= */
//   if (activeDetailedExam) {
//     return (
//       <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">
//         {/* Navigation Header */}
//         <div className="bg-white p-4 border-b border-gray-100 sticky top-0 z-10 flex items-center gap-3">
//           <button 
//             onClick={() => setActiveDetailedExam(null)}
//             className="p-1 hover:bg-gray-100 rounded-full transition text-gray-600"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div>
//             <h1 className="font-extrabold text-gray-800 text-sm truncate max-w-[280px]">
//               {activeDetailedExam.exam_title}
//             </h1>
//             <p className="text-[10px] text-gray-400 font-medium">
//               Questions & Answers Ledger
//             </p>
//           </div>
//         </div>

//         {/* TUTOR FEEDBACK PINNED AT THE VERY TOP */}
//         <div className="p-4">
//           <div className="bg-indigo-600 p-5 rounded-2xl shadow-md text-white">
//             <div className="flex gap-2 items-center font-bold mb-2 text-xs uppercase tracking-wider">
//               <MessageSquare size={16} /> Exam Specific Tutor Feedback
//             </div>
//             <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">
//               "{activeDetailedExam.tutor_feedback || "No specific feedback logged for this specific exam cycle yet."}"
//             </p>
//           </div>
//         </div>

//         {/* Performance Overview Snapshot */}
//         <div className="px-4 mb-4">
//           <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
//             <div>
//               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Overall Metric</span>
//               <p className="text-xs text-gray-500 font-medium">{new Date(activeDetailedExam.exam_date).toDateString()}</p>
//             </div>
//             <div className="text-2xl font-black text-green-500">{activeDetailedExam.overall_score}%</div>
//           </div>
//         </div>

//         {/* Questions & Answers Loop */}
//         <div className="px-4 space-y-4">
//           <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide px-1 flex items-center gap-1">
//             <HelpCircle size={14} className="text-indigo-500" /> Reviewed Curriculum Items
//           </h2>
          
//           {activeDetailedExam.questions_and_answers && activeDetailedExam.questions_and_answers.length > 0 ? (
//             activeDetailedExam.questions_and_answers.map((item, idx) => (
//               <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
//                 <div className="flex gap-2 items-start">
//                   <span className="bg-indigo-50 text-indigo-600 font-bold text-xs px-2 py-0.5 rounded-md mt-0.5">
//                     Q{idx + 1}
//                   </span>
//                   <p className="text-sm font-bold text-gray-800 leading-snug">{item.question}</p>
//                 </div>
                
//                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
//                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Student Submission</span>
//                   <p className="text-xs font-semibold text-gray-700">{item.student_answer || "No response provided."}</p>
//                 </div>

//                 <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/70 space-y-1">
//                   <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">Correct Reference Matrix</span>
//                   <p className="text-xs font-bold text-emerald-800">{item.correct_answer}</p>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-xs text-gray-400 font-medium shadow-sm">
//               No digital structural breakdown arrays logged for this sheet.
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }

//   /* ================= MAIN DASHBOARD VIEW ================= */
//   return (
//     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl relative">

//       {/* 1. HEADER SECTION */}
//       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
//         <div className="flex items-center gap-4">
//           <div className="relative group">
//             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
//               {data.avatar_url && data.avatar_url.trim() !== "" ? (
//                 <img
//                   key={data.avatar_url}
//                   src={`${data.avatar_url}?t=${new Date().getTime()}`}
//                   alt="Profile"
//                   className="w-full h-full object-cover"
//                   onError={(e) => {
//                     console.error("Image failed to load");
//                     e.target.src = "";
//                   }}
//                 />
//               ) : (
//                 <User size={40} className="text-indigo-500" />
//               )}
//             </div>
//             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
//               <Camera size={14} />
//               <input type="file" className="hidden" onChange={handleAvatarChange} disabled={uploading} accept="image/*" />
//             </label>
//           </div>
//           <div className="flex-1">
//             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
//             <p className="text-sm text-indigo-600 font-semibold">Grade {data.grade_level} • {data.course_name}</p>
//             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Active Student</span>
//           </div>
//         </div>
//       </div>

//       {/* 2. SUBSCRIPTION TRACKER PANEL */}
//       <div className="p-4">
//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
//           <div className="flex justify-between items-center mb-3">
//             <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
//               <Activity size={14} className="text-indigo-500" /> Subscription Balance
//             </h2>
//             <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 uppercase">
//               Cycle Status
//             </span>
//           </div>
//           <div className="grid grid-cols-3 gap-2 text-center">
//             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
//               <span className="text-xs text-slate-400 block font-medium">Allocated</span>
//               <span className="text-lg font-black text-slate-800">{totalAllocated}</span>
//             </div>
//             <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
//               <span className="text-xs text-emerald-600 block font-semibold">Attended</span>
//               <span className="text-lg font-black text-emerald-700">{attended}</span>
//             </div>
//             <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
//               <span className="text-xs text-indigo-600 block font-semibold">Remaining</span>
//               <span className="text-lg font-black text-indigo-700">{remainingClasses}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 3. TODAY'S LESSON SUMMARY */}
//       <div className="px-4 mb-2">
//         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
//           <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
//             <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
//               <BookOpen size={16} />
//             </div>
//             <div>
//               <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Today's Class Summary</h2>
//               <p className="text-[9px] text-gray-400 font-medium font-mono">LATEST UPDATE LOG</p>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 leading-relaxed font-medium">
//             {data.today_summary || "No specific recap compiled for today's curriculum milestone yet."}
//           </p>
//         </div>
//       </div>

//       {/* 4. PROJECT SHOWCASE */}
//       {latestProject && (
//         <div className="p-4">
//           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
//             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
//               <Rocket size={18} className="animate-bounce" /> Student Project
//             </div>
//             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
//             <a href={latestProject.project_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all">
//               Launch Project <ExternalLink size={18} />
//             </a>

//             {/* EXPANDABLE WORK LEDGER */}
//             {archivedProjects.length > 0 && (
//               <div className="mt-4 pt-3 border-t border-white/20">
//                 <button 
//                   onClick={() => setShowAllProjects(!showAllProjects)} 
//                   className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-orange-100 hover:text-white transition"
//                 >
//                   <span>View All Projects ({projects.length})</span>
//                   {showAllProjects ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                 </button>

//                 {showAllProjects && (
//                   <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
//                     {archivedProjects.map((proj) => (
//                       <a key={proj.id} href={proj.project_url} target="_blank" rel="noreferrer" className="flex justify-between items-center bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-xs font-semibold transition">
//                         <span className="truncate max-w-[200px]">{proj.project_title}</span>
//                         <ExternalLink size={12} className="opacity-80 flex-shrink-0" />
//                       </a>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* 5. OVERALL PERFORMANCE CIRCLE */}
//       <div className="p-4">
//         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
//           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1 flex items-center gap-1.5">
//             <Award size={15} className="text-green-500" /> Overall Performance
//           </h2>
//           <div className="flex items-center gap-6">
//             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full flex-shrink-0">
//               <div className="text-center">
//                 <span className="text-2xl font-black text-gray-800">{cumulativeAverage}%</span>
//                 <p className="text-[8px] text-green-500 font-bold uppercase">{data.performance_label || 'Average'}</p>
//               </div>
//             </div>
//             <p className="flex-1 text-sm text-gray-600 leading-tight">
//               <span className="font-bold text-gray-800">{data.performance_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is demonstrating structural mastery across standard metrics.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* 6. LATEST EXAM CARD (CLICKABLE) */}
//       <div className="px-4 mb-2">
//         <div className="flex justify-between items-center mb-3 px-1">
//           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Latest Exam Result</h2>
//         </div>
        
//         <div 
//           onClick={() => triggerExamPrompt(latestExam || data)}
//           className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500 cursor-pointer hover:bg-slate-50 transition active:scale-[0.99]"
//         >
//           <div className="flex justify-between items-start">
//             <div className="flex gap-3">
//               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
//                 <Code size={20} />
//               </div>
//               <div>
//                 <h3 className="font-bold text-gray-800 text-sm leading-tight">
//                   {latestExam ? latestExam.exam_title : (data.exam_title || "Initial Setup Profile")}
//                 </h3>
//                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
//                   <Calendar size={12} /> {latestExam?.exam_date ? new Date(latestExam.exam_date).toDateString() : 'Recent'}
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-xl font-black text-green-500">
//                 {latestExam ? latestExam.overall_score : data.overall_score}%
//               </div>
//               <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-tighter mt-1 hover:underline">View Q&A →</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* 7. SKILL BREAKDOWN */}
//       <div className="p-4">
//         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
//         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
//           <StatRow label="Theory" score={latestExam ? latestExam.theory_score : data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
//           <StatRow label="Practical" score={latestExam ? latestExam.practical_score : data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
//           <StatRow label="Logic" score={latestExam ? latestExam.problem_solving_score : data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
//           <StatRow label="Creative" score={latestExam ? latestExam.creativity_score : data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
//         </div>
//       </div>

//       {/* HISTORICAL EXAMS LEDGER FEED STACK (CLICKABLE) */}
//       {historicalExams.length > 0 && (
//         <div className="px-4 mb-4 space-y-2">
//           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
//             <History size={10} /> Previous Grading Records
//           </p>
//           {historicalExams.map((ex) => (
//             <div 
//               key={ex.id} 
//               onClick={() => triggerExamPrompt(ex)}
//               className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center opacity-85 hover:opacity-100 cursor-pointer transition"
//             >
//               <div>
//                 <h4 className="font-bold text-gray-700 text-xs">{ex.exam_title}</h4>
//                 <span className="text-[9px] text-gray-400 font-medium block">{new Date(ex.exam_date).toLocaleDateString()}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{ex.overall_score}%</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* 8. LATEST GLOBAL TUTOR FEEDBACK */}
//       <div className="px-4">
//         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
//           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
//             <MessageSquare size={18} /> Tutor Feedback
//           </div>
//           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
//           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
//             <span>By Tech Talk Hub</span>
//             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
//           </div>
//         </div>
//       </div>

//       {/* ================= CONFIRMATION MODAL POPUP ================= */}
//       {selectedExamForPrompt && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
//           <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-4">
//             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
//               <HelpCircle size={24} />
//             </div>
//             <div>
//               <h3 className="text-base font-extrabold text-gray-800">Review Exam Sheet?</h3>
//               <p className="text-xs text-gray-500 mt-1 leading-relaxed">
//                 Are you sure you want to view the questions and reference answers for <span className="font-bold text-gray-700">"{selectedExamForPrompt.exam_title || "this sheet"}"</span>?
//               </p>
//             </div>
//             <div className="grid grid-cols-2 gap-3 pt-2">
//               <button
//                 onClick={() => setSelectedExamForPrompt(null)}
//                 className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition active:scale-95"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmViewQuestions}
//                 className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-200 active:scale-95"
//               >
//                 OK, Show Me
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const StatRow = ({ label, score, icon, color }) => (
//   <div>
//     <div className="flex justify-between items-center mb-1">
//       <div className="flex items-center gap-2">
//         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
//         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
//       </div>
//       <div className="text-xs font-black text-gray-800">{score || 0}%</div>
//     </div>
//     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
//       <div
//         className="bg-green-500 h-full rounded-full transition-all duration-1000"
//         style={{ width: `${score || 0}%` }}
//       ></div>
//     </div>
//   </div>
// );

// export default StudentDashboard;
// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom';
// // import { supabase } from '../supabase';
// // import {
// //   User,
// //   Calendar,
// //   BookOpen,
// //   Code,
// //   Monitor,
// //   Lightbulb,
// //   Star,
// //   MessageSquare,
// //   Rocket,
// //   ExternalLink,
// //   Camera,
// //   Activity,
// //   Award,
// //   ChevronDown,
// //   ChevronUp,
// //   History
// // } from 'lucide-react';

// // const StudentDashboard = () => {
// //   const { slug } = useParams();
// //   const [data, setData] = useState(null); // Keeps your original 'data' state naming
// //   const [exams, setExams] = useState([]);
// //   const [projects, setProjects] = useState([]);
  
// //   const [loading, setLoading] = useState(true);
// //   const [uploading, setUploading] = useState(false);
// //   const [showAllProjects, setShowAllProjects] = useState(false);

// //   useEffect(() => {
// //     fetchCompleteStudentMatrix();
// //   }, [slug]);

// //   async function fetchCompleteStudentMatrix() {
// //     if (!slug) return;
// //     try {
// //       // 1. Fetch core student meta profile
// //       const { data: profileData, error: profileErr } = await supabase
// //         .from('student_results')
// //         .select('*')
// //         .eq('slug', slug)
// //         .single();

// //       if (profileErr) throw profileErr;
// //       setData(profileData);

// //       if (profileData) {
// //         // 2. Fetch all historical exams ordered by latest date
// //         const { data: examData } = await supabase
// //           .from('student_exams')
// //           .select('*')
// //           .eq('student_id', profileData.id)
// //           .order('exam_date', { ascending: false });
        
// //         setExams(examData || []);

// //         // 3. Fetch all historical projects ordered by latest entry
// //         const { data: projectData } = await supabase
// //           .from('student_projects')
// //           .select('*')
// //           .eq('student_id', profileData.id)
// //           .order('created_at', { ascending: false });

// //         setProjects(projectData || []);
// //       }
// //     } catch (err) {
// //       console.error("Data Matrix load failure:", err.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   const handleAvatarChange = async (e) => {
// //     try {
// //       setUploading(true);
// //       const file = e.target.files[0];
// //       if (!file || !data?.id) return;

// //       const fileExt = file.name.split('.').pop();
// //       const fileName = `${data.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
// //       const filePath = `avatars/${fileName}`;

// //       let { error: uploadError } = await supabase.storage
// //         .from('student-assets')
// //         .upload(filePath, file);

// //       if (uploadError) throw uploadError;

// //       const { data: { publicUrl } } = supabase.storage
// //         .from('student-assets')
// //         .getPublicUrl(filePath);

// //       const { error: updateError } = await supabase
// //         .from('student_results')
// //         .update({ avatar_url: publicUrl })
// //         .eq('id', data.id);

// //       if (updateError) throw updateError;

// //       setData({ ...data, avatar_url: publicUrl });
// //       alert("Profile picture updated!");
// //     } catch (err) {
// //       alert("Upload error: " + err.message);
// //     } finally {
// //       setUploading(false);
// //     }
// //   };

// //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// //   // Safe calculated fallbacks for subscription calculations
// //   const totalAllocated = data.total_classes_allocated || 12;
// //   const attended = data.classes_attended || 0;
// //   const remainingClasses = totalAllocated - attended;

// //   // Split project logic: today's work vs previous submissions
// //   const latestProject = projects[0] || (data.project_url ? { project_title: "Active Core Project", project_url: data.project_url } : null);
// //   const archivedProjects = projects.slice(1);

// //   // Split exam logic: latest vs history stack
// //   const latestExam = exams[0];
// //   const historicalExams = exams.slice(1);

// //   // DYNAMIC MATH CALCULATION: Compiles exact mathematical mean average of all historical records
// //   const cumulativeAverage = exams.length > 0 
// //     ? Math.round(exams.reduce((sum, ex) => sum + ex.overall_score, 0) / exams.length)
// //     : (data.overall_score || 0);

// //   return (
// //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// //       {/* 1. HEADER SECTION */}
// //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// //         <div className="flex items-center gap-4">
// //           <div className="relative group">
// //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// //               {data.avatar_url && data.avatar_url.trim() !== "" ? (
// //                 <img
// //                   key={data.avatar_url}
// //                   src={`${data.avatar_url}?t=${new Date().getTime()}`}
// //                   alt="Profile"
// //                   className="w-full h-full object-cover"
// //                   onError={(e) => {
// //                     console.error("Image failed to load");
// //                     e.target.src = "";
// //                   }}
// //                 />
// //               ) : (
// //                 <User size={40} className="text-indigo-500" />
// //               )}
// //             </div>
// //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// //               <Camera size={14} />
// //               <input type="file" className="hidden" onChange={handleAvatarChange} disabled={uploading} accept="image/*" />
// //             </label>
// //           </div>
// //           <div className="flex-1">
// //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// //             <p className="text-sm text-indigo-600 font-semibold">Grade {data.grade_level} • {data.course_name}</p>
// //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">Active Student</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 2. SUBSCRIPTION TRACKER PANEL */}
// //       <div className="p-4">
// //         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
// //           <div className="flex justify-between items-center mb-3">
// //             <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
// //               <Activity size={14} className="text-indigo-500" /> Subscription Balance
// //             </h2>
// //             <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 uppercase">
// //               Cycle Status
// //             </span>
// //           </div>
// //           <div className="grid grid-cols-3 gap-2 text-center">
// //             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
// //               <span className="text-xs text-slate-400 block font-medium">Allocated</span>
// //               <span className="text-lg font-black text-slate-800">{totalAllocated}</span>
// //             </div>
// //             <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
// //               <span className="text-xs text-emerald-600 block font-semibold">Attended</span>
// //               <span className="text-lg font-black text-emerald-700">{attended}</span>
// //             </div>
// //             <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
// //               <span className="text-xs text-indigo-600 block font-semibold">Remaining</span>
// //               <span className="text-lg font-black text-indigo-700">{remainingClasses}</span>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 3. TODAY'S LESSON SUMMARY */}
// //       <div className="px-4 mb-2">
// //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
// //           <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
// //             <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
// //               <BookOpen size={16} />
// //             </div>
// //             <div>
// //               <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Today's Class Summary</h2>
// //               <p className="text-[9px] text-gray-400 font-medium font-mono">LATEST UPDATE LOG</p>
// //             </div>
// //           </div>
// //           <p className="text-sm text-gray-600 leading-relaxed font-medium">
// //             {data.today_summary || "No specific recap compiled for today's curriculum milestone yet."}
// //           </p>
// //         </div>
// //       </div>

// //       {/* 4. PROJECT SHOWCASE (WITH DROPDOWN HISTORY) */}
// //       {latestProject && (
// //         <div className="p-4">
// //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// //               <Rocket size={18} className="animate-bounce" /> Student Project
// //             </div>
// //             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
// //             <a href={latestProject.project_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all">
// //               Launch Project <ExternalLink size={18} />
// //             </a>

// //             {/* EXPANDABLE WORK LEDGER */}
// //             {archivedProjects.length > 0 && (
// //               <div className="mt-4 pt-3 border-t border-white/20">
// //                 <button 
// //                   onClick={() => setShowAllProjects(!showAllProjects)} 
// //                   className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-orange-100 hover:text-white transition"
// //                 >
// //                   <span>View All Projects ({projects.length})</span>
// //                   {showAllProjects ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
// //                 </button>

// //                 {showAllProjects && (
// //                   <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
// //                     {archivedProjects.map((proj) => (
// //                       <a key={proj.id} href={proj.project_url} target="_blank" rel="noreferrer" className="flex justify-between items-center bg-white/10 hover:bg-white/20 p-2.5 rounded-lg text-xs font-semibold transition">
// //                         <span className="truncate max-w-[200px]">{proj.project_title}</span>
// //                         <ExternalLink size={12} className="opacity-80 flex-shrink-0" />
// //                       </a>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       )}

// //       {/* 5. OVERALL PERFORMANCE CIRCLE */}
// //       <div className="p-4">
// //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1 flex items-center gap-1.5">
// //             <Award size={15} className="text-green-500" /> Overall Performance
// //           </h2>
// //           <div className="flex items-center gap-6">
// //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full flex-shrink-0">
// //               <div className="text-center">
// //                 <span className="text-2xl font-black text-gray-800">{cumulativeAverage}%</span>
// //                 <p className="text-[8px] text-green-500 font-bold uppercase">{data.performance_label || 'Average'}</p>
// //               </div>
// //             </div>
// //             <p className="flex-1 text-sm text-gray-600 leading-tight">
// //               <span className="font-bold text-gray-800">{data.performance_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is demonstrating structural mastery across standard metrics.
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 6. LATEST EXAM CARD */}
// //       <div className="px-4 mb-2">
// //         <div className="flex justify-between items-center mb-3 px-1">
// //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Latest Exam Result</h2>
// //         </div>
        
// //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// //           <div className="flex justify-between items-start">
// //             <div className="flex gap-3">
// //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// //                 <Code size={20} />
// //               </div>
// //               <div>
// //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">
// //                   {latestExam ? latestExam.exam_title : (data.exam_title || "Initial Setup Profile")}
// //                 </h3>
// //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// //                   <Calendar size={12} /> {latestExam?.exam_date ? new Date(latestExam.exam_date).toDateString() : 'Recent'}
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="text-right">
// //               <div className="text-xl font-black text-green-500">
// //                 {latestExam ? latestExam.overall_score : data.overall_score}%
// //               </div>
// //               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Score</p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* 7. SKILL BREAKDOWN (Progress Bars mapping dynamically) */}
// //       <div className="p-4">
// //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
// //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// //           <StatRow label="Theory" score={latestExam ? latestExam.theory_score : data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// //           <StatRow label="Practical" score={latestExam ? latestExam.practical_score : data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// //           <StatRow label="Logic" score={latestExam ? latestExam.problem_solving_score : data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// //           <StatRow label="Creative" score={latestExam ? latestExam.creativity_score : data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// //         </div>
// //       </div>

// //       {/* HISTORICAL EXAMS LEDGER FEED STACK */}
// //       {historicalExams.length > 0 && (
// //         <div className="px-4 mb-4 space-y-2">
// //           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
// //             <History size={10} /> Previous Grading Records
// //           </p>
// //           {historicalExams.map((ex) => (
// //             <div key={ex.id} className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center opacity-85">
// //               <div>
// //                 <h4 className="font-bold text-gray-700 text-xs">{ex.exam_title}</h4>
// //                 <span className="text-[9px] text-gray-400 font-medium block">{new Date(ex.exam_date).toLocaleDateString()}</span>
// //               </div>
// //               <span className="text-xs font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{ex.overall_score}%</span>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* 8. TUTOR FEEDBACK */}
// //       <div className="px-4">
// //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// //             <MessageSquare size={18} /> Tutor Feedback
// //           </div>
// //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// //           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
// //             <span>By Tech Talk Hub</span>
// //             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const StatRow = ({ label, score, icon, color }) => (
// //   <div>
// //     <div className="flex justify-between items-center mb-1">
// //       <div className="flex items-center gap-2">
// //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// //       </div>
// //       <div className="text-xs font-black text-gray-800">{score || 0}%</div>
// //     </div>
// //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// //       <div
// //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// //         style={{ width: `${score || 0}%` }}
// //       ></div>
// //     </div>
// //   </div>
// // );

// // export default StudentDashboard;
// // // import React, { useEffect, useState } from 'react';
// // // import { useParams } from 'react-router-dom';
// // // import { supabase } from '../supabase';
// // // import {
// // //   User,
// // //   Calendar,
// // //   BookOpen,
// // //   Code,
// // //   Monitor,
// // //   Lightbulb,
// // //   Star,
// // //   MessageSquare,
// // //   Rocket,
// // //   ExternalLink,
// // //   Camera,
// // //   Activity,
// // //   Award
// // // } from 'lucide-react';

// // // const StudentDashboard = () => {
// // //   const { slug } = useParams();
// // //   const [data, setData] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [uploading, setUploading] = useState(false);

// // //   useEffect(() => {
// // //     fetchData();
// // //   }, [slug]);

// // //   async function fetchData() {
// // //     if (!slug) return;
// // //     const { data, error } = await supabase
// // //       .from('student_results')
// // //       .select('*')
// // //       .eq('slug', slug)
// // //       .single();

// // //     if (error) console.error("Fetch Error:", error.message);
// // //     if (data) setData(data);
// // //     setLoading(false);
// // //   }

// // //   const handleAvatarChange = async (e) => {
// // //     try {
// // //       setUploading(true);
// // //       const file = e.target.files[0];
// // //       if (!file || !data?.id) return;

// // //       const fileExt = file.name.split('.').pop();
// // //       const fileName = `${data.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
// // //       const filePath = `avatars/${fileName}`;

// // //       let { error: uploadError } = await supabase.storage
// // //         .from('student-assets')
// // //         .upload(filePath, file);

// // //       if (uploadError) throw uploadError;

// // //       const { data: { publicUrl } } = supabase.storage
// // //         .from('student-assets')
// // //         .getPublicUrl(filePath);

// // //       const { error: updateError } = await supabase
// // //         .from('student_results')
// // //         .update({ avatar_url: publicUrl })
// // //         .eq('id', data.id);

// // //       if (updateError) throw updateError;

// // //       setData({ ...data, avatar_url: publicUrl });
// // //       alert("Profile picture updated!");
// // //     } catch (err) {
// // //       alert("Upload error: " + err.message);
// // //     } finally {
// // //       setUploading(false);
// // //     }
// // //   };

// // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // //   // Safe calculated fallbacks for subscription calculations
// // //   const totalAllocated = data.total_classes_allocated || 12;
// // //   const attended = data.classes_attended || 0;
// // //   const remainingClasses = totalAllocated - attended;

// // //   return (
// // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// // //       {/* 1. HEADER SECTION */}
// // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // //         <div className="flex items-center gap-4">
// // //           <div className="relative group">
// // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // //               {data.avatar_url && data.avatar_url.trim() !== "" ? (
// // //                 <img
// // //                   key={data.avatar_url}
// // //                   src={`${data.avatar_url}?t=${new Date().getTime()}`}
// // //                   alt="Profile"
// // //                   className="w-full h-full object-cover"
// // //                   onError={(e) => {
// // //                     console.error("Image failed to load");
// // //                     e.target.src = "";
// // //                   }}
// // //                 />
// // //               ) : (
// // //                 <User size={40} className="text-indigo-500" />
// // //               )}
// // //             </div>
// // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// // //               <Camera size={14} />
// // //               <input
// // //                 type="file"
// // //                 className="hidden"
// // //                 onChange={handleAvatarChange}
// // //                 disabled={uploading}
// // //                 accept="image/*"
// // //               />
// // //             </label>
// // //           </div>
// // //           <div className="flex-1">
// // //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// // //             <p className="text-sm text-indigo-600 font-semibold">Grade {data.grade_level} • {data.course_name}</p>
// // //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// // //               Active Student
// // //             </span>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* 2. NEW DYNAMIC COMPONENT: SUBSCRIPTION TRACKER PANEL */}
// // //       <div className="p-4">
// // //         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
// // //           <div className="flex justify-between items-center mb-3">
// // //             <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
// // //               <Activity size={14} className="text-indigo-500" /> Subscription Balance
// // //             </h2>
// // //             <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 uppercase">
// // //               Cycle Status
// // //             </span>
// // //           </div>
// // //           <div className="grid grid-cols-3 gap-2 text-center">
// // //             <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
// // //               <span className="text-xs text-slate-400 block font-medium">Allocated</span>
// // //               <span className="text-lg font-black text-slate-800">{totalAllocated}</span>
// // //             </div>
// // //             <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
// // //               <span className="text-xs text-emerald-600 block font-semibold">Attended</span>
// // //               <span className="text-lg font-black text-emerald-700">{attended}</span>
// // //             </div>
// // //             <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
// // //               <span className="text-xs text-indigo-600 block font-semibold">Remaining</span>
// // //               <span className="text-lg font-black text-indigo-700">{remainingClasses}</span>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* 3. NEW DYNAMIC COMPONENT: TODAY'S LESSON SUMMARY */}
// // //       <div className="px-4 mb-2">
// // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
// // //           <div className="flex items-center gap-2 mb-3 border-b border-slate-50 pb-2">
// // //             <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg">
// // //               <BookOpen size={16} />
// // //             </div>
// // //             <div>
// // //               <h2 className="font-bold text-gray-800 text-xs uppercase tracking-wide">Today's Class Summary</h2>
// // //               <p className="text-[9px] text-gray-400 font-medium font-mono">LATEST UPDATE LOG</p>
// // //             </div>
// // //           </div>
// // //           <p className="text-sm text-gray-600 leading-relaxed font-medium">
// // //             {data.today_summary || "No specific recap compiled for today's curriculum milestone yet."}
// // //           </p>
// // //         </div>
// // //       </div>

// // //       {/* 4. PROJECT SHOWCASE */}
// // //       {data.project_url && (
// // //         <div className="p-4">
// // //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// // //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// // //               <Rocket size={18} /> Student Project
// // //             </div>
// // //             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
// // //             <a
// // //               href={data.project_url}
// // //               target="_blank"
// // //               rel="noreferrer"
// // //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// // //             >
// // //               Launch Project <ExternalLink size={18} />
// // //             </a>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* 5. OVERALL PERFORMANCE CIRCLE */}
// // //       <div className="p-4">
// // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// // //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1 flex items-center gap-1.5">
// // //             <Award size={15} className="text-green-500" /> Overall Performance
// // //           </h2>
// // //           <div className="flex items-center gap-6">
// // //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // //               <div className="text-center">
// // //                 <span className="text-2xl font-black text-gray-800">{data.overall_score}%</span>
// // //                 <p className="text-[8px] text-green-500 font-bold uppercase">{data.performance_label || 'Score'}</p>
// // //               </div>
// // //             </div>
// // //             <p className="flex-1 text-sm text-gray-600 leading-tight">
// // //               <span className="font-bold text-gray-800">{data.performance_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is demonstrating structural mastery across standard metrics.
// // //             </p>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* 6. LATEST EXAM CARD */}
// // //       <div className="px-4 mb-2">
// // //         <div className="flex justify-between items-center mb-3 px-1">
// // //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Latest Exam Result</h2>
// // //         </div>
// // //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// // //           <div className="flex justify-between items-start">
// // //             <div className="flex gap-3">
// // //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // //                 <Code size={20} />
// // //               </div>
// // //               <div>
// // //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">{data.exam_title}</h3>
// // //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // //                   <Calendar size={12} /> {data.exam_date ? new Date(data.exam_date).toDateString() : 'Recent'}
// // //                 </div>
// // //               </div>
// // //             </div>
// // //             <div className="text-right">
// // //               <div className="text-xl font-black text-green-500">{data.overall_score}%</div>
// // //               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Score</p>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* 7. SKILL BREAKDOWN (Progress Bars) */}
// // //       <div className="p-4">
// // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
// // //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// // //           <StatRow label="Theory" score={data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // //           <StatRow label="Practical" score={data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // //           <StatRow label="Logic" score={data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // //           <StatRow label="Creative" score={data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // //         </div>
// // //       </div>

// // //       {/* 8. TUTOR FEEDBACK */}
// // //       <div className="px-4">
// // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // //             <MessageSquare size={18} /> Tutor Feedback
// // //           </div>
// // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// // //           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
// // //             <span>By Tech Talk Hub</span>
// // //             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // const StatRow = ({ label, score, icon, color }) => (
// // //   <div>
// // //     <div className="flex justify-between items-center mb-1">
// // //       <div className="flex items-center gap-2">
// // //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// // //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// // //       </div>
// // //       <div className="text-xs font-black text-gray-800">{score}%</div>
// // //     </div>
// // //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// // //       <div
// // //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// // //         style={{ width: `${score}%` }}
// // //       ></div>
// // //     </div>
// // //   </div>
// // // );

// // // export default StudentDashboard;
// // // // import React, { useEffect, useState } from 'react';
// // // // import { useParams } from 'react-router-dom';
// // // // import { supabase } from '../supabase';
// // // // import {
// // // //   User,
// // // //   Calendar,
// // // //   BookOpen,
// // // //   Code,
// // // //   Monitor,
// // // //   Lightbulb,
// // // //   Star,
// // // //   MessageSquare,
// // // //   Rocket,
// // // //   ExternalLink,
// // // //   Camera
// // // // } from 'lucide-react';

// // // // const StudentDashboard = () => {
// // // //   const { slug } = useParams();
// // // //   const [data, setData] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [uploading, setUploading] = useState(false);

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, [slug]);

// // // //   async function fetchData() {
// // // //     if (!slug) return;
// // // //     const { data, error } = await supabase
// // // //       .from('student_results')
// // // //       .select('*')
// // // //       .eq('slug', slug)
// // // //       .single();

// // // //     if (error) console.error("Fetch Error:", error.message);
// // // //     if (data) setData(data);
// // // //     setLoading(false);
// // // //   }

// // // //   const handleAvatarChange = async (e) => {
// // // //     try {
// // // //       setUploading(true);
// // // //       const file = e.target.files[0];
// // // //       if (!file || !data?.id) return;

// // // //       const fileExt = file.name.split('.').pop();
// // // //       const fileName = `${data.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
// // // //       const filePath = `avatars/${fileName}`;

// // // //       let { error: uploadError } = await supabase.storage
// // // //         .from('student-assets')
// // // //         .upload(filePath, file);

// // // //       if (uploadError) throw uploadError;

// // // //       const { data: { publicUrl } } = supabase.storage
// // // //         .from('student-assets')
// // // //         .getPublicUrl(filePath);

// // // //       const { error: updateError } = await supabase
// // // //         .from('student_results')
// // // //         .update({ avatar_url: publicUrl })
// // // //         .eq('id', data.id);

// // // //       if (updateError) throw updateError;

// // // //       setData({ ...data, avatar_url: publicUrl });
// // // //       alert("Profile picture updated!");
// // // //     } catch (err) {
// // // //       alert("Upload error: " + err.message);
// // // //     } finally {
// // // //       setUploading(false);
// // // //     }
// // // //   };

// // // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // // //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // // //   return (
// // // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// // // //       {/* 1. HEADER SECTION */}
// // // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // // //         <div className="flex items-center gap-4">
// // // //           <div className="relative group">
// // // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // // //               {data.avatar_url && data.avatar_url.trim() !== "" ? (
// // // //                 // <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
// // // //                 <img
// // // //                   key={data.avatar_url} // Forces re-render when URL changes
// // // //                   src={`${data.avatar_url}?t=${new Date().getTime()}`} // Cache buster
// // // //                   alt="Profile"
// // // //                   className="w-full h-full object-cover"
// // // //                   onLoad={() => console.log("Image loaded successfully")}
// // // //                   onError={(e) => {
// // // //                     console.error("Image failed to load");
// // // //                     e.target.src = ""; // Clear broken src
// // // //                     // Optionally reset state to show User icon
// // // //                   }}
// // // //                 />
// // // //               ) : (
// // // //                 <User size={40} className="text-indigo-500" />
// // // //               )}
// // // //             </div>
// // // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// // // //               <Camera size={14} />
// // // //               <input
// // // //                 type="file"
// // // //                 className="hidden"
// // // //                 onChange={handleAvatarChange}
// // // //                 disabled={uploading}
// // // //                 accept="image/*"
// // // //               />
// // // //             </label>
// // // //           </div>
// // // //           <div className="flex-1">
// // // //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// // // //             {/* <p className="text-sm text-indigo-600 font-semibold">{data.course_name}</p> */}
// // // //             <p className="text-sm text-indigo-600 font-semibold">Grade {data.grade_level} • {data.course_name}</p>
// // // //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// // // //               Active Student
// // // //             </span>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* 2. PROJECT SHOWCASE (If available) */}
// // // //       {data.project_url && (
// // // //         <div className="p-4">
// // // //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// // // //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// // // //               <Rocket size={18} /> Student Project
// // // //             </div>
// // // //             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
// // // //             <a
// // // //               href={data.project_url}
// // // //               target="_blank"
// // // //               rel="noreferrer"
// // // //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// // // //             >
// // // //               Launch Project <ExternalLink size={18} />
// // // //             </a>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* 3. OVERALL PERFORMANCE CIRCLE */}
// // // //       <div className="p-4">
// // // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// // // //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide px-1">Overall Performance</h2>
// // // //           <div className="flex items-center gap-6">
// // // //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // // //               <div className="text-center">
// // // //                 <span className="text-2xl font-black text-gray-800">{data.overall_score}%</span>
// // // //                 <p className="text-[8px] text-green-500 font-bold uppercase">{data.performance_label || 'Score'}</p>
// // // //               </div>
// // // //             </div>
// // // //             <p className="flex-1 text-sm text-gray-600 leading-tight">
// // // //               <span className="font-bold text-gray-800">{data.performance_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is performing excellently in this course.
// // // //             </p>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* 4. LATEST EXAM CARD */}
// // // //       <div className="px-4 mb-2">
// // // //         <div className="flex justify-between items-center mb-3 px-1">
// // // //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Latest Exam Result</h2>
// // // //         </div>
// // // //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// // // //           <div className="flex justify-between items-start">
// // // //             <div className="flex gap-3">
// // // //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // // //                 <BookOpen size={20} />
// // // //               </div>
// // // //               <div>
// // // //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">{data.exam_title}</h3>
// // // //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // // //                   <Calendar size={12} /> {data.exam_date ? new Date(data.exam_date).toDateString() : 'Recent'}
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //             <div className="text-right">
// // // //               <div className="text-xl font-black text-green-500">{data.overall_score}%</div>
// // // //               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Score</p>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* 5. SKILL BREAKDOWN (Progress Bars) */}
// // // //       <div className="p-4">
// // // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
// // // //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// // // //           <StatRow label="Theory" score={data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // // //           <StatRow label="Practical" score={data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // // //           <StatRow label="Logic" score={data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // // //           <StatRow label="Creative" score={data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // // //         </div>
// // // //       </div>

// // // //       {/* 6. TUTOR FEEDBACK */}
// // // //       <div className="px-4">
// // // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// // // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // // //             <MessageSquare size={18} /> Tutor Feedback
// // // //           </div>
// // // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// // // //           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
// // // //             <span>By Tech Talk Hub</span>
// // // //             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // const StatRow = ({ label, score, icon, color }) => (
// // // //   <div>
// // // //     <div className="flex justify-between items-center mb-1">
// // // //       <div className="flex items-center gap-2">
// // // //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// // // //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// // // //       </div>
// // // //       <div className="text-xs font-black text-gray-800">{score}%</div>
// // // //     </div>
// // // //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// // // //       <div
// // // //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// // // //         style={{ width: `${score}%` }}
// // // //       ></div>
// // // //     </div>
// // // //   </div>
// // // // );

// // // // export default StudentDashboard;
// // // // import React, { useEffect, useState } from 'react';
// // // // import { useParams } from 'react-router-dom';
// // // // import { supabase } from '../supabase';
// // // // import {
// // // //   User,
// // // //   Calendar,
// // // //   BookOpen,
// // // //   Code,
// // // //   Monitor,
// // // //   Lightbulb,
// // // //   Star,
// // // //   MessageSquare,
// // // //   Rocket,
// // // //   ExternalLink,
// // // //   Camera
// // // // } from 'lucide-react';

// // // // const StudentDashboard = () => {
// // // //   const { studentId } = useParams();
// // // //   const [data, setData] = useState(null);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [uploading, setUploading] = useState(false);

// // // //   useEffect(() => {
// // // //     fetchData();
// // // //   }, [studentId]);

// // // //   async function fetchData() {
// // // //     if (!studentId) return;
// // // //     const { data, error } = await supabase
// // // //       .from('student_results')
// // // //       .select('*')
// // // //       .eq('id', studentId)
// // // //       .single();

// // // //     if (data) setData(data);
// // // //     setLoading(false);
// // // //   }

// // // //   const handleAvatarChange = async (e) => {
// // // //     try {
// // // //       setUploading(true);
// // // //       const file = e.target.files[0];
// // // //       if (!file) return;

// // // //       const fileExt = file.name.split('.').pop();
// // // //       const fileName = `${studentId}-${Math.random()}.${fileExt}`;
// // // //       const filePath = `avatars/${fileName}`;

// // // //       // 1. Upload to Supabase Storage
// // // //       let { error: uploadError } = await supabase.storage
// // // //         .from('student-assets')
// // // //         .upload(filePath, file);

// // // //       if (uploadError) throw uploadError;

// // // //       // 2. Get Public URL
// // // //       const { data: { publicUrl } } = supabase.storage
// // // //         .from('student-assets')
// // // //         .getPublicUrl(filePath);

// // // //       // 3. Update Table
// // // //       const { error: updateError } = await supabase
// // // //         .from('student_results')
// // // //         .update({ avatar_url: publicUrl })
// // // //         .eq('id', studentId);

// // // //       if (updateError) throw updateError;

// // // //       setData({ ...data, avatar_url: publicUrl });
// // // //       alert("Profile picture updated!");
// // // //     } catch (err) {
// // // //       alert("Error uploading image: " + err.message);
// // // //     } finally {
// // // //       setUploading(false);
// // // //     }
// // // //   };

// // // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // // //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // // //   return (
// // // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">
// // // //       {/* Header with Editable Avatar */}
// // // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // // //         <div className="flex items-center gap-4">
// // // //           <div className="relative group">
// // // //             {/* <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // // //               {data.avatar_url ? (
// // // //                 <img src={data.avatar_url} alt="Profile" className="w-full h-full object-cover" />
// // // //               ) : (
// // // //                 <User size={40} className="text-indigo-500" />
// // // //               )}
// // // //             </div> */}
// // // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden border-4 border-white shadow-inner flex items-center justify-center">
// // // //               {/* Check if avatar_url exists AND is not just an empty string */}
// // // //               {data.avatar_url && data.avatar_url.trim() !== "" ? (
// // // //                 <img
// // // //                   src={data.avatar_url}
// // // //                   alt="Profile"
// // // //                   className="w-full h-full object-cover"
// // // //                 />
// // // //               ) : (
// // // //                 <User size={40} className="text-indigo-500" />
// // // //               )}
// // // //             </div>
// // // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
// // // //               <Camera size={14} />
// // // //               <input
// // // //                 type="file"
// // // //                 className="hidden"
// // // //                 onChange={handleAvatarChange}
// // // //                 disabled={uploading}
// // // //                 accept="image/*"
// // // //               />
// // // //             </label>
// // // //           </div>
// // // //           <div className="flex-1">
// // // //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// // // //             <p className="text-sm text-indigo-600 font-semibold">{data.course_name}</p>
// // // //             <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase">
// // // //               Active Student
// // // //             </span>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* Project Showcase Section */}
// // // //       {data.project_url && (
// // // //         <div className="p-4">
// // // //           <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-5 rounded-2xl shadow-lg text-white">
// // // //             <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs tracking-widest">
// // // //               <Rocket size={18} /> Student Project
// // // //             </div>
// // // //             <h3 className="text-lg font-black mb-3">See what {data.student_name.split(' ')[0]} built!</h3>
// // // //             <a
// // // //               href={data.project_url}
// // // //               target="_blank"
// // // //               rel="noreferrer"
// // // //               className="flex items-center justify-center gap-2 w-full bg-white text-orange-600 font-black py-3 rounded-xl shadow-md active:scale-95 transition-all"
// // // //             >
// // // //               Launch Project <ExternalLink size={18} />
// // // //             </a>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* Performance Summary */}
// // // //       <div className="p-4">
// // // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-6">
// // // //           <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // // //             <div className="text-center">
// // // //               <span className="text-2xl font-black text-gray-800">{data.overall_score}%</span>
// // // //               {/* Uses dynamic label from DB (e.g. project_label) instead of hardcoded 'Excellent' */}
// // // //               <p className="text-[8px] text-green-500 font-bold uppercase">{data.project_label || 'Score'}</p>
// // // //             </div>
// // // //           </div>
// // // //           <p className="flex-1 text-sm text-gray-600 leading-tight">
// // // //             <span className="font-bold text-gray-800">{data.project_label || 'Great Job'}!</span> {data.student_name.split(' ')[0]} is mastering coding concepts with great logic.
// // // //           </p>
// // // //         </div>
// // // //       </div>

// // // //       {/* Exam Details */}
// // // //       <div className="px-4 mb-2">
// // // //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// // // //           <div className="flex justify-between items-start">
// // // //             <div className="flex gap-3">
// // // //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // // //                 <BookOpen size={20} />
// // // //               </div>
// // // //               <div>
// // // //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">{data.exam_title}</h3>
// // // //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // // //                   <Calendar size={12} /> {data.exam_date ? new Date(data.exam_date).toDateString() : 'Recent'}
// // // //                 </div>
// // // //               </div>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* Skill Breakdown */}
// // // //       <div className="p-4">
// // // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Skill Breakdown</h2>
// // // //         <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
// // // //           <StatRow label="Theory" score={data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // // //           <StatRow label="Practical" score={data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // // //           <StatRow label="Logic" score={data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // // //           <StatRow label="Creative" score={data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // // //         </div>
// // // //       </div>

// // // //       {/* Tutor Feedback */}
// // // //       <div className="px-4">
// // // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg">
// // // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // // //             <MessageSquare size={18} /> Tutor Feedback
// // // //           </div>
// // // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// // // //           <div className="mt-4 pt-3 border-t border-indigo-400 text-[10px] text-indigo-200 font-bold uppercase flex justify-between">
// // // //             <span>By Tech Talk Hub</span>
// // // //             <span className="bg-white/20 px-2 py-0.5 rounded">Verified Report</span>
// // // //           </div>
// // // //         </div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // const StatRow = ({ label, score, icon, color }) => (
// // // //   <div>
// // // //     <div className="flex justify-between items-center mb-1">
// // // //       <div className="flex items-center gap-2">
// // // //         <div className={`${color} p-1.5 rounded-lg`}>{icon}</div>
// // // //         <span className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
// // // //       </div>
// // // //       <div className="text-xs font-black text-gray-800">{score}%</div>
// // // //     </div>
// // // //     <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
// // // //       <div
// // // //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// // // //         style={{ width: `${score}%` }}
// // // //       ></div>
// // // //     </div>
// // // //   </div>
// // // // );

// // // // export default StudentDashboard;
// // // // // import React, { useEffect, useState } from 'react';
// // // // // import { useParams } from 'react-router-dom';
// // // // // import { supabase } from '../supabase';
// // // // // import {
// // // // //   User,
// // // // //   Calendar,
// // // // //   BookOpen,
// // // // //   Code,
// // // // //   Monitor,
// // // // //   Lightbulb,
// // // // //   Star,
// // // // //   MessageSquare,
// // // // //   Rocket,
// // // // //   ExternalLink,
// // // // //   Camera
// // // // // } from 'lucide-react';

// // // // // const StudentDashboard = () => {
// // // // //   const { slug } = useParams();
// // // // //   const [data, setData] = useState(null);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [uploading, setUploading] = useState(false);

// // // // //   useEffect(() => {
// // // // //     fetchData();
// // // // //   }, [studentId]);

// // // // //   async function fetchData() {
// // // // //     if (!studentId) return;

// // // // //     // const { data, error } = await supabase
// // // // //     //   .from('student_results')
// // // // //     //   .select('*')
// // // // //     //   .eq('id', studentId)
// // // // //     //   .single();
// // // // //     const { data, error } = await supabase
// // // // //       .from('student_results')
// // // // //       .select('*')
// // // // //       .eq('slug', slug)
// // // // //       .single();

// // // // //     if (error) {
// // // // //       console.error(error);
// // // // //     }

// // // // //     if (data) setData(data);
// // // // //     setLoading(false);
// // // // //   }

// // // // //   const handleAvatarChange = async (e) => {
// // // // //     try {
// // // // //       setUploading(true);
// // // // //       const file = e.target.files[0];
// // // // //       if (!file) return;

// // // // //       const fileExt = file.name.split('.').pop();
// // // // //       const fileName = `${studentId}-${Math.random()}.${fileExt}`;
// // // // //       const filePath = `avatars/${fileName}`;

// // // // //       // Upload
// // // // //       const { error: uploadError } = await supabase.storage
// // // // //         .from('student-assets')
// // // // //         .upload(filePath, file);

// // // // //       if (uploadError) throw uploadError;

// // // // //       // Get URL
// // // // //       const { data: { publicUrl } } = supabase.storage
// // // // //         .from('student-assets')
// // // // //         .getPublicUrl(filePath);

// // // // //       // Update DB
// // // // //       const { error: updateError } = await supabase
// // // // //         .from('student_results')
// // // // //         .update({ avatar_url: publicUrl })
// // // // //         .eq('id', studentId);

// // // // //       if (updateError) throw updateError;

// // // // //       setData(prev => ({ ...prev, avatar_url: publicUrl }));
// // // // //       alert("Profile picture updated!");
// // // // //     } catch (err) {
// // // // //       alert("Upload error: " + err.message);
// // // // //     } finally {
// // // // //       setUploading(false);
// // // // //     }
// // // // //   };

// // // // //   if (loading) return <div className="p-10 text-center animate-pulse">Fetching Report...</div>;
// // // // //   if (!data) return <div className="p-10 text-center">Result not found.</div>;

// // // // //   return (
// // // // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">

// // // // //       {/* HEADER */}
// // // // //       <div className="bg-white p-6 rounded-b-3xl border-b">
// // // // //         <div className="flex items-center gap-4">

// // // // //           {/* Avatar */}
// // // // //           <div className="relative">
// // // // //             <div className="w-20 h-20 bg-indigo-100 rounded-full overflow-hidden flex items-center justify-center">
// // // // //               {data.avatar_url ? (
// // // // //                 <img src={data.avatar_url} className="w-full h-full object-cover" />
// // // // //               ) : (
// // // // //                 <User size={40} className="text-indigo-500" />
// // // // //               )}
// // // // //             </div>

// // // // //             <label className="absolute bottom-0 right-0 bg-indigo-600 p-1 rounded-full text-white cursor-pointer">
// // // // //               <Camera size={14} />
// // // // //               <input
// // // // //                 type="file"
// // // // //                 className="hidden"
// // // // //                 onChange={handleAvatarChange}
// // // // //                 disabled={uploading}
// // // // //                 accept="image/*"
// // // // //               />
// // // // //             </label>
// // // // //           </div>

// // // // //           {/* Info */}
// // // // //           <div className="flex-1">
// // // // //             <h1 className="text-lg font-bold">{data.student_name}</h1>
// // // // //             <p className="text-xs text-indigo-600">{data.grade_level} • {data.course_name}</p>
// // // // //             <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full">
// // // // //               Active Student
// // // // //             </span>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* PROJECT */}
// // // // //       {data.project_url && (
// // // // //         <div className="p-4">
// // // // //           <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-4 rounded-xl text-white">
// // // // //             <div className="flex items-center gap-2 text-xs font-bold mb-2">
// // // // //               <Rocket size={16} /> PROJECT
// // // // //             </div>

// // // // //             <h3 className="font-bold mb-2">
// // // // //               See what {data.student_name?.split(' ')[0]} built 🚀
// // // // //             </h3>

// // // // //             <a
// // // // //               href={data.project_url}
// // // // //               target="_blank"
// // // // //               rel="noreferrer"
// // // // //               className="bg-white text-orange-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-bold"
// // // // //             >
// // // // //               Open Project <ExternalLink size={16} />
// // // // //             </a>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* PERFORMANCE */}
// // // // //       <div className="p-4">
// // // // //         <div className="bg-white p-4 rounded-xl flex gap-4 items-center">
// // // // //           <div className="w-20 h-20 border-[8px] border-green-500 rounded-full flex items-center justify-center">
// // // // //             <span className="font-bold text-lg">{data.overall_score}%</span>
// // // // //           </div>

// // // // //           <p className="text-sm text-gray-600">
// // // // //             <b>{data.project_label || 'Great job'}!</b> {data.student_name?.split(' ')[0]} is performing excellently.
// // // // //           </p>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* EXAM */}
// // // // //       <div className="px-4">
// // // // //         <div className="bg-white p-4 rounded-xl border-l-4 border-indigo-500">
// // // // //           <div className="flex justify-between">
// // // // //             <div className="flex gap-2">
// // // // //               <BookOpen size={18} />
// // // // //               <div>
// // // // //                 <h3 className="text-sm font-bold">{data.exam_title}</h3>
// // // // //                 <p className="text-xs text-gray-400 flex items-center gap-1">
// // // // //                   <Calendar size={12} />
// // // // //                   {data.exam_date ? new Date(data.exam_date).toDateString() : 'Recent'}
// // // // //                 </p>
// // // // //               </div>
// // // // //             </div>

// // // // //             <div className="font-bold text-green-500">
// // // // //               {data.overall_score}%
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* BREAKDOWN */}
// // // // //       <div className="p-4 space-y-3">
// // // // //         <StatRow label="Theory" score={data.theory_score} icon={<Code size={14} />} />
// // // // //         <StatRow label="Practical" score={data.practical_score} icon={<Monitor size={14} />} />
// // // // //         <StatRow label="Logic" score={data.problem_solving_score} icon={<Lightbulb size={14} />} />
// // // // //         <StatRow label="Creativity" score={data.creativity_score} icon={<Star size={14} />} />
// // // // //       </div>

// // // // //       {/* FEEDBACK */}
// // // // //       <div className="p-4">
// // // // //         <div className="bg-indigo-600 p-4 rounded-xl text-white">
// // // // //           <div className="flex items-center gap-2 font-bold text-sm mb-2">
// // // // //             <MessageSquare size={16} /> Tutor Feedback
// // // // //           </div>

// // // // //           <p className="text-sm italic">"{data.tutor_feedback}"</p>
// // // // //         </div>
// // // // //       </div>

// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // const StatRow = ({ label, score, icon }) => (
// // // // //   <div>
// // // // //     <div className="flex justify-between text-xs mb-1">
// // // // //       <div className="flex items-center gap-2">
// // // // //         {icon}
// // // // //         <span>{label}</span>
// // // // //       </div>
// // // // //       <span className="font-bold">{score}%</span>
// // // // //     </div>

// // // // //     <div className="w-full bg-gray-200 h-2 rounded-full">
// // // // //       <div
// // // // //         className="bg-green-500 h-2 rounded-full"
// // // // //         style={{ width: `${score}%` }}
// // // // //       />
// // // // //     </div>
// // // // //   </div>
// // // // // );

// // // // // export default StudentDashboard;
// // // // // // import React, { useEffect, useState } from 'react';
// // // // // // import { useParams } from 'react-router-dom'; // 1. Added this
// // // // // // import { supabase } from '../supabase';
// // // // // // import { User, Calendar, BookOpen, Code, Monitor, Lightbulb, Star, MessageSquare } from 'lucide-react';

// // // // // // const StudentDashboard = () => {
// // // // // //   const { studentId } = useParams(); // 2. Moved this out of the component body
// // // // // //   const [data, setData] = useState(null);
// // // // // //   const [loading, setLoading] = useState(true);

// // // // // //   useEffect(() => {
// // // // // //     async function fetchData() {
// // // // // //       if (!studentId) return;

// // // // // //       const { data, error } = await supabase
// // // // // //         .from('student_results')
// // // // // //         .select('*')
// // // // // //         .eq('id', studentId)
// // // // // //         .single();

// // // // // //       if (data) setData(data);
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //     fetchData();
// // // // // //   }, [studentId]);

// // // // // //   if (loading) return <div className="p-10 text-center animate-pulse font-sans">Fetching Report Card...</div>;
// // // // // //   if (!data) return <div className="p-10 text-center font-sans">Result not found.</div>;

// // // // // //   return (
// // // // // //     <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 font-sans shadow-2xl">
// // // // // //       {/* Header */}
// // // // // //       <div className="bg-white p-6 rounded-b-3xl shadow-sm border-b border-gray-100">
// // // // // //         <div className="flex items-center gap-4">
// // // // // //           <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
// // // // // //             <User size={40} className="text-indigo-500" />
// // // // // //           </div>
// // // // // //           <div className="flex-1">
// // // // // //             <h1 className="text-xl font-extrabold text-gray-800">{data.student_name}</h1>
// // // // // //             <p className="text-sm text-indigo-600 font-semibold">{data.grade_level} • {data.course_name}</p>
// // // // // //             <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-tighter">
// // // // // //               Active Student
// // // // // //             </span>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Performance Circle */}
// // // // // //       <div className="p-4">
// // // // // //         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-50">
// // // // // //           <h2 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Overall Performance</h2>
// // // // // //           <div className="flex items-center gap-6">
// // // // // //             <div className="relative w-24 h-24 flex items-center justify-center border-[10px] border-green-500 rounded-full">
// // // // // //               <div className="text-center">
// // // // // //                 <span className="text-2xl font-black text-gray-800">{data.overall_score}%</span>
// // // // // //                 <p className="text-[8px] text-green-500 font-bold uppercase">Excellent</p>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //             <div className="flex-1 text-sm text-gray-600 leading-relaxed">
// // // // // //               Great job! <span className="font-bold text-gray-800">{data.student_name.split(' ')[0]}</span> is performing <span className="text-green-600 font-bold underline decoration-2">above average</span>.
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Exam Card */}
// // // // // //       <div className="px-4 mb-4">
// // // // // //         <div className="flex justify-between items-center mb-3 px-1">
// // // // // //           <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Latest Exam Result</h2>
// // // // // //           <button className="text-indigo-600 text-xs font-bold">View All</button>
// // // // // //         </div>
// // // // // //         <div className="bg-white p-4 rounded-2xl shadow-sm border-l-[6px] border-indigo-500">
// // // // // //           <div className="flex justify-between items-start">
// // // // // //             <div className="flex gap-3">
// // // // // //               <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
// // // // // //                 <BookOpen size={24} />
// // // // // //               </div>
// // // // // //               <div>
// // // // // //                 <h3 className="font-bold text-gray-800 text-sm leading-tight">{data.exam_title}</h3>
// // // // // //                 <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1 font-medium">
// // // // // //                   <Calendar size={12} /> {new Date(data.exam_date).toDateString()}
// // // // // //                 </div>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //             <div className="text-right">
// // // // // //               <div className="text-2xl font-black text-green-500">{data.overall_score}%</div>
// // // // // //               <p className="text-[9px] text-gray-400 font-bold uppercase">Score</p>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Breakdown */}
// // // // // //       <div className="p-4">
// // // // // //         <h2 className="font-bold text-gray-800 mb-3 text-sm px-1 uppercase tracking-wide">Section Breakdown</h2>
// // // // // //         <div className="space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-gray-50">
// // // // // //           <StatRow label="Concepts & Theory" score={data.theory_score} icon={<Code size={16} />} color="bg-red-50 text-red-500" />
// // // // // //           <StatRow label="Practical Implementation" score={data.practical_score} icon={<Monitor size={16} />} color="bg-blue-50 text-blue-500" />
// // // // // //           <StatRow label="Problem Solving" score={data.problem_solving_score} icon={<Lightbulb size={16} />} color="bg-yellow-50 text-yellow-500" />
// // // // // //           <StatRow label="Creativity & Logic" score={data.creativity_score} icon={<Star size={16} />} color="bg-purple-50 text-purple-500" />
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Feedback */}
// // // // // //       <div className="px-4">
// // // // // //         <div className="bg-indigo-600 p-5 rounded-2xl shadow-lg shadow-indigo-100">
// // // // // //           <div className="flex gap-2 items-center text-white font-bold mb-2 text-sm uppercase">
// // // // // //             <MessageSquare size={18} /> Tutor Feedback
// // // // // //           </div>
// // // // // //           <p className="text-sm text-indigo-50 italic leading-relaxed font-medium">"{data.tutor_feedback}"</p>
// // // // // //           <div className="mt-4 pt-3 border-t border-indigo-400 flex justify-between items-center text-[10px] text-indigo-200 font-bold uppercase">
// // // // // //             <span>By Tech Talk Hub</span>
// // // // // //             <span className="bg-white/20 px-2 py-0.5 rounded italic">Approved</span>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // const StatRow = ({ label, score, icon, color }) => (
// // // // // //   <div>
// // // // // //     <div className="flex justify-between items-center mb-1.5">
// // // // // //       <div className="flex items-center gap-2.5">
// // // // // //         <div className={`${color} p-2 rounded-lg shadow-sm`}>{icon}</div>
// // // // // //         <span className="text-xs font-bold text-gray-700 uppercase tracking-tight">{label}</span>
// // // // // //       </div>
// // // // // //       <div className="text-right text-xs font-black text-gray-900">{score}%</div>
// // // // // //     </div>
// // // // // //     <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
// // // // // //       <div
// // // // // //         className="bg-green-500 h-full rounded-full transition-all duration-1000"
// // // // // //         style={{ width: `${score}%` }}
// // // // // //       ></div>
// // // // // //     </div>
// // // // // //   </div>
// // // // // // );

// // // // // // export default StudentDashboard;