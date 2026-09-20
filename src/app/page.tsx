"use client";

import React, { useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Plus, 
  X, 
  ShieldCheck, 
  RefreshCw, 
  Wind,
  PhoneCall
} from "lucide-react";
import { generateIdentity, evaluateSafety, AnonymousIdentity } from "@/lib/safetyAndIdentity";

interface Post {
  id: string;
  handle: string;
  symbol: string;
  category: string;
  supportStyle: string;
  content: string;
  createdAt: string;
  reactions: { grounding: number; feltHeard: number };
  replies: number;
}

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    handle: "GentleBreeze14",
    symbol: "🌿",
    category: "burnout",
    supportStyle: "need_perspective",
    content: "Feeling exhausted trying to keep up with everyone else's timeline. How do you silence the pressure to always do more?",
    createdAt: "10m ago",
    reactions: { grounding: 8, feltHeard: 14 },
    replies: 4,
  },
  {
    id: "2",
    handle: "QuietOak88",
    symbol: "☀️",
    category: "daily_stress",
    supportStyle: "encouragement",
    content: "Just feeling weighed down by routine today. A little kindness would mean the world right now.",
    createdAt: "1h ago",
    reactions: { grounding: 12, feltHeard: 19 },
    replies: 6,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Spaces" },
  { id: "burnout", label: "Work & Burnout" },
  { id: "daily_stress", label: "Daily Stress" },
  { id: "relationships", label: "Relationships" },
];

export default function GentleHearthWeb() {
  const [identity, setIdentity] = useState<AnonymousIdentity | null>(null);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedCat, setSelectedCat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("daily_stress");
  const [supportStyle, setSupportStyle] = useState("need_perspective");
  const [autoExpire, setAutoExpire] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("@hearth_identity");
    if (stored) {
      setIdentity(JSON.parse(stored));
    } else {
      const fresh = generateIdentity();
      setIdentity(fresh);
      localStorage.setItem("@hearth_identity", JSON.stringify(fresh));
    }
  }, []);

  const handleShuffleIdentity = () => {
    const fresh = generateIdentity();
    setIdentity(fresh);
    localStorage.setItem("@hearth_identity", JSON.stringify(fresh));
  };

  const handleReact = (postId: string, type: "grounding" | "feltHeard") => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              reactions: {
                ...p.reactions,
                [type]: p.reactions[type] + 1,
              },
            }
          : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice("");

    const safety = evaluateSafety(content);
    if (!safety.isValid) {
      setErrorNotice(safety.message);
      return;
    }

    if (!content.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      handle: identity?.handle || "QuietSoul",
      symbol: identity?.symbol || "🌿",
      category,
      supportStyle,
      content,
      createdAt: "Just now",
      reactions: { grounding: 0, feltHeard: 0 },
      replies: 0,
    };

    setPosts([newPost, ...posts]);
    setContent("");
    setModalOpen(false);
  };

  const filteredPosts =
    selectedCat === "all" ? posts : posts.filter((p) => p.category === selectedCat);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-semibold text-lg tracking-tight text-teal-800">
              Gentle Hearth
            </span>
          </div>

          {identity && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full">
                <span>{identity.symbol}</span>
                <span className="text-xs font-medium text-slate-700">{identity.handle}</span>
              </div>
              <button
                onClick={handleShuffleIdentity}
                title="Shuffle anonymous pseudonym"
                className="p-1.5 text-slate-400 hover:text-teal-700 transition"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Daily Reflection Banner */}
        <section className="bg-teal-50/70 border border-teal-200 rounded-3xl p-6 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-800 shrink-0">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">
              Today's Gentle Prompt
            </p>
            <p className="text-slate-800 font-medium text-base mt-1 italic">
              "What is one small boundary or kindness you gave yourself today?"
            </p>
          </div>
        </section>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition shrink-0 ${
                selectedCat === cat.id
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Thoughts Feed */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <span className="p-1 rounded-full bg-slate-100">{post.symbol}</span>
                  <span>{post.handle}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400 font-normal">{post.createdAt}</span>
                </div>
                <span className="uppercase text-[10px] tracking-wider font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                  {post.category}
                </span>
              </div>

              <div className="mb-4">
                <span className="inline-block text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-0.5 rounded-full mb-2">
                  {post.supportStyle === "just_venting"
                    ? "🎧 Just Venting"
                    : "💡 Gentle Perspective"}
                </span>
                <p className="text-slate-800 leading-relaxed text-sm">{post.content}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReact(post.id, "grounding")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 text-xs transition"
                  >
                    <span>🌿</span>
                    <span>{post.reactions.grounding}</span>
                  </button>
                  <button
                    onClick={() => handleReact(post.id, "feltHeard")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border border-slate-200 text-xs transition"
                  >
                    <span>🫂</span>
                    <span>{post.reactions.feltHeard}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <MessageCircle size={14} />
                  <span>{post.replies} perspectives</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Free Resources Footnote */}
        <section className="mt-16 text-center border-t border-slate-200 pt-8 pb-12 text-slate-500">
          <p className="text-xs flex items-center justify-center gap-1 mb-2 font-medium">
            <ShieldCheck size={14} className="text-teal-600" /> A zero-pressure peer wellness community.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Not medical care. If in crisis, call or text <span className="font-semibold text-slate-700">988</span> for free, confidential 24/7 support.
          </p>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 bg-teal-700 hover:bg-teal-800 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition flex items-center justify-center z-40"
      >
        <Plus size={24} />
      </button>

      {/* Share a Thought Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-base text-slate-800">Leave a Thought</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {errorNotice && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs whitespace-pre-line">
                {errorNotice}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        category === cat.id
                          ? "bg-teal-700 text-white border-teal-700"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  What do you need right now?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSupportStyle("need_perspective")}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      supportStyle === "need_perspective"
                        ? "border-teal-600 bg-teal-50/50 text-teal-900"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold">💡 Gentle perspective</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Kind reflections</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupportStyle("just_venting")}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      supportStyle === "just_venting"
                        ? "border-teal-600 bg-teal-50/50 text-teal-900"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold">🎧 Just venting</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No advice needed</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
                  Your Reflection
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Take a breath. What's lingering on your mind?"
                  className="w-full text-sm rounded-xl border border-slate-200 p-3.5 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-medium text-slate-700">
                  Dissolve post automatically after 24h
                </span>
                <input
                  type="checkbox"
                  checked={autoExpire}
                  onChange={(e) => setAutoExpire(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-3 rounded-xl text-sm transition"
                >
                  Share to Hearth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}