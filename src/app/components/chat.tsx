"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Send, UploadCloud } from "lucide-react";

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

export default function GeminiChatWithFile() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const endOfChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    setFileName(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:8000/upload/pdf", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setFileName(file.name);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: `✅ File "${file.name}" uploaded successfully.`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "bot",
            text: "❌ File upload failed. Try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "bot",
          text: "❌ File upload error. Check your connection.",
        },
      ]);
    }
    setUploading(false);
  };

  // Chat handler
  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || loading) return;
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setText("");
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(
          userMessage.text
        )}`
      );
      const data = await res.text();
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: data,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "❌ Failed to get response from chatbot.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col border-none rounded-none shadow-none bg-gradient-to-br from-[#f8fafc] to-[#eaf1fb] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 bg-white border-b">
        <div className="rounded-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] p-1.5"></div>
        <div>
          <div className="font-semibold text-lg tracking-tight">Chat</div>
          <div className="text-xs text-muted-foreground">
            Upload PDF and chat with AI
          </div>
        </div>
      </div>
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center mt-24 text-center text-muted-foreground">
            <div className="text-xl font-semibold mb-2">
              Upload a PDF and start chatting!
            </div>
            <div className="text-sm">How can I help you today?</div>
          </div>
        )}
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <Avatar className="mr-3 w-8 h-8 bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white" />
              )}
              <div
                className={`rounded-xl px-4 py-3 max-w-[70%] text-sm shadow
                  ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-white text-gray-900 border rounded-bl-md"
                  }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <Avatar className="ml-3 w-8 h-8 bg-gradient-to-tr from-[#FBBC05] to-[#EA4335] text-white" />
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 bg-white border max-w-[70%] text-sm shadow animate-pulse">
                 typing…
              </div>
            </div>
          )}
          <div ref={endOfChatRef} />
        </div>
      </div>
      {/* File upload + Input */}
      <div className="flex flex-col gap-2 px-6 py-4 bg-white border-t">
        <label
          className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-dashed hover:bg-accent transition-colors ${
            uploading ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <UploadCloud className="w-6 h-6 text-primary" />
          <span className="font-medium text-sm">
            {uploading
              ? "Uploading..."
              : fileName
              ? `Uploaded: ${fileName}`
              : "Upload PDF"}
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-3 mt-1"
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Message Gemini…"
            className="flex-1 rounded-full bg-[#f1f3f4]"
            autoComplete="off"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full bg-gradient-to-tr from-[#4285F4] to-[#34A853] hover:from-[#4285F4] hover:to-[#FBBC05]"
            disabled={loading || !text.trim()}
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}