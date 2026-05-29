import re

def refine_dashboard():
    file_path = r"c:\Project\src\app\dashboard\page.tsx"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add downloadsRemaining React state
    state_decl = 'const [loading, setLoading] = useState(true);'
    state_replacement = state_decl + '\n  const [downloadsRemaining, setDownloadsRemaining] = useState<number>(0);'
    if 'downloadsRemaining' not in content:
        content = content.replace(state_decl, state_replacement)

    # 2. Update load() function to load downloadsRemaining from Firestore or localStorage
    # Locate the segment where getResume is loaded
    load_segment = """        const res = await getResume(resumeId);
        if (res) {
          setResumeData(res.data || defaultResumeData);
          setAtsScore(res.atsScore || 85);"""
    
    load_replacement = """        const res = await getResume(resumeId);
        let rem = 0;
        if (res) {
          setResumeData(res.data || defaultResumeData);
          setAtsScore(res.atsScore || 85);
          if (res.downloadsRemaining !== undefined) {
            rem = res.downloadsRemaining;
          } else if (res.paymentStatus === "paid") {
            rem = 2;
          }
          setDownloadsRemaining(rem);"""
    
    content = content.replace(load_segment, load_replacement)

    # Update admin/email condition in load()
    admin_segment = """        if (user.email === "admin@cvboost.co") {
          setIsPaid(true);
        } else {
          const paidStatus = await getPaymentStatus(resumeId);
          setIsPaid(prev => prev || paidStatus);
        }"""

    admin_replacement = """        if (user.email === "admin@cvboost.co") {
          setIsPaid(true);
          setDownloadsRemaining(999);
        } else {
          const paidStatus = await getPaymentStatus(resumeId);
          setIsPaid(prev => prev || paidStatus);
          
          // Fallback to check localStorage counters
          const localData = localStorage.getItem(`cv_boost_resume_${resumeId}`);
          if (localData) {
            try {
              const parsed = JSON.parse(localData);
              if (parsed.downloadsRemaining !== undefined) {
                setDownloadsRemaining(parsed.downloadsRemaining);
              } else if (parsed.paymentStatus === "paid") {
                setDownloadsRemaining(2);
              }
            } catch (_) {}
          } else if (res && res.downloadsRemaining !== undefined) {
            setDownloadsRemaining(res.downloadsRemaining);
          } else if (paidStatus) {
            setDownloadsRemaining(2);
          }
        }"""
    
    content = content.replace(admin_segment, admin_replacement)

    # 3. Active payment session monitoring and auto-lock
    check_session_segment = """  // Active payment session monitoring and auto-lock
  useEffect(() => {
    if (isPaid && user && user.email !== "admin@cvboost.co") {
      const checkSession = async () => {
        const active = await getPaymentStatus(resumeId);
        if (!active) {
          setIsPaid(false);
        }
      };
      checkSession();
      const interval = setInterval(checkSession, 10000); // check status every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isPaid, user, resumeId]);"""

    check_session_replacement = """  // Active payment session monitoring and auto-lock
  useEffect(() => {
    if (isPaid && user && user.email !== "admin@cvboost.co") {
      const checkSession = async () => {
        const active = await getPaymentStatus(resumeId);
        if (!active) {
          setIsPaid(false);
          setDownloadsRemaining(0);
        } else {
          // Sync counters
          const res = await getResume(resumeId);
          if (res && res.downloadsRemaining !== undefined) {
            setDownloadsRemaining(res.downloadsRemaining);
          }
        }
      };
      checkSession();
      const interval = setInterval(checkSession, 10000); // check status every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isPaid, user, resumeId]);"""

    content = content.replace(check_session_segment, check_session_replacement)

    # 4. Handle Mock Checkout updates
    mock_pay_segment = """      if (verifyRes.ok) {
        setIsPaid(true);
        await setPaymentStatusPaid(resumeId);
        setPaymentError("");
        setShowMockModal(false);"""

    mock_pay_replacement = """      if (verifyRes.ok) {
        setIsPaid(true);
        setDownloadsRemaining(2);
        await setPaymentStatusPaid(resumeId);
        setPaymentError("");
        setShowMockModal(false);"""

    content = content.replace(mock_pay_segment, mock_pay_replacement)

    # 5. Handle Razorpay Checkout success callbacks
    razorpay_success_segment = """            if (verifyRes.ok) {
              setIsPaid(true);
              setPaymentStatusPaid(resumeId);
              setPaymentError("");
            }"""

    razorpay_success_replacement = """            if (verifyRes.ok) {
              setIsPaid(true);
              setDownloadsRemaining(2);
              setPaymentStatusPaid(resumeId);
              setPaymentError("");
            }"""

    content = content.replace(razorpay_success_segment, razorpay_success_replacement)

    # 6. Logo redirect link wrap
    logo_block = """        {/* Brand header */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm">
          <div className="h-7 w-7 rounded-lg bg-[#1F5C4A] flex items-center justify-center shadow-sm">
            <Zap className="h-4 w-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-[#1C1C1C] font-sans tracking-wide uppercase leading-none">BOOSTCV</span>
            <span className="text-[7.5px] font-black text-[#1F5C4A] font-sans tracking-wider leading-none mt-1.5 uppercase">SaaS Career Platform</span>
          </div>
        </div>"""

    logo_replacement = """        {/* Brand header */}
        <Link href="/" className="flex items-center space-x-2.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-2xl shadow-sm hover:border-[#1F5C4A]/40 hover:bg-stone-100/50 transition-all cursor-pointer">
          <div className="h-7 w-7 rounded-lg bg-[#1F5C4A] flex items-center justify-center shadow-sm">
            <Zap className="h-4 w-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black text-[#1C1C1C] font-sans tracking-wide uppercase leading-none">BOOSTCV</span>
            <span className="text-[7.5px] font-black text-[#1F5C4A] font-sans tracking-wider leading-none mt-1.5 uppercase">SaaS Career Platform</span>
          </div>
        </Link>"""

    content = content.replace(logo_block, logo_replacement)

    # 7. Premium session label updates
    premium_label = """            {isPaid && (
              <span className="text-[9px] font-black bg-[#6B8F71] border border-[#b29358] px-2 py-0.5 rounded text-[#1C1C1C] uppercase tracking-wider hidden sm:inline shadow-sm">
                🔓 Active Premium Session
              </span>
            )}"""

    premium_replacement = """            {isPaid && (
              <span className="text-[9px] font-black bg-[#D6C5A4]/20 border border-[#D6C5A4] px-2 py-0.5 rounded text-[#1F5C4A] uppercase tracking-wider hidden sm:inline shadow-sm">
                🔓 Premium Exports Remaining: {downloadsRemaining}
              </span>
            )}"""

    content = content.replace(premium_label, premium_replacement)

    # 8. Swap TOP (Preview) and BOTTOM (Health Diagnostics Card) in Insights panel
    # We will locate the entire edit tab right panel container rendering from activeTab === "edit"
    # To do this safely, we will extract the HTML preview panel string and the diagnostic stats card string,
    # and swap them directly.
    
    # Locate Diagnostic Stats Header block:
    # Starts around `bg-white border border-stone-200 shadow-sm border border-stone-200 rounded-2xl p-4 md:p-6">`
    # and ends at `{/* Dynamic HTML Document Live Preview Panel */}`
    
    # Let's extract the live preview block and the diagnostic block.
    # To do this perfectly, let's use string indexes or replace the whole container.
    # The right panel outer div starts at line 2620:
    # `{activeTab === "edit" && (`
    # Let's inspect the entire block carefully.
    # Wait, instead of fragile regex parsing of 500 lines, let's write a python replacement using string split.
    
    start_tag = '          {/* Right Contextual Insights Panel (Toggle subtabs Preview vs Resume Health diagnostics on builder tab) */}\n          {activeTab === "edit" && (\n        <div className="w-full lg:w-1/2 p-4 md:p-6 overflow-y-auto bg-white h-full flex flex-col space-y-6">'
    
    end_tag = '        </div>\n      </div>\n      )}\n      </div>\n    </div>'
    
    try:
        parts = content.split(start_tag)
        subparts = parts[1].split(end_tag)
        right_panel_content = subparts[0]
        
        # Inside right_panel_content, we have:
        # 1. {/* Diagnostic Stats Header */} ... </div> (Diagnostic Stats card)
        # 2. {/* Dynamic HTML Document Live Preview Panel */} ... </div> (Preview Card)
        
        diagnostic_marker = '          {/* Diagnostic Stats Header */}'
        preview_marker = '          {/* Dynamic HTML Document Live Preview Panel */}'
        
        diag_part = right_panel_content.split(preview_marker)[0]
        preview_part = right_panel_content.split(preview_marker)[1]
        
        # Clean up diag_part and preview_part
        diag_content = diag_part.replace(diagnostic_marker, '').strip()
        preview_content = preview_marker + '\n' + preview_part.strip()
        
        # Build the swapped content
        # Top gets Preview, Bottom gets Diagnostic Stats Card.
        # We will package the Diagnostic Stats Card as a premium card matching standard layout.
        
        # We want to change the visual styling of the Diagnostic Stats Card to be:
        # `<div className="bg-white border border-stone-200 rounded-2xl p-4 md:p-6 shadow-sm space-y-4 text-left">`
        # Let's modify the outer div of the diagnostic block
        old_diag_div = '<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-stone-200 shadow-sm border border-stone-200 rounded-2xl p-4 md:p-6">'
        new_diag_div = '<div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-stone-200 rounded-2xl p-4 md:p-6 shadow-sm">'
        diag_content = diag_content.replace(old_diag_div, new_diag_div)
        
        swapped_right_panel = f"\n{preview_content}\n\n          {diagnostic_marker}\n          {diag_content}\n"
        
        new_content = parts[0] + start_tag + swapped_right_panel + end_tag + subparts[1]
        content = new_content
        print("Swapped Preview layout (TOP: Preview, BOTTOM: Health Card) successfully.")
    except Exception as e:
        print(f"Error swapping preview layout: {e}")

    # 9. Clean up any remaining cyan neon classes to standard colors
    # Replace cyan button unlock shadows and text elements
    content = content.replace("shadow-[0_0_15px_rgba(6,182,212,0.35)]", "shadow-sm")
    content = content.replace("shadow-[0_0_15px_rgba(6,182,212,0.3)]", "shadow-sm")
    content = content.replace("shadow-[0_0_30px_rgba(6,182,212,0.15)]", "shadow-sm")
    content = content.replace("animate-neon-pulse", "")
    content = content.replace("bg-cyan-500", "bg-[#1F5C4A]")
    content = content.replace("hover:bg-cyan-600", "hover:bg-[#2F7A62]")
    content = content.replace("hover:text-zinc-200", "hover:text-[#1F5C4A]")
    content = content.replace("text-cyan-600", "text-[#1F5C4A]")
    content = content.replace("text-cyan-550", "text-[#1F5C4A]")
    content = content.replace("text-cyan-400", "text-[#1F5C4A]")
    content = content.replace("bg-cyan-950", "bg-stone-50")
    content = content.replace("border-cyan-800", "border-stone-200")
    content = content.replace("text-cyan-400", "text-[#1F5C4A]")
    content = content.replace("text-cyan-500", "text-[#1F5C4A]")
    content = content.replace("marker:text-cyan-500", "marker:text-[#1F5C4A]")
    content = content.replace("from-cyan-500 to-cyan-600", "from-[#1F5C4A] to-[#2F7A62]")
    content = content.replace("to-electric-blue", "bg-[#1F5C4A]")
    content = content.replace("bg-[#6B8F71]", "bg-[#2F7A62]") # sage to secondary
    content = content.replace("text-[#6B8F71]", "text-[#2F7A62]")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("Dashboard modifications complete.")

refine_dashboard()
