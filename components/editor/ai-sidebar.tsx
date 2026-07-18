"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, X, Send, FileText, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("architect");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate scroll height cleanly
    textarea.style.height = "auto";
    // Limit between 72px (min) and 160px (max)
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 72), 160);
    textarea.style.height = `${nextHeight}px`;
  }, [inputText]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      sender: "user",
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    // Simulate AI response after 1 second
    setIsGenerating(true);
    setTimeout(() => {
      const botMsg: Message = {
        id: Math.random().toString(36).substring(7),
        sender: "assistant",
        text: `I've received your request: "${userMsg.text}". Under the current development phase (AI Sidebar Shell), design generation backend logic is mocked. I am ready to extend your architecture diagram once integrated!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStarterChipClick = (prompt: string) => {
    setInputText(prompt);
    // Focus the textarea
    textareaRef.current?.focus();
  };

  return (
    <aside
      className="flex flex-col h-full backdrop-blur-md z-40 relative select-none"
      style={{
        width: isOpen ? "320px" : "0px",
        overflow: "hidden",
        borderLeft: isOpen ? "1px solid var(--border-default)" : "none",
        backgroundColor: "rgba(8, 8, 9, 0.95)", // bg-base/95 style surface background
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "width",
      }}
    >
      <div className="flex flex-col h-full w-[320px] p-4 gap-4">
        {/* Header */}
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg"
              style={{
                backgroundColor: "rgba(100, 87, 249, 0.12)", // AI accent dim
              }}
            >
              <Bot
                className="h-4 w-4"
                style={{ color: "var(--accent-ai-text)" }}
              />
            </div>
            <div className="flex flex-col justify-center">
              <span
                className="text-xs font-semibold leading-normal font-sans"
                style={{ color: "var(--text-primary)" }}
              >
                AI Workspace
              </span>
              <span
                className="text-[10px] leading-none"
                style={{ color: "var(--text-muted)" }}
              >
                Collaborate with Ghost AI
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close AI sidebar"
            className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabbed Layout */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList
            className="flex w-full items-center p-0.5 rounded-lg shrink-0"
            style={{ backgroundColor: "var(--bg-elevated)", width: "100%" }}
          >
            <TabsTrigger
              value="architect"
              className="flex-1 text-xs py-1.5 transition-colors data-active:bg-[var(--bg-subtle)] data-active:text-[var(--text-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 text-xs py-1.5 transition-colors data-active:bg-[var(--bg-subtle)] data-active:text-[var(--text-primary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          {/* AI Architect Tab Panel */}
          <TabsContent
            value="architect"
            className="flex-1 flex flex-col min-h-0 m-0 mt-3 outline-none justify-between"
          >
            {messages.length === 0 ? (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-4 overflow-y-auto min-h-0">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-2xl border shrink-0"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <Bot
                    className="h-6 w-6"
                    style={{ color: "var(--accent-ai-text)" }}
                  />
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <h3
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Ghost AI Assistant
                  </h3>
                  <p
                    className="text-[11px] leading-relaxed max-w-[220px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Describe a system architecture or nodes to design, and AI will map it on the canvas.
                  </p>
                </div>

                {/* Starter Prompts */}
                <div className="flex flex-col gap-2 w-full mt-2 shrink-0">
                  <span
                    className="text-[10px] font-semibold text-left uppercase tracking-wider"
                    style={{ color: "var(--text-faint)" }}
                  >
                    Starter Prompts
                  </span>
                  {[
                    "Design an e-commerce backend",
                    "Create a chat app architecture",
                    "Build a CI/CD pipeline",
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStarterChipClick(prompt)}
                      className="text-xs text-left px-3 py-2 rounded-xl border transition-all text-xs font-sans font-medium"
                      style={{
                        backgroundColor: "var(--bg-subtle)",
                        borderColor: "var(--border-default)",
                        color: "var(--accent-ai-text)",
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Chat Area */
              <ScrollArea className="flex-1 pr-1.5 min-h-0">
                <div className="flex flex-col gap-3.5 py-1">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] p-3 rounded-2xl border text-xs font-sans leading-relaxed ${
                        msg.sender === "user"
                          ? "self-end rounded-tr-sm"
                          : "self-start rounded-tl-sm"
                      }`}
                      style={
                        msg.sender === "user"
                          ? {
                              backgroundColor: "var(--accent-primary-dim)",
                              borderColor: "rgba(0, 200, 212, 0.5)",
                              color: "var(--text-primary)",
                            }
                          : {
                              backgroundColor: "var(--bg-elevated)",
                              borderColor: "var(--border-default)",
                              color: "var(--accent-ai-text)",
                            }
                      }
                    >
                      {msg.text}
                    </div>
                  ))}

                  {/* Thinking Loader */}
                  {isGenerating && (
                    <div
                      className="flex items-center gap-2 self-start max-w-[85%] p-3 rounded-2xl rounded-tl-sm border text-xs font-sans"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border-default)",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--accent-ai-text)" }} />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>
              </ScrollArea>
            )}

            {/* Input Form */}
            <div
              className="mt-auto pt-3 flex flex-col gap-2 shrink-0 pb-1"
              style={{ borderTop: "1px solid var(--border-default)" }}
            >
              <div className="relative flex flex-col">
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Ghost AI to design..."
                  className="w-full text-xs bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl resize-none outline-none focus-visible:border-[var(--accent-ai)] focus-visible:ring-1 focus-visible:ring-[var(--accent-ai)] placeholder:text-[var(--text-faint)]"
                  style={{
                    paddingLeft: "12px",
                    paddingRight: "44px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    minHeight: "72px",
                    maxHeight: "160px",
                    color: "var(--text-primary)",
                    lineHeight: "1.4",
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isGenerating}
                  size="icon-xs"
                  className="absolute right-2 bottom-2 rounded-lg w-7 h-7 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--accent-ai)",
                    color: "white",
                  }}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Specs Tab Panel */}
          <TabsContent
            value="specs"
            className="flex-1 flex flex-col min-h-0 m-0 mt-3 outline-none gap-4"
          >
            {/* Generate button */}
            <Button
              className="w-full h-9 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              style={{
                backgroundColor: "var(--accent-ai)",
                color: "white",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Spec
            </Button>

            {/* Demo Spec Card */}
            <div className="flex flex-col gap-2">
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-faint)" }}
              >
                Saved Specifications
              </span>

              <div
                className="p-3.5 rounded-2xl border flex flex-col gap-3 transition-all hover:border-[var(--border-subtle)]"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-default)",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ backgroundColor: "var(--bg-subtle)" }}
                  >
                    <FileText
                      className="h-4.5 w-4.5"
                      style={{ color: "var(--accent-primary)" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-xs font-semibold truncate leading-normal"
                      style={{ color: "var(--text-primary)" }}
                    >
                      E-commerce Architecture Spec
                    </h4>
                    <span
                      className="text-[9px]"
                      style={{ color: "var(--text-faint)" }}
                    >
                      Last generated: 2 mins ago
                    </span>
                  </div>
                </div>

                <p
                  className="text-xs leading-relaxed line-clamp-3"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Technical specification describing a high-performance e-commerce backend system with Redis cache, Postgres DB, and Stripe payment gateway integration.
                </p>

                <Button
                  disabled
                  variant="ghost"
                  size="xs"
                  className="w-full h-7 border border-[var(--border-default)] disabled:opacity-40 disabled:cursor-not-allowed text-xs flex items-center justify-center gap-1.5 mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Download className="h-3 w-3" />
                  Download Spec (Markdown)
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
