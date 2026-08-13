import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowLeft, Heart, MessageCircle, Loader2, Send, Plus
} from 'lucide-react';

export default function CommunityFeedPage() {
  const { user, handleLogout } = useAuth();
  const { communityId } = useParams();
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedDiscussion, setExpandedDiscussion] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFeed();
  }, [communityId]);

  async function loadFeed() {
    try {
      const data = await api.getCommunityFeed(studentId, communityId);
      setFeed(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDiscussion(e) {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      setMessage('Title and body are required.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.createDiscussion(studentId, communityId, newTitle, newBody);
      if (result.xpAwarded) setMessage('Discussion posted! +15 XP awarded.');
      setNewTitle('');
      setNewBody('');
      setShowNewPost(false);
      await loadFeed();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleLike(discussionId) {
    try {
      const result = await api.toggleLike(studentId, discussionId);
      setFeed((prev) => ({
        ...prev,
        discussions: prev.discussions.map((d) =>
          d.id === discussionId
            ? { ...d, likedByMe: result.liked, likeCount: result.likeCount }
            : d
        ),
      }));
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleExpandComments(discussionId) {
    if (expandedDiscussion === discussionId) {
      setExpandedDiscussion(null);
      return;
    }
    setExpandedDiscussion(discussionId);
    try {
      const data = await api.getComments(studentId, discussionId);
      setComments((prev) => ({ ...prev, [discussionId]: data }));
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handlePostComment(discussionId) {
    if (!commentText.trim()) {
      setMessage('Comment cannot be empty.');
      return;
    }
    try {
      const result = await api.createComment(studentId, discussionId, commentText);
      if (result.xpAwarded) setMessage('Comment posted! +10 XP awarded.');
      setCommentText('');
      const data = await api.getComments(studentId, discussionId);
      setComments((prev) => ({ ...prev, [discussionId]: data }));
      setFeed((prev) => ({
        ...prev,
        discussions: prev.discussions.map((d) =>
          d.id === discussionId ? { ...d, commentCount: d.commentCount + 1 } : d
        ),
      }));
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <AppLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!user) return null;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-4 px-8 sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate('/communities')}
          className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-primary mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Communities</span>
        </button>
        <h1 className="text-xl font-extrabold text-slate-800">{feed?.community?.name}</h1>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          {feed?.community?.memberCount} members · {feed?.community?.skillTag}
        </p>
      </header>

      <main className="p-6 md:p-8 max-w-3xl w-full mx-auto space-y-4">
        {message && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            {message}
          </div>
        )}

        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-primary text-white rounded-2xl font-bold text-xs hover:bg-primary-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Start a Discussion</span>
        </button>

        {showNewPost && (
          <form onSubmit={handleCreateDiscussion} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <input
              type="text"
              placeholder="Discussion title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
            />
            <textarea
              placeholder="Share your question or insight..."
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center space-x-1"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              <span>Post</span>
            </button>
          </form>
        )}

        {feed?.discussions?.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-semibold">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          feed?.discussions?.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">{d.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{d.body}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    {d.author?.name}
                  </span>
                  <span className="text-[10px] text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2 border-t border-slate-50">
                <button
                  onClick={() => handleToggleLike(d.id)}
                  className={`flex items-center space-x-1.5 text-xs font-bold transition-colors ${
                    d.likedByMe ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${d.likedByMe ? 'fill-rose-500' : ''}`} />
                  <span>{d.likeCount}</span>
                </button>
                <button
                  onClick={() => handleExpandComments(d.id)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{d.commentCount}</span>
                </button>
              </div>

              {expandedDiscussion === d.id && (
                <div className="space-y-3 pt-3 border-t border-slate-50">
                  {(comments[d.id] || []).map((c) => (
                    <div key={c.id} className="pl-3 border-l-2 border-indigo-100">
                      <p className="text-xs text-slate-600">{c.body}</p>
                      <span className="text-[10px] font-bold text-slate-400">{c.author?.name}</span>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                    />
                    <button
                      onClick={() => handlePostComment(d.id)}
                      className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </AppLayout>
  );
}
