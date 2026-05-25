"use client";

import React, { useState } from "react";
import { ResumeData } from "@/lib/db";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  User, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Layers,
  ArrowRight,
  Lightbulb,
  AlertTriangle
} from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<"personal" | "education" | "experience" | "projects" | "skills">("personal");
  const [aiLoadingIdx, setAiLoadingIdx] = useState<number | null>(null);
  const [aiMessyText, setAiMessyText] = useState("");
  const [activeAiBox, setActiveAiBox] = useState<number | null>(null);

  const updatePersonal = (field: string, value: string) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value
      }
    });
  };

  // Education Helpers
  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, education: updated });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [...data.education, { institution: "", degree: "", year: "", gpa: "" }]
    });
  };

  const removeEducation = (index: number) => {
    const updated = data.education.filter((_, idx) => idx !== index);
    onChange({ ...data, education: updated });
  };

  // Experience Helpers
  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, experience: updated });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience, 
        { company: "", role: "", duration: "", bullets: ["Implemented XYZ features to boost performance."] }
      ]
    });
  };

  const removeExperience = (index: number) => {
    const updated = data.experience.filter((_, idx) => idx !== index);
    onChange({ ...data, experience: updated });
  };

  const addBullet = (expIndex: number) => {
    const exp = data.experience[expIndex];
    const updatedBullets = [...exp.bullets, ""];
    updateExperience(expIndex, "bullets", updatedBullets);
  };

  const updateBullet = (expIndex: number, bulletIdx: number, value: string) => {
    const exp = data.experience[expIndex];
    const updatedBullets = [...exp.bullets];
    updatedBullets[bulletIdx] = value;
    updateExperience(expIndex, "bullets", updatedBullets);
  };

  const removeBullet = (expIndex: number, bulletIdx: number) => {
    const exp = data.experience[expIndex];
    const updatedBullets = exp.bullets.filter((_, idx) => idx !== bulletIdx);
    updateExperience(expIndex, "bullets", updatedBullets);
  };

  // Projects Helpers
  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, projects: updated });
  };

  const addProject = () => {
    onChange({
      ...data,
      projects: [...data.projects, { title: "", techStack: "", description: "" }]
    });
  };

  const removeProject = (index: number) => {
    const updated = data.projects.filter((_, idx) => idx !== index);
    onChange({ ...data, projects: updated });
  };

  // Skills Helpers
  const updateSkillsArray = (field: "languages" | "frameworks" | "tools", value: string) => {
    const arr = value.split(",").map(s => s.trim());
    onChange({
      ...data,
      skills: {
        ...data.skills,
        [field]: arr
      }
    });
  };

  // Local helper to scan for lack of numbers/metrics (Fear Psychology reminder)
  const lacksNumbers = (text: string) => {
    if (!text) return true;
    return !/\d+%?|\b(percent|CGPA|CGPA\b)\b/.test(text);
  };

  // Trigger Backend AI Bullet Optimizer Route (Gemini)
  const triggerAiEnhancement = async (expIndex: number) => {
    if (!aiMessyText.trim()) return;
    setAiLoadingIdx(expIndex);
    try {
      const response = await fetch("/api/resume/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: aiMessyText }),
      });
      if (response.ok) {
        const enhancedBullets = await response.json();
        if (Array.isArray(enhancedBullets)) {
          updateExperience(expIndex, "bullets", enhancedBullets);
          setAiMessyText("");
          setActiveAiBox(null);
        }
      }
    } catch (err) {
      console.error("AI enhancement failed:", err);
    } finally {
      setAiLoadingIdx(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
      
      {/* Forms Segment Headers */}
      <div className="flex border-b border-zinc-900 bg-zinc-950/80 p-2 overflow-x-auto space-x-1">
        {[
          { id: "personal", label: "Contact", icon: User },
          { id: "education", label: "Education", icon: GraduationCap },
          { id: "experience", label: "Experience", icon: Briefcase },
          { id: "projects", label: "Projects", icon: FolderGit2 },
          { id: "skills", label: "Skills", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* PERSONAL CONTACT FORM */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={data.personal.fullName}
                onChange={(e) => updatePersonal("fullName", e.target.value)}
                placeholder="Amit Sharma"
                className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                  placeholder="amit@college.edu"
                  className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={data.personal.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={data.personal.linkedin}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={data.personal.github}
                  onChange={(e) => updatePersonal("github", e.target.value)}
                  placeholder="github.com/username"
                  className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* EDUCATION DETAILS FORM */}
        {activeTab === "education" && (
          <div className="space-y-6">
            {data.education.map((edu, idx) => (
              <div key={idx} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl relative space-y-4">
                <button
                  onClick={() => removeEducation(idx)}
                  className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Institution #{idx + 1}
                </h4>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                    College / School Name
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="Delhi Technological University (DTU)"
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Degree & Major
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="B.Tech in Computer Science"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Year / CGPA
                    </label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                      placeholder="8.85 CGPA"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Graduation Period
                  </label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(idx, "year", e.target.value)}
                    placeholder="2022 - 2026"
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addEducation}
              className="w-full py-3 rounded-lg border border-dashed border-zinc-800 text-xs font-bold text-zinc-400 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add College / School</span>
            </button>
          </div>
        )}

        {/* WORK EXPERIENCE DETAILS FORM */}
        {activeTab === "experience" && (
          <div className="space-y-8">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="p-5 bg-zinc-900/20 border border-zinc-900 rounded-xl relative space-y-4">
                <button
                  onClick={() => removeExperience(idx)}
                  className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-2">
                  <span>Job / Internship #{idx + 1}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, "company", e.target.value)}
                      placeholder="InnovateTech Solutions"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Internship Role
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, "role", e.target.value)}
                      placeholder="Backend Engineering Intern"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Duration Period
                  </label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                    placeholder="May 2025 - July 2025"
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                  />
                </div>

                {/* Bullets Input Section */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500">
                    Experience Bullet Points (ATS Safe)
                  </label>
                  
                  {exp.bullets.map((bullet, bIdx) => {
                    const warnNumber = lacksNumbers(bullet);
                    return (
                      <div key={bIdx} className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={bullet}
                            onChange={(e) => updateBullet(idx, bIdx, e.target.value)}
                            placeholder="Developed backend routing features to support client data."
                            className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-2.5 flex-1 text-sm outline-none transition-all"
                          />
                          <button
                            onClick={() => removeBullet(idx, bIdx)}
                            className="text-zinc-600 hover:text-red-500 p-1.5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Fear Psychology Notification reminding to add metrics */}
                        {warnNumber && bullet.trim().length > 15 && (
                          <div className="flex items-center space-x-1.5 text-[10px] text-amber-500 font-bold px-2 py-0.5 rounded bg-amber-950/20 border border-amber-900/20">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Recruiters reject bullets without numbers. Suggest: add metric (e.g. \"latency reduced by 30%\")</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    onClick={() => addBullet(idx)}
                    className="text-xs font-bold text-zinc-500 hover:text-cyan-400 flex items-center space-x-1 py-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                {/* AI Tuning Integration Hub */}
                <div className="border-t border-zinc-900 pt-4 mt-2">
                  {activeAiBox === idx ? (
                    <div className="p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-xl space-y-3">
                      <div className="flex items-center space-x-1 text-xs font-bold text-cyan-400">
                        <Sparkles className="h-4 w-4" />
                        <span>CV⚡BOOST AI Optimizer (Google XYZ Format)</span>
                      </div>
                      <textarea
                        value={aiMessyText}
                        onChange={(e) => setAiMessyText(e.target.value)}
                        placeholder="Paste rough notes: 'I worked on database speed, made queries better, also fixed front page bugs.'"
                        className="bg-zinc-950 border border-zinc-800 focus:border-cyan-400 text-sm p-3 rounded-lg w-full h-20 outline-none text-slate-100 placeholder-zinc-600 transition-all resize-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setActiveAiBox(null);
                            setAiMessyText("");
                          }}
                          className="px-3 py-1.5 text-xs text-zinc-500 font-bold hover:text-zinc-300"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => triggerAiEnhancement(idx)}
                          disabled={aiLoadingIdx === idx || !aiMessyText.trim()}
                          className="px-4 py-1.5 text-xs font-extrabold rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 hover:brightness-110 disabled:opacity-40 transition-all shadow-md flex items-center space-x-1"
                        >
                          {aiLoadingIdx === idx ? (
                            <span className="h-3 w-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3 w-3 text-zinc-950 stroke-[2.5]" />
                          )}
                          <span>Optimize Bullets</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveAiBox(idx)}
                      className="px-3 py-1.5 rounded-lg border border-cyan-900/30 bg-cyan-950/10 text-cyan-400 text-xs font-bold hover:bg-cyan-950/30 transition-all flex items-center space-x-1.5"
                    >
                      <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>Optimize Experience with Gemini AI</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addExperience}
              className="w-full py-3 rounded-lg border border-dashed border-zinc-800 text-xs font-bold text-zinc-400 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Job / Internship</span>
            </button>
          </div>
        )}

        {/* PROJECTS DETAILS FORM */}
        {activeTab === "projects" && (
          <div className="space-y-6">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl relative space-y-4">
                <button
                  onClick={() => removeProject(idx)}
                  className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                  Technical Project #{idx + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(idx, "title", e.target.value)}
                      placeholder="CV⚡BOOST (ATS SaaS Compiler)"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Technology Stack
                    </label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                      placeholder="Next.js, React, Node.js, @react-pdf/renderer"
                      className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                    Project Achievements (Newline separated bullets)
                  </label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    placeholder="Engineered single-column document generator, yielding 98%+ ATS parsability rates.&#10;Integrated Razorpay checkout client endpoints, lowering paywall abandonment rates by 12%."
                    className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm p-3 rounded-lg w-full h-24 outline-none text-slate-100 placeholder-zinc-600 transition-all resize-none"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addProject}
              className="w-full py-3 rounded-lg border border-dashed border-zinc-800 text-xs font-bold text-zinc-400 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Technical Project</span>
            </button>
          </div>
        )}

        {/* TECHNICAL SKILLS DETAILS FORM */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="p-4 bg-cyan-950/10 border border-cyan-900/20 rounded-xl flex items-start space-x-2 mb-2">
              <Lightbulb className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-cyan-300 leading-relaxed">
                <strong>ATS Tip:</strong> Separate keywords with commas. Ensure you incorporate terms from placement job cards (e.g. \"Docker\", \"TypeScript\", \"Redis\"). Do not build complex graphics or stars.
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                Languages (comma separated)
              </label>
              <input
                type="text"
                value={data.skills.languages.join(", ")}
                onChange={(e) => updateSkillsArray("languages", e.target.value)}
                placeholder="JavaScript, TypeScript, Python, SQL, C++"
                className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                Frameworks & Libraries (comma separated)
              </label>
              <input
                type="text"
                value={data.skills.frameworks.join(", ")}
                onChange={(e) => updateSkillsArray("frameworks", e.target.value)}
                placeholder="React, Next.js, Express, Node.js, Tailwind CSS"
                className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                Developer Tools (comma separated)
              </label>
              <input
                type="text"
                value={data.skills.tools.join(", ")}
                onChange={(e) => updateSkillsArray("tools", e.target.value)}
                placeholder="Git, GitHub Actions, Docker, Firebase, AWS"
                className="bg-zinc-900/50 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
