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
  AlertTriangle,
  Award
} from "lucide-react";

import { calculateLiveGaps, serializeResumeDataToText } from "@/lib/scoring-engine";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  activeFixState?: any;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange, activeFixState }) => {
  const [activeTab, setActiveTab] = useState<"personal" | "summary" | "education" | "experience" | "projects" | "skills" | "certifications">("personal");
  const [aiLoadingIdx, setAiLoadingIdx] = useState<number | null>(null);
  const [aiMessyText, setAiMessyText] = useState("");
  const [activeAiBox, setActiveAiBox] = useState<number | null>(null);

  const liveGaps = activeFixState ? calculateLiveGaps(data, activeFixState) : null;
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const handleGenerateAiSummary = () => {
    setAiSummaryLoading(true);
    setTimeout(() => {
      const langs = (data.skills.languages || []).slice(0, 3).join(", ");
      const fws = (data.skills.frameworks || []).slice(0, 3).join(", ");
      const proj = data.projects[0]?.title || "software development";
      
      const summaryText = `B.Tech Computer Science student specializing in engineering scalable applications with proficiency in ${langs || "modern programming languages"}. Experienced in leveraging ${fws || "web frameworks"} to build performant features, showcased by developing projects like ${proj}. Passionate about backend architecture and optimal system performance.`;
      
      onChange({
        ...data,
        personal: {
          ...data.personal,
          summary: summaryText
        }
      });
      setAiSummaryLoading(false);
    }, 400);
  };

  const handleXYZRewrite = (expIndex: number, bulletIdx: number, originalText: string) => {
    let suggested = originalText;
    const lower = originalText.toLowerCase();
    if (lower.includes("database") || lower.includes("query") || lower.includes("sql")) {
      suggested = "Optimized relational database queries, reducing response latency by 32% and supporting 10k+ concurrent requests.";
    } else if (lower.includes("api") || lower.includes("backend") || lower.includes("server")) {
      suggested = "Engineered high-throughput REST APIs handling 5M+ daily requests, improving throughput scaling by 25%.";
    } else if (lower.includes("ui") || lower.includes("frontend") || lower.includes("react") || lower.includes("view")) {
      suggested = "Redesigned 8 responsive views using React/Next.js, boosting user engagement sessions by 14%.";
    } else if (lower.includes("cicd") || lower.includes("docker") || lower.includes("deploy") || lower.includes("aws")) {
      suggested = "Configured robust CI/CD deployment pipelines, shortening software release cycles by 40%.";
    } else {
      suggested = originalText + " resulting in a 15% increase in operational efficiency.";
    }
    updateBullet(expIndex, bulletIdx, suggested);
  };

  const handleInjectKeyword = (keyword: string) => {
    const toolsText = (data.skills.tools || []).join(", ");
    const updated = toolsText ? `${toolsText}, ${keyword}` : keyword;
    updateSkillsArray("tools", updated);
  };

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

  // Certifications Helpers
  const updateCertification = (index: number, value: string) => {
    const updated = [...(data.certifications || [])];
    updated[index] = value;
    onChange({ ...data, certifications: updated });
  };

  const addCertification = () => {
    onChange({
      ...data,
      certifications: [...(data.certifications || []), ""]
    });
  };

  const removeCertification = (index: number) => {
    const updated = (data.certifications || []).filter((_, idx) => idx !== index);
    onChange({ ...data, certifications: updated });
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
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl overflow-hidden">
      
      {/* Forms Segment Headers */}
      <div className="flex border-b border-stone-200 bg-white p-2 overflow-x-auto space-x-1">
        {[
          { id: "personal", label: "Contact", icon: User },
          { id: "summary", label: "Summary", icon: Sparkles },
          { id: "education", label: "Education", icon: GraduationCap },
          { id: "experience", label: "Experience", icon: Briefcase },
          { id: "projects", label: "Projects", icon: FolderGit2 },
          { id: "skills", label: "Skills", icon: Layers },
          { id: "certifications", label: "Certifications", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          let decoration = null;
          let glowClass = "";

          if (liveGaps) {
            if (tab.id === "summary" && liveGaps.missingSections.includes("summary")) {
              glowClass = "ring-2 ring-amber-500/50 animate-pulse border-amber-500 bg-amber-50";
              decoration = <span className="h-2 w-2 rounded-full bg-amber-500 ml-1" />;
            } else if (tab.id === "experience" && liveGaps.unquantifiedBullets.length > 0) {
              glowClass = "border-red-500 bg-red-50/10";
              decoration = (
                <span className="ml-1 px-1.5 py-0.25 text-[8px] bg-red-100 text-red-700 font-extrabold rounded-full">
                  ⚠️ {liveGaps.unquantifiedBullets.length}
                </span>
              );
            } else if (tab.id === "skills" && liveGaps.missingKeywords.length > 0) {
              decoration = (
                <span className="ml-1 px-1.5 py-0.25 text-[8px] bg-amber-100 text-amber-700 font-extrabold rounded-full">
                  {liveGaps.missingKeywords.length}
                </span>
              );
            } else if (tab.id === "certifications" && liveGaps.missingSections.includes("certifications")) {
              decoration = <span className="ml-1 text-[8px] text-amber-500 font-extrabold">⚠️</span>;
            }
          }

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap relative ${glowClass} ${
                activeTab === tab.id
                  ? "bg-[#1F5C4A] text-white shadow-sm border border-[#1F5C4A]"
                  : "text-[#6B7280] hover:text-[#1C1C1C]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {decoration}
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
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={data.personal.fullName}
                onChange={(e) => updatePersonal("fullName", e.target.value)}
                placeholder="Amit Sharma"
                className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => updatePersonal("email", e.target.value)}
                  placeholder="amit@college.edu"
                  className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={data.personal.phone}
                  onChange={(e) => updatePersonal("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={data.personal.linkedin}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/username"
                  className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={data.personal.github}
                  onChange={(e) => updatePersonal("github", e.target.value)}
                  placeholder="github.com/username"
                  className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* PROFESSIONAL SUMMARY FORM */}
        {activeTab === "summary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-stone-50 border border-stone-200 rounded-xl p-4">
              <div>
                <h3 className="text-xs font-black text-[#1F5C4A] uppercase tracking-wider font-sans">
                  Professional Summary Draft
                </h3>
                <p className="text-[10px] text-[#6B7280] font-bold">
                  Write a 2-3 line target profile summarizing your stack and major strengths.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiSummary}
                disabled={aiSummaryLoading}
                className="py-1.5 px-3.5 rounded-lg bg-[#1F5C4A] hover:bg-[#18483A] text-white transition-all font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{aiSummaryLoading ? "Drafting..." : "AI Draft"}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                Summary Text
              </label>
              <textarea
                value={data.personal.summary || ""}
                onChange={(e) => onChange({
                  ...data,
                  personal: {
                    ...data.personal,
                    summary: e.target.value
                  }
                })}
                placeholder="E.g., B.Tech Computer Science student specializing in backend architecture, system design, and building scalable Node.js microservices."
                className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-[#9CA3AF] rounded-lg p-3 w-full h-32 text-sm outline-none transition-all resize-none font-sans leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* EDUCATION DETAILS FORM */}
        {activeTab === "education" && (
          <div className="space-y-6">
            {data.education.map((edu, idx) => (
              <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-xl relative space-y-4">
                <button
                  onClick={() => removeEducation(idx)}
                  className="absolute top-4 right-4 text-[#6B7280] hover:text-[#C0392B] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <h4 className="text-xs font-bold text-[#1F5C4A] uppercase tracking-widest">
                  Institution #{idx + 1}
                </h4>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                    College / School Name
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                    placeholder="Delhi Technological University (DTU)"
                    className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                      Degree & Major
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="B.Tech in Computer Science"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                      Year / CGPA
                    </label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(idx, "gpa", e.target.value)}
                      placeholder="8.85 CGPA"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                    Graduation Period
                  </label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(idx, "year", e.target.value)}
                    placeholder="2022 - 2026"
                    className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addEducation}
              className="w-full py-3 rounded-lg border border-dashed border-stone-200 text-xs font-bold text-[#6B7280] hover:border-stone-200 hover:text-[#1F5C4A] transition-all flex items-center justify-center space-x-2"
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
              <div key={idx} className="p-5 bg-stone-50 border border-stone-200 rounded-xl relative space-y-4">
                <button
                  onClick={() => removeExperience(idx)}
                  className="absolute top-4 right-4 text-[#6B7280] hover:text-[#C0392B] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                
                <h4 className="text-xs font-bold text-[#1F5C4A] uppercase tracking-widest flex items-center space-x-2">
                  <span>Job / Internship #{idx + 1}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, "company", e.target.value)}
                      placeholder="InnovateTech Solutions"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                      Internship Role
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(idx, "role", e.target.value)}
                      placeholder="Backend Engineering Intern"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                    Duration Period
                  </label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                    placeholder="May 2025 - July 2025"
                    className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                  />
                </div>

                {/* Bullets Input Section */}
                <div className="space-y-3">
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280]">
                    Experience Bullet Points (Recruiter Safe)
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
                            className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-2.5 flex-1 text-sm outline-none transition-all"
                          />
                          {warnNumber && bullet.trim().length > 10 && (
                            <button
                              type="button"
                              onClick={() => handleXYZRewrite(idx, bIdx, bullet)}
                              title="Auto-quantify using Google XYZ formula"
                              className="text-amber-500 hover:text-amber-600 p-1.5 rounded hover:bg-amber-50 cursor-pointer"
                            >
                              <Lightbulb className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeBullet(idx, bIdx)}
                            className="text-[#6B7280] hover:text-[#C0392B] p-1.5"
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
                    className="text-xs font-bold text-[#6B7280] hover:text-[#1F5C4A] flex items-center space-x-1 py-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                {/* AI Tuning Integration Hub */}
                <div className="border-t border-stone-200 pt-4 mt-2">
                  {activeAiBox === idx ? (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                      <div className="flex items-center space-x-1 text-xs font-bold text-[#1F5C4A]">
                        <Sparkles className="h-4 w-4" />
                        <span>BOOSTCV AI Optimizer (Google XYZ Format)</span>
                      </div>
                      <textarea
                        value={aiMessyText}
                        onChange={(e) => setAiMessyText(e.target.value)}
                        placeholder="Paste rough notes: 'I worked on database speed, made queries better, also fixed front page bugs.'"
                        className="bg-white border border-stone-200 focus:border-stone-200 text-sm p-3 rounded-lg w-full h-20 outline-none text-[#1C1C1C] placeholder-stone-400 transition-all resize-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setActiveAiBox(null);
                            setAiMessyText("");
                          }}
                          className="px-3 py-1.5 text-xs text-[#6B7280] font-bold hover:text-[#6B7280]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => triggerAiEnhancement(idx)}
                          disabled={aiLoadingIdx === idx || !aiMessyText.trim()}
                          className="px-4 py-1.5 text-xs font-extrabold rounded-lg text-white hover:brightness-110 disabled:opacity-40 transition-all shadow-md flex items-center space-x-1"
                        >
                          {aiLoadingIdx === idx ? (
                            <span className="h-3 w-3 border-2 border-stone-200 border-t-transparent rounded-full animate-spin mr-1" />
                          ) : (
                            <Sparkles className="h-3 w-3 text-white stroke-[2.5]" />
                          )}
                          <span>Optimize Bullets</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveAiBox(idx)}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-[#1F5C4A] text-xs font-bold hover:bg-stone-50 transition-all flex items-center space-x-1.5"
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
              className="w-full py-3 rounded-lg border border-dashed border-stone-200 text-xs font-bold text-[#6B7280] hover:border-stone-200 hover:text-[#1F5C4A] transition-all flex items-center justify-center space-x-2"
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
              <div key={idx} className="p-4 bg-stone-50 border border-stone-200 rounded-xl relative space-y-4">
                <button
                  onClick={() => removeProject(idx)}
                  className="absolute top-4 right-4 text-[#6B7280] hover:text-[#C0392B] transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <h4 className="text-xs font-bold text-[#1F5C4A] uppercase tracking-widest">
                  Technical Project #{idx + 1}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                      Project Title
                    </label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => updateProject(idx, "title", e.target.value)}
                      placeholder="BOOSTCV (Resume Intelligence Platform)"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                      Technology Stack
                    </label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                      placeholder="Next.js, React, Node.js, @react-pdf/renderer"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                    Project Achievements (Newline separated bullets)
                  </label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    placeholder="Engineered single-column document generator, yielding 98%+ resume readability rates.&#10;Integrated Razorpay checkout client endpoints, lowering paywall abandonment rates by 12%."
                    className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-sm p-3 rounded-lg w-full h-24 outline-none text-[#1C1C1C] placeholder-stone-400 transition-all resize-none"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addProject}
              className="w-full py-3 rounded-lg border border-dashed border-stone-200 text-xs font-bold text-[#6B7280] hover:border-stone-200 hover:text-[#1F5C4A] transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Technical Project</span>
            </button>
          </div>
        )}

        {/* TECHNICAL SKILLS DETAILS FORM */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-start space-x-2 mb-2">
              <Lightbulb className="h-5 w-5 text-[#1F5C4A] mt-0.5 flex-shrink-0" />
              <div className="text-xs text-[#1F5C4A] leading-relaxed">
                <strong>Resume Tip:</strong> Separate skills with commas. Ensure you incorporate terms from placement job cards (e.g. \"Docker\", \"TypeScript\", \"Redis\"). Do not build complex graphics or stars.
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                Languages (comma separated)
              </label>
              <input
                type="text"
                value={data.skills.languages.join(", ")}
                onChange={(e) => updateSkillsArray("languages", e.target.value)}
                placeholder="JavaScript, TypeScript, Python, SQL, C++"
                className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                Frameworks & Libraries (comma separated)
              </label>
              <input
                type="text"
                value={data.skills.frameworks.join(", ")}
                onChange={(e) => updateSkillsArray("frameworks", e.target.value)}
                placeholder="React, Next.js, Express, Node.js, Tailwind CSS"
                className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-widest text-[#6B7280] mb-1.5">
                Developer Tools (comma separated)
              </label>
              <input
                type="text"
                value={data.skills.tools.join(", ")}
                onChange={(e) => updateSkillsArray("tools", e.target.value)}
                placeholder="Git, GitHub Actions, Docker, Firebase, AWS"
                className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 w-full text-sm outline-none transition-all"
              />
            </div>

            {liveGaps && liveGaps.missingKeywords.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">
                  Suggest to Inject (Click to add to tools):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {liveGaps.missingKeywords.map((kw: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInjectKeyword(kw)}
                      className="px-2.5 py-1 text-[9px] font-sans font-extrabold rounded-md bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-all cursor-pointer shadow-sm"
                    >
                      + {kw}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CERTIFICATIONS FORM */}
        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-[#1C1C1C] uppercase tracking-wider font-sans">
                  Certifications & Accomplishments
                </h3>
                <p className="text-xs text-[#6B7280] font-medium">
                  Add professional licenses, certifications, awards, or key credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={addCertification}
                className="py-2 px-4 rounded-lg bg-stone-50 border border-stone-200 text-[#1F5C4A] hover:bg-[#18483A] transition-colors font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Certification</span>
              </button>
            </div>

            <div className="space-y-3">
              {!(data.certifications && data.certifications.length > 0) ? (
                <div className="text-center py-6 border border-dashed border-stone-200 rounded-xl text-[#6B7280] font-medium text-xs">
                  No certifications added yet. Click above to add!
                </div>
              ) : (
                (data.certifications || []).map((cert, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={cert}
                      onChange={(e) => updateCertification(idx, e.target.value)}
                      placeholder="e.g. AWS Certified Solutions Architect - Associate"
                      className="bg-stone-50 border border-stone-200 focus:border-stone-200 focus:ring-1 focus:ring-[#1F5C4A] text-[#1C1C1C] placeholder-stone-400 rounded-lg p-3 flex-1 text-sm outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertification(idx)}
                      className="p-3 text-[#6B7280] hover:text-[#C0392B] border border-stone-200 hover:border-red-950 rounded-lg bg-stone-50 hover:bg-[#C0392B]/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Fix Completion Center Panel */}
      {liveGaps && (
        <div className="border-t border-stone-200 bg-stone-50 p-4 space-y-3 flex-shrink-0 text-left">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#1C1C1C]">
            <span>Fix Completion Center</span>
            <span className="text-[#1F5C4A]">
              Optimization: {Math.round(
                (( ( (activeFixState.gaps.missingSections || []).length + 
                     (activeFixState.gaps.missingKeywords || []).length + 
                     (activeFixState.gaps.unquantifiedBullets || []).length + 
                     (activeFixState.gaps.formattingErrors || []).length ) - 
                   ( liveGaps.missingSections.length + 
                     liveGaps.missingKeywords.length + 
                     liveGaps.unquantifiedBullets.length + 
                     liveGaps.formattingErrors.length ) ) / 
                 Math.max(1, (activeFixState.gaps.missingSections || []).length + 
                            (activeFixState.gaps.missingKeywords || []).length + 
                            (activeFixState.gaps.unquantifiedBullets || []).length + 
                            (activeFixState.gaps.formattingErrors || []).length)) * 100
              )}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#1F5C4A] h-full transition-all duration-500" 
              style={{
                width: `${Math.max(0, Math.min(100, Math.round(
                  (( ( (activeFixState.gaps.missingSections || []).length + 
                       (activeFixState.gaps.missingKeywords || []).length + 
                       (activeFixState.gaps.unquantifiedBullets || []).length + 
                       (activeFixState.gaps.formattingErrors || []).length ) - 
                     ( liveGaps.missingSections.length + 
                       liveGaps.missingKeywords.length + 
                       liveGaps.unquantifiedBullets.length + 
                       liveGaps.formattingErrors.length ) ) / 
                   Math.max(1, (activeFixState.gaps.missingSections || []).length + 
                              (activeFixState.gaps.missingKeywords || []).length + 
                              (activeFixState.gaps.unquantifiedBullets || []).length + 
                              (activeFixState.gaps.formattingErrors || []).length)) * 100
                )))}%`
              }}
            />
          </div>

          {/* Checklist list */}
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1 text-[9px] font-bold text-[#6B7280]">
            {/* Missing Sections Checklist */}
            {(activeFixState.gaps.missingSections || []).map((sec: string) => {
              const isDone = !liveGaps.missingSections.includes(sec);
              return (
                <div key={`sec-${sec}`} className="flex items-center space-x-2">
                  <input type="checkbox" checked={isDone} readOnly className="rounded text-[#1F5C4A] focus:ring-0 pointer-events-none" />
                  <span className={isDone ? "line-through text-stone-400 font-medium" : "text-[#1C1C1C] font-semibold"}>
                    Add {sec === "personal" ? "Contact Details" : sec.charAt(0).toUpperCase() + sec.slice(1)} Section
                  </span>
                </div>
              );
            })}

            {/* Missing Keywords Checklist */}
            {(activeFixState.gaps.missingKeywords || []).map((kw: string) => {
              const isDone = !liveGaps.missingKeywords.includes(kw);
              return (
                <div key={`kw-${kw}`} className="flex items-center space-x-2">
                  <input type="checkbox" checked={isDone} readOnly className="rounded text-[#1F5C4A] focus:ring-0 pointer-events-none" />
                  <span className={isDone ? "line-through text-stone-400 font-medium" : "text-[#1C1C1C] font-semibold"}>
                    Inject Keyword tag: {kw}
                  </span>
                </div>
              );
            })}

            {/* Unquantified Bullets Checklist */}
            {(activeFixState.gaps.unquantifiedBullets || []).map((b: any, idx: number) => {
              const isStillUnquantified = liveGaps.unquantifiedBullets.some((ub: any) => ub.expIdx === b.expIdx && ub.bulletIdx === b.bulletIdx);
              const isDone = !isStillUnquantified;
              return (
                <div key={`bullet-${idx}`} className="flex items-center space-x-2">
                  <input type="checkbox" checked={isDone} readOnly className="rounded text-[#1F5C4A] focus:ring-0 pointer-events-none" />
                  <span className={isDone ? "line-through text-stone-400 font-medium" : "text-[#1C1C1C] font-semibold"}>
                    Quantify role #{b.expIdx + 1} achievement bullet #{b.bulletIdx + 1}
                  </span>
                </div>
              );
            })}

            {/* Formatting errors Checklist */}
            {(activeFixState.gaps.formattingErrors || []).map((err: string) => {
              const isDone = !liveGaps.formattingErrors.includes(err);
              return (
                <div key={`err-${err}`} className="flex items-center space-x-2">
                  <input type="checkbox" checked={isDone} readOnly className="rounded text-[#1F5C4A] focus:ring-0 pointer-events-none" />
                  <span className={isDone ? "line-through text-stone-400 font-medium" : "text-[#1C1C1C] font-semibold"}>
                    Fix formatting violation: {err === "emoji_usage" ? "Remove emojis" : "Remove graphics stars"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
