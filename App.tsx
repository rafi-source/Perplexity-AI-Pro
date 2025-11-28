import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { MessageBubble } from './components/MessageBubble';
import { FocusSelector } from './components/FocusSelector';
import { AttachmentPreview } from './components/AttachmentPreview';
import { Message, ChatSession, FocusMode, ThinkingStep, Attachment } from './types';
import { loadSessions, saveSessions, generateId } from './utils/storage';
import { INITIAL_GREETING } from './constants';
import { generateAnswer } from './services/geminiService';
import { fileToBase64, validateFile } from './utils/fileUtils';
import { ArrowRight, Menu, Paperclip, Plus, Zap } from 'lucide-react';
import { ToggleSwitch } from './components/ToggleSwitch';
import { Helmet } from 'react-helmet-async';

// --- Simulation Scripts ---
// These define what the "Thinking" process looks like in the UI
interface ScriptStep {
    text: string;
    logs: string[];
}

const PRO_MODE_SCRIPT = (query: string): ScriptStep[] => [
    { 
        text: "Initializing Deep Research Kernel...", 
        logs: [
            `[SYS] Setting Thinking Budget: 32,768 tokens`, 
            `[AUTH] Verifying API credentials for Gemini 3 Pro`,
            `[MODE] PURE_DEEP_RESEARCH (Ground Up)`,
            `[NLP] Deconstructing query semantics: "${query.slice(0, 20)}..."`
        ] 
    },
    { 
        text: "First Principles Analysis...", 
        logs: [
            `[LOGIC] Discarding prior assumptions`, 
            `[LOGIC] Identifying fundamental axioms of the query`,
            `[PLAN] Building knowledge graph from scratch`,
            `[PLAN] Strategy: Multi-vector exhaustive search`
        ] 
    },
    { 
        text: "Executing Broad Spectrum Search (Layer 1)...", 
        logs: [
            `[NET] GET google.search?q=${encodeURIComponent(query)}&depth=1`,
            `[NET] Retrieving 25 candidate URLs`,
            `[FILTER] Removing low-authority domains`,
            `[DATA] Parsing metadata from primary sources`
        ] 
    },
    { 
        text: "Deep Reading & Contextual Extraction...", 
        logs: [
            `[CRAWL] Fetching full text from Source #1`,
            `[CRAWL] Fetching full text from Source #2`,
            `[CRAWL] Fetching full text from Source #3`,
            `[LLM] Ingesting 45,000 context tokens`,
            `[NLP] Extracting statistical claims and temporal data`
        ] 
    },
    { 
        text: "Recursive Fact Checking (Layer 2)...", 
        logs: [
            `[VERIFY] Cross-referencing Claim A against Source #4`,
            `[VERIFY] Detecting potential bias in Source #1`,
            `[SEARCH] Executing secondary query for verification`,
            `[NET] GET google.search?q=verify+${encodeURIComponent(query.slice(0,10))}`
        ] 
    },
    { 
        text: "Analyzing Counter-Arguments...", 
        logs: [
            `[LOGIC] Simulating opposing viewpoints`, 
            `[LOGIC] Stress-testing generated hypothesis`,
            `[DATA] Looking for recent contradictions (News/Science)`,
            `[SYS] Resolving conflicting data points`
        ] 
    },
    { 
        text: "Synthesizing Ground-Up Report...", 
        logs: [
            `[DRAFT] structuring arguments from first principles`,
            `[DRAFT] Compiling citation matrix`,
            `[STYLE] Applying academic rigor formatting`,
            `[SYS] Finalizing output generation`
        ] 
    }
];

const FAST_MODE_SCRIPT = (query: string): ScriptStep[] => [
    { text: "Searching the web...", logs: [`[NET] Searching google for "${query.slice(0, 10)}..."`, `[DATA] Retrieving top results`] },
    { text: "Reading sources...", logs: [`[PARSER] Extracting text content`, `[LLM] Processing search snippets`] },
    { text: "Generatng response...", logs: [`[LLM] Synthesizing answer`, `[SYS] Formatting output`] }
];

export default function App() {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Advanced Settings
  const [focusMode, setFocusMode] = useState<FocusMode>(FocusMode.WEB);
  const [isProMode, setIsProMode] = useState(false);
  const [proModel, setProModel] = useState('gemini-3-pro-preview');
  
  // Files
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationController = useRef<AbortController | null>(null);

  // Load sessions on mount
  useEffect(() => {
    const loaded = loadSessions();
    setSessions(loaded);
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isGenerating, attachments]);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const currentMessages = activeSession ? activeSession.messages : [];

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Thread',
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      try {
        const base64 = await fileToBase64(file);
        const newAttachment: Attachment = {
          id: generateId(),
          type: 'image', // simplify for now
          name: file.name,
          mimeType: file.type,
          data: base64
        };
        setAttachments(prev => [...prev, newAttachment]);
        setShowAttachMenu(false);
      } catch (err) {
        console.error("File read error", err);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;

    const userQuery = input.trim();
    const currentAttachments = [...attachments];
    let sessionId = activeSessionId;
    let updatedSessions = [...sessions];

    // Create session if none exists
    if (!sessionId) {
      const titleText = userQuery ? userQuery.slice(0, 30) : "Image Analysis";
      const newSession: ChatSession = {
        id: generateId(),
        title: titleText + (userQuery.length > 30 ? '...' : ''),
        messages: [],
        createdAt: Date.now()
      };
      updatedSessions = [...updatedSessions, newSession];
      sessionId = newSession.id;
      setActiveSessionId(sessionId);
    } else {
        // Update title if it's the first message
        const sessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
        if (updatedSessions[sessionIndex].messages.length === 0) {
             const titleText = userQuery ? userQuery.slice(0, 30) : "Image Analysis";
             updatedSessions[sessionIndex].title = titleText + (userQuery.length > 30 ? '...' : '');
        }
    }

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: userQuery,
      attachments: currentAttachments,
      timestamp: Date.now()
    };

    // Initialize Placeholder Message
    // We start with the first step of our script
    const script = isProMode ? PRO_MODE_SCRIPT(userQuery) : FAST_MODE_SCRIPT(userQuery);
    const initialStep: ThinkingStep = { 
        id: 'init', 
        text: script[0].text, 
        status: 'active', 
        logs: [] 
    };

    const placeholderMsg: Message = {
        id: 'temp-thinking',
        role: 'assistant',
        content: '',
        isThinking: true,
        thinkingSteps: [initialStep],
        timestamp: Date.now(),
        isProMode: isProMode
    };

    // Update State
    const sessionIndex = updatedSessions.findIndex(s => s.id === sessionId);
    updatedSessions[sessionIndex].messages.push(userMsg);
    updatedSessions[sessionIndex].messages.push(placeholderMsg);
    setSessions(updatedSessions);
    setInput('');
    setAttachments([]);
    setIsGenerating(true);

    // --- SIMULATION ENGINE ---
    // This logic runs the "script" to update logs and steps while waiting for API
    let scriptStepIndex = 0;
    let logIndex = 0;
    
    // Pro mode = 1200ms per tick (VERY SLOW) to simulate "10 minute" feel, Fast mode = 300ms
    // This controls how fast the "logs" scroll in the terminal
    const tickRate = isProMode ? 1200 : 300; 

    const simulationInterval = setInterval(() => {
        if (generationController.current?.signal.aborted) {
            clearInterval(simulationInterval);
            return;
        }
        setSessions(prev => {
            const sessIdx = prev.findIndex(s => s.id === sessionId);
            if (sessIdx === -1) return prev;

            const newSess = [...prev];
            const msgs = [...newSess[sessIdx].messages];
            const lastMsg = {...msgs[msgs.length - 1]};

            // Safety check
            if (!lastMsg.isThinking || !lastMsg.thinkingSteps) return prev;

            const currentSteps = [...lastMsg.thinkingSteps];
            const activeStepIdx = currentSteps.findIndex(s => s.status === 'active');
            
            if (activeStepIdx === -1) return prev;

            const activeStep = { ...currentSteps[activeStepIdx] };
            const currentScriptPhase = script[scriptStepIndex];

            // Logic: Add one log at a time
            if (currentScriptPhase && logIndex < currentScriptPhase.logs.length) {
                // Add next log line
                const newLog = currentScriptPhase.logs[logIndex];
                activeStep.logs = [...(activeStep.logs || []), newLog];
                logIndex++;
                
                // Update the step in the array
                currentSteps[activeStepIdx] = activeStep;
            } 
            // If all logs for this phase are done, move to next phase
            else if (scriptStepIndex < script.length - 1) {
                // Mark current as complete
                currentSteps[activeStepIdx] = { ...activeStep, status: 'completed' };
                
                // Start next phase
                scriptStepIndex++;
                logIndex = 0;
                const nextPhase = script[scriptStepIndex];
                
                currentSteps.push({
                    id: `step-${scriptStepIndex}`,
                    text: nextPhase.text,
                    status: 'active',
                    logs: []
                });
            }

            lastMsg.thinkingSteps = currentSteps;
            msgs[msgs.length - 1] = lastMsg;
            newSess[sessIdx].messages = msgs;
            return newSess;
        });
    }, tickRate);

    try {
        generationController.current = new AbortController();
      // Call API
      const history = updatedSessions[sessionIndex].messages
        .filter(m => !m.isThinking)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await generateAnswer(
          userMsg.content, 
          userMsg.attachments || [], 
          focusMode, 
          isProMode, 
          history,
          generationController.current.signal,
          proModel
      );

      if (generationController.current?.signal.aborted) return;

      // Finalize Session with real data
      setSessions(prev => {
        const newSessions = [...prev];
        const idx = newSessions.findIndex(s => s.id === sessionId);
        if (idx !== -1) {
            const msgs = newSessions[idx].messages;
            const lastMsg = msgs[msgs.length - 1];
            
            // Keep the generated steps, but mark all as complete
            const finalSteps = lastMsg.thinkingSteps?.map(s => ({...s, status: 'completed' as const})) || [];
            
            // Ensure "Complete" step exists if script finished early
            if (finalSteps.length > 0 && finalSteps[finalSteps.length-1].text !== "Complete") {
                finalSteps.push({ id: 'done', text: "Complete", status: 'completed', logs: [`[SYS] Output generated successfully`, `[SYS] Latency: ${(Date.now() - lastMsg.timestamp) / 1000}s`] });
            }

            // Replace placeholder with real response
            msgs.pop(); 
            msgs.push({
                id: generateId(),
                role: 'assistant',
                content: response.text,
                sources: response.sources,
                isThinking: false,
                thinkingSteps: finalSteps,
                timestamp: Date.now(),
                isProMode: isProMode
            });
        }
        return newSessions;
      });

    } catch (err) {
      console.error(err);
      if ((err as Error).name === 'AbortError') {
        console.log('Generation stopped by user.');
        // Optionally, update the UI to show that the generation was stopped
        setSessions(prev => {
            const newSessions = [...prev];
            const idx = newSessions.findIndex(s => s.id === sessionId);
            if (idx !== -1) {
                newSessions[idx].messages.pop(); // Remove the thinking message
                newSessions[idx].messages.push({
                    id: generateId(),
                    role: 'assistant',
                    content: "Generation stopped.",
                    timestamp: Date.now()
                });
            }
            return newSessions;
        });
      } else {
        setSessions(prev => {
            const newSessions = [...prev];
            const idx = newSessions.findIndex(s => s.id === sessionId);
            if (idx !== -1) {
                newSessions[idx].messages.pop();
                newSessions[idx].messages.push({
                    id: generateId(),
                    role: 'assistant',
                    content: "I encountered an error while processing. Please try again.",
                    timestamp: Date.now()
                });
            }
            return newSessions;
        });
      }
    } finally {
      clearInterval(simulationInterval);
      setIsGenerating(false);
      generationController.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (generationController.current) {
      generationController.current.abort();
    }
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    if (!activeSessionId) return;

    setSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        const updatedMessages = session.messages.map(msg => {
          if (msg.id === messageId) {
            // If the same feedback is clicked again, reset it to null
            const newFeedback = msg.feedback === feedback ? null : feedback;
            return { ...msg, feedback: newFeedback };
          }
          return msg;
        });
        return { ...session, messages: updatedMessages };
      }
      return session;
    }));
  };

  return (
    <>
      <Helmet>
        <title>{activeSession ? `${activeSession.title} - AI Assistant` : 'Advanced AI Research Assistant'}</title>
        {/* Add your production URL here */}
        <link rel="canonical" href="https://your-production-url-goes-here.com/" />
      </Helmet>
      <div className="flex h-screen bg-background text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        onSelectSession={setActiveSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 flex flex-col h-full relative min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400 mr-4">
            <Menu size={24} />
          </button>
          <span className="font-semibold">Perplexica Lite</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          {!activeSessionId && (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center opacity-0 animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-forwards" style={{animationDelay: '0.1s'}}>
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-black/50">
                 <span className="text-3xl font-serif italic">P</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 text-zinc-100 tracking-tight">
                {INITIAL_GREETING}
              </h1>
              <p className="text-zinc-500 max-w-md mx-auto text-lg">
                Ask anything. I'll search the live web for up-to-date answers and cite my sources.
              </p>
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 pb-32">
            {currentMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} onFeedback={handleFeedback} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 z-20">
          <div className="max-w-3xl mx-auto">
            {isGenerating && (
                <div className="flex justify-center mb-2">
                    <button
                        onClick={handleStopGenerating}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-full text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        Stop Generating
                    </button>
                </div>
            )}
            <div className="relative group">
              
              {/* Toolbar Row */}
              <div className="absolute bottom-full left-0 mb-3 ml-1 flex items-center gap-3">
                <FocusSelector
                    currentMode={focusMode}
                    onSelect={setFocusMode}
                    isProMode={isProMode}
                    proModel={proModel}
                    onProModelChange={setProModel}
                />
                
                {/* Pro Mode Toggle */}
                <ToggleSwitch
                    isChecked={isProMode}
                    onChange={setIsProMode}
                    label="Deep Research"
                    icon={<Zap size={12} className={isProMode ? "fill-current" : ""} />}
                />
              </div>

              <form 
                onSubmit={handleSendMessage}
                className={`relative bg-zinc-800/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${isGenerating ? 'opacity-80 pointer-events-none' : 'hover:border-zinc-600 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500/50'}`}
              >
                {/* Attachment Previews inside the box */}
                <div className="px-3 pt-3">
                    <AttachmentPreview attachments={attachments} onRemove={(id) => setAttachments(prev => prev.filter(a => a.id !== id))} />
                </div>

                <div className="flex items-end p-2 gap-2">
                    {/* Dropdown Menu for Attachments */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowAttachMenu(!showAttachMenu)}
                            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 rounded-xl transition-colors"
                        >
                            <Plus size={20} className={`transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
                        </button>
                        
                        {showAttachMenu && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
                                >
                                    <Paperclip size={16} className="text-cyan-400" />
                                    Upload Image/File
                                </button>
                            </div>
                        )}
                        
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp, image/heic"
                        />
                    </div>

                    <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isProMode ? "Deep Research Query (Ground Up)..." : "Ask anything..."}
                    className="flex-1 bg-transparent text-white py-3 px-2 outline-none placeholder:text-zinc-500 text-lg min-w-0"
                    autoFocus
                    disabled={isGenerating}
                    />
                    
                    <button
                    type="submit"
                    disabled={(!input.trim() && attachments.length === 0) || isGenerating}
                    className={`p-2.5 text-white rounded-xl transition-all disabled:opacity-0 disabled:scale-90 flex-shrink-0 ${isProMode ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                    >
                    {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowRight size={20} />
                    )}
                    </button>
                </div>
              </form>
              
              <div className="text-center mt-3">
                 <p className="text-[10px] text-zinc-600">
                   {isProMode ? "Deep Research Mode active. First Principles analysis may take time." : "Perplexica Lite can make mistakes. Please double-check important information."}
                 </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
    </>
  );
}