"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ChevronLeft, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "B.Tech Placement Support",
    message: ""
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setFormData({ name: "", email: "", subject: "B.Tech Placement Support", message: "" });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="bg-grid-pattern min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-mono">
              CV<span className="text-cyan-400">⚡</span>BOOST
            </span>
          </Link>

          <Link 
            href="/"
            className="px-4 py-2 text-xs font-extrabold rounded-lg bg-zinc-900 border border-zinc-800 text-slate-200 hover:text-white transition-all flex items-center space-x-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10 w-full">
        
        {/* Glow behind header */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-8">
          
          {/* Header Title */}
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 text-[10px] font-bold font-mono tracking-wider uppercase">
              <Mail className="h-3.5 w-3.5" />
              <span>Campus Contact System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Contact Information
            </h1>
            <p className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider">
              Get in touch with the CV⚡BOOST Placements Campaign Support Team
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Direct Contact Details (Left Column) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="glass-panel border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6">
                
                <h3 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
                  Direct Inquiries
                </h3>
                
                <ul className="space-y-6 text-sm text-zinc-400 font-medium">
                  
                  {/* Email Support */}
                  <li className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs uppercase tracking-wider font-mono">Email Support</div>
                      <a href="mailto:support@cvboost.co" className="hover:text-cyan-400 transition-colors">
                        support@cvboost.co
                      </a>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">Average response time: &lt; 4 hours</div>
                    </div>
                  </li>

                  {/* Hot-Line */}
                  <li className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/30 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs uppercase tracking-wider font-mono">Campus Support Call</div>
                      <span className="text-zinc-300">+91 98765 43210</span>
                      <div className="text-[10px] text-zinc-500 mt-1 font-mono">Operational: Mon - Sat, 10 AM - 6 PM</div>
                    </div>
                  </li>

                  {/* HQ Address */}
                  <li className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-800/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs uppercase tracking-wider font-mono">Antigravity HQ</div>
                      <span>
                        HSR Layout Sector 2, 24th Main Road,<br />
                        Bengaluru, Karnataka, 560102<br />
                        India
                      </span>
                    </div>
                  </li>

                </ul>

              </div>

            </div>

            {/* Support Form (Right Column) */}
            <div className="lg:col-span-7">
              <div className="glass-panel border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6">
                
                <h3 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2">
                  Send Campus Support Message
                </h3>

                {success ? (
                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-cyan-400 text-xs font-bold font-mono tracking-wide flex items-center space-x-2.5">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                    <span>Your placement query was logged successfully! We will email you back within 4 hours.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5 font-mono">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Amit Sharma"
                          className="bg-zinc-900/40 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-xl px-4 py-3 w-full text-sm outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5 font-mono">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="amit.sharma@college.edu"
                          className="bg-zinc-900/40 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-xl px-4 py-3 w-full text-sm outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5 font-mono">
                        Support Subject
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-zinc-900/40 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 rounded-xl px-4 py-3 w-full text-sm outline-none transition-all"
                      >
                        <option value="B.Tech Placement Support">B.Tech Placement Support</option>
                        <option value="Refund & Cancellation">Refund & Cancellation Inquiry</option>
                        <option value="Razorpay Transaction Issue">Razorpay Transaction Issue</option>
                        <option value="Resume PDF Rendering Query">Resume PDF Rendering Query</option>
                        <option value="Other Support Query">Other General Inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5 font-mono">
                        Explain Your Request
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please include your Order ID or email if related to a payment..."
                        className="bg-zinc-900/40 border border-zinc-800 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-xl px-4 py-3 w-full text-sm outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:brightness-110 text-zinc-950 font-black text-sm transition-all transform active:scale-98 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center space-x-2"
                    >
                      <span>Submit Query</span>
                    </button>

                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <Footer />

    </div>
  );
}
