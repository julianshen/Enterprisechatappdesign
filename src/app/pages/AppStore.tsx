import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Search, Star, Download, CheckCircle2, ArrowLeft, Shield, X,
  ChevronRight, ExternalLink, Puzzle, Grid3X3, List,
  HelpCircle, MessageCircle, Send, ThumbsUp, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  appCatalog, appCategories, getInstalledSpaces,
  type AppIntegration, type AppCategory,
} from '../data/appData';
import { spaces } from '../data/mockData';

// ─── Category colors ───
const catColors: Record<AppCategory, { bg: string; text: string; border: string }> = {
  DevOps:             { bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', text: 'text-[#0078d4] dark:text-[#6cb8f6]', border: 'border-[#0078d4]/20' },
  'Project Management': { bg: 'bg-[#eeeef8] dark:bg-[#5b5fc7]/15', text: 'text-[#5b5fc7] dark:text-[#a6a9dc]', border: 'border-[#5b5fc7]/20' },
  Productivity:       { bg: 'bg-[#edf7f0] dark:bg-[#237b4b]/15', text: 'text-[#237b4b] dark:text-[#57ab5a]', border: 'border-[#237b4b]/20' },
  Design:             { bg: 'bg-[#fdf0f2] dark:bg-[#c4314b]/15', text: 'text-[#c4314b] dark:text-[#f47067]', border: 'border-[#c4314b]/20' },
  Communication:      { bg: 'bg-[#ecf5fe] dark:bg-[#0078d4]/15', text: 'text-[#0078d4] dark:text-[#6cb8f6]', border: 'border-[#0078d4]/20' },
  Analytics:          { bg: 'bg-[#f3eef9] dark:bg-[#8764b8]/15', text: 'text-[#8764b8] dark:text-[#c49ded]', border: 'border-[#8764b8]/20' },
  Security:           { bg: 'bg-[#fef7ec] dark:bg-[#d4820c]/15', text: 'text-[#d4820c] dark:text-[#f0b850]', border: 'border-[#d4820c]/20' },
  AI:                 { bg: 'bg-[#edf7f0] dark:bg-[#10A37F]/15', text: 'text-[#10A37F] dark:text-[#57dba8]', border: 'border-[#10A37F]/20' },
};

function formatInstalls(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

// ─── Mock reviews data ───
interface AppReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

function getMockReviews(appId: string): AppReview[] {
  const base: AppReview[] = [
    { id: 'r1', author: 'Sarah M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', rating: 5, comment: 'Absolutely essential integration. Our team productivity went through the roof after installing this. The real-time notifications and rich link previews are game changers.', date: 'Feb 10, 2026', helpful: 12 },
    { id: 'r2', author: 'David K.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', rating: 4, comment: 'Great app overall. The setup was straightforward and the features work as advertised. Would love to see more granular notification controls in a future update.', date: 'Feb 5, 2026', helpful: 8 },
    { id: 'r3', author: 'Lisa R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', rating: 5, comment: 'Been using this for 3 months now. Reliable, well-designed, and the developer is responsive to feedback. Highly recommended for any team.', date: 'Jan 28, 2026', helpful: 15 },
    { id: 'r4', author: 'Mike T.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', rating: 3, comment: 'Decent integration but had some issues with webhook delivery during peak hours. Support was helpful in resolving it. Rating may change after the fix is confirmed.', date: 'Jan 20, 2026', helpful: 4 },
    { id: 'r5', author: 'Emily W.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', rating: 5, comment: 'This is exactly what our team needed. The assistant bot is incredibly useful and saves us hours of context switching every week.', date: 'Jan 15, 2026', helpful: 21 },
  ];
  const hash = appId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return base.slice(0, 3 + (hash % 3)).sort((a, b) => (hash % 2 === 0 ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)));
}

function getMockFAQs(_appId: string): { q: string; a: string }[] {
  return [
    { q: 'How do I connect my account?', a: 'Go to the app Settings tab after installation, enter your credentials or API key, and click Save. The integration will automatically sync within a few minutes.' },
    { q: 'Can I use this in multiple spaces?', a: 'Yes! You can install and configure this app independently in each space. Each space has its own settings and notification channels.' },
    { q: 'What happens to my data if I uninstall?', a: 'Uninstalling removes webhooks and stops notifications, but any messages or files shared through the integration remain in your channels. No external data is deleted.' },
    { q: 'How do I customize notifications?', a: 'Open the app Settings tab and look for notification toggle options. You can choose which events trigger notifications and select specific channels for different alert types.' },
    { q: 'Is there a rate limit for API calls?', a: 'The integration respects the third-party API rate limits. For most apps, this is well within normal usage. Check the developer documentation for specific limits.' },
  ];
}

// ─── Reviews Section Component ───
function ReviewsSection({ app }: { app: AppIntegration }) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<AppReview[]>(() => getMockReviews(app.id));
  const [submitted, setSubmitted] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
    return dist;
  }, [reviews]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return app.rating;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews, app.rating]);

  const handleSubmit = () => {
    if (!userRating || !reviewText.trim()) return;
    const newReview: AppReview = {
      id: `user-${Date.now()}`,
      author: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      rating: userRating,
      comment: reviewText.trim(),
      date: 'Just now',
      helpful: 0,
    };
    setReviews(prev => [newReview, ...prev]);
    setSubmitted(true);
    setReviewText('');
    setUserRating(0);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const toggleHelpful = (id: string) => {
    setHelpfulIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setReviews(prev => prev.map(r =>
      r.id === id ? { ...r, helpful: helpfulIds.has(id) ? r.helpful - 1 : r.helpful + 1 } : r
    ));
  };

  return (
    <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
        <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
          <MessageCircle size={15} className="text-[#5b5fc7]" />
          Ratings & Reviews
        </h3>
      </div>
      <div className="p-5 space-y-6">
        {/* Rating Overview */}
        <div className="flex gap-8 items-start">
          <div className="text-center shrink-0">
            <div className="text-4xl font-black text-[#242424] dark:text-[#f0f0f0]">{avgRating.toFixed(1)}</div>
            <div className="flex items-center gap-0.5 justify-center mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-[#d4820c] fill-[#d4820c]' : 'text-[#e1dfdd] dark:text-[#3d3d3d]'} />
              ))}
            </div>
            <p className="text-[11px] text-[#8a8a8a] mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratingDist[star - 1];
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-[#616161] dark:text-[#8a8a8a] w-3 text-right">{star}</span>
                  <Star size={10} className="text-[#d4820c] fill-[#d4820c] shrink-0" />
                  <div className="flex-1 h-2 bg-[#f0f0f0] dark:bg-[#333] rounded-full overflow-hidden">
                    <div className="h-full bg-[#d4820c] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-[#8a8a8a] w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Write Review */}
        <div className="border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl p-4">
          <h4 className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0] mb-3">Write a Review</h4>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-xs text-[#616161] dark:text-[#8a8a8a] mr-2">Your rating:</span>
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setUserRating(s)} className="transition-transform hover:scale-110">
                <Star size={22} className={`transition-colors ${s <= (hoverRating || userRating) ? 'text-[#d4820c] fill-[#d4820c]' : 'text-[#e1dfdd] dark:text-[#3d3d3d]'}`} />
              </button>
            ))}
          </div>
          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience with this app..." rows={3} className="w-full px-3 py-2.5 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all resize-none" />
          <div className="flex items-center justify-between mt-2">
            {submitted ? (
              <span className="text-xs text-[#237b4b] dark:text-[#57ab5a] font-medium flex items-center gap-1"><CheckCircle2 size={13} /> Review submitted!</span>
            ) : (
              <span className="text-[10px] text-[#8a8a8a]">{userRating > 0 ? `${userRating}/5 stars selected` : 'Select a rating'}</span>
            )}
            <button onClick={handleSubmit} disabled={!userRating || !reviewText.trim()} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${userRating && reviewText.trim() ? 'bg-[#5b5fc7] hover:bg-[#4f52b5] text-white shadow-sm' : 'bg-[#f0f0f0] dark:bg-[#333] text-[#b9bbbe] cursor-not-allowed'}`}>
              <Send size={13} /> Submit
            </button>
          </div>
        </div>
        {/* Review List */}
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b border-[#f0f0f0] dark:border-[#333] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <img src={review.avatar} alt={review.author} className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0]">{review.author}</span>
                    <span className="text-[11px] text-[#8a8a8a]">{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={11} className={s <= review.rating ? 'text-[#d4820c] fill-[#d4820c]' : 'text-[#e1dfdd] dark:text-[#3d3d3d]'} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#424242] dark:text-[#c8c8c8] ml-11">{review.comment}</p>
              <div className="ml-11 mt-2">
                <button onClick={() => toggleHelpful(review.id)} className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors ${helpfulIds.has(review.id) ? 'bg-[#5b5fc7]/10 text-[#5b5fc7] dark:bg-[#5b5fc7]/20 dark:text-[#a6a9dc]' : 'text-[#8a8a8a] hover:bg-[#f0f0f0] dark:hover:bg-[#333] hover:text-[#424242] dark:hover:text-[#c8c8c8]'}`}>
                  <ThumbsUp size={11} /> Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Help Section Component ───
function HelpSection({ app }: { app: AppIntegration }) {
  const faqs = useMemo(() => getMockFAQs(app.id), [app.id]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [helpQuestion, setHelpQuestion] = useState('');
  const [helpSubmitted, setHelpSubmitted] = useState(false);

  const handleAskHelp = () => {
    if (!helpQuestion.trim()) return;
    setHelpSubmitted(true);
    setHelpQuestion('');
    setTimeout(() => setHelpSubmitted(false), 4000);
  };

  return (
    <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8] dark:bg-[#1e1f22]">
        <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] flex items-center gap-2">
          <HelpCircle size={15} className="text-[#0078d4]" />
          Help & Support
        </h3>
      </div>
      <div className="p-5 space-y-6">
        {/* FAQ */}
        <div>
          <h4 className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0] mb-3">Frequently Asked Questions</h4>
          <div className="space-y-1">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-colors">
                  <span className="text-sm text-[#242424] dark:text-[#e0e0e0] font-medium pr-4">{faq.q}</span>
                  {expandedFaq === i ? <ChevronUp size={16} className="text-[#5b5fc7] shrink-0" /> : <ChevronDown size={16} className="text-[#8a8a8a] shrink-0" />}
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-3 text-sm text-[#616161] dark:text-[#b9bbbe] border-t border-[#f0f0f0] dark:border-[#333] bg-[#faf9f8]/50 dark:bg-[#1e1f22]/50">
                    <p className="pt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Ask for Help */}
        <div className="border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-xl p-4">
          <h4 className="text-sm font-medium text-[#242424] dark:text-[#f0f0f0] mb-1">Need more help?</h4>
          <p className="text-xs text-[#8a8a8a] mb-3">Ask a question and our support team will get back to you.</p>
          <textarea value={helpQuestion} onChange={e => setHelpQuestion(e.target.value)} placeholder="Describe your issue or question..." rows={3} className="w-full px-3 py-2.5 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all resize-none" />
          <div className="flex items-center justify-between mt-2">
            {helpSubmitted ? (
              <span className="text-xs text-[#237b4b] dark:text-[#57ab5a] font-medium flex items-center gap-1"><CheckCircle2 size={13} /> Question submitted! We'll respond shortly.</span>
            ) : (
              <span className="text-[10px] text-[#8a8a8a]">Typically responds within 24 hours</span>
            )}
            <button onClick={handleAskHelp} disabled={!helpQuestion.trim()} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${helpQuestion.trim() ? 'bg-[#0078d4] hover:bg-[#006abc] text-white shadow-sm' : 'bg-[#f0f0f0] dark:bg-[#333] text-[#b9bbbe] cursor-not-allowed'}`}>
              <Send size={13} /> Ask
            </button>
          </div>
        </div>
        {/* Support Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#ecf5fe] dark:bg-[#0078d4]/15 flex items-center justify-center"><ExternalLink size={14} className="text-[#0078d4]" /></div>
            <div><p className="text-xs font-medium text-[#242424] dark:text-[#e0e0e0] group-hover:text-[#5b5fc7] transition-colors">Documentation</p><p className="text-[10px] text-[#8a8a8a]">Full setup guides</p></div>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#eeeef8] dark:bg-[#5b5fc7]/15 flex items-center justify-center"><MessageCircle size={14} className="text-[#5b5fc7]" /></div>
            <div><p className="text-xs font-medium text-[#242424] dark:text-[#e0e0e0] group-hover:text-[#5b5fc7] transition-colors">Community</p><p className="text-[10px] text-[#8a8a8a]">Forum & discussions</p></div>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30 hover:bg-[#faf9f8] dark:hover:bg-[#2a2a2a] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#fef7ec] dark:bg-[#d4820c]/15 flex items-center justify-center"><HelpCircle size={14} className="text-[#d4820c]" /></div>
            <div><p className="text-xs font-medium text-[#242424] dark:text-[#e0e0e0] group-hover:text-[#5b5fc7] transition-colors">Contact Dev</p><p className="text-[10px] text-[#8a8a8a]">{app.developer}</p></div>
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── App Card ───
function AppCard({ app, onClick }: { app: AppIntegration; onClick: () => void }) {
  const installedIn = getInstalledSpaces(app.id);
  const cat = catColors[app.category];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-4 hover:shadow-lg hover:border-[#5b5fc7]/30 dark:hover:border-[#5b5fc7]/40 transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-xl shrink-0 shadow-sm">
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#242424] dark:text-[#f0f0f0] text-sm truncate group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{app.name}</h3>
            {app.verified && <CheckCircle2 size={13} className="text-[#0078d4] dark:text-[#6cb8f6] shrink-0" />}
          </div>
          <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{app.developer}</p>
        </div>
      </div>

      <p className="text-xs text-[#424242] dark:text-[#c8c8c8] mb-3 line-clamp-2">{app.shortDescription}</p>

      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
          {app.category}
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-[#d4820c] fill-[#d4820c]" />
            <span className="text-[11px] text-[#616161] dark:text-[#8a8a8a] font-medium">{app.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={11} className="text-[#8a8a8a] dark:text-[#6d6f78]" />
            <span className="text-[11px] text-[#616161] dark:text-[#8a8a8a]">{formatInstalls(app.installs)}</span>
          </div>
          {installedIn.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]">
              Installed · {installedIn.length}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── App Detail View ───
function AppDetailView({ app, onBack }: { app: AppIntegration; onBack: () => void }) {
  const installedIn = getInstalledSpaces(app.id);
  const cat = catColors[app.category];
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Top Bar */}
      <div className="shrink-0 px-6 pt-4 pb-3 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-[#616161] dark:text-[#8a8a8a] hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] transition-colors mb-3"
        >
          <ArrowLeft size={16} />
          Back to App Store
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-3xl shrink-0 shadow-sm">
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">{app.name}</h1>
              {app.verified && (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#ecf5fe] dark:bg-[#0078d4]/15 text-[#0078d4] dark:text-[#6cb8f6]">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
            </div>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a] mb-2">{app.developer} · v{app.version}</p>
            <div className="flex items-center gap-4">
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>{app.category}</span>
              <div className="flex items-center gap-1">
                <Star size={13} className="text-[#d4820c] fill-[#d4820c]" />
                <span className="text-sm text-[#424242] dark:text-[#c8c8c8] font-medium">{app.rating}</span>
              </div>
              <span className="text-sm text-[#616161] dark:text-[#8a8a8a]">{formatInstalls(app.installs)} installs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Install Status */}
          {installedIn.length > 0 && (
            <div className="bg-[#edf7f0] dark:bg-[#237b4b]/10 border border-[#237b4b]/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-[#237b4b] dark:text-[#57ab5a]" />
                <span className="font-semibold text-sm text-[#237b4b] dark:text-[#57ab5a]">
                  Installed in {installedIn.length} space{installedIn.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {installedIn.map(sid => {
                  const space = spaces.find(s => s.id === sid);
                  return space ? (
                    <Link
                      key={sid}
                      to={`/space/${sid}/apps/${app.id}`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#252525] border border-[#237b4b]/15 text-sm text-[#242424] dark:text-[#e0e0e0] hover:border-[#5b5fc7]/40 transition-colors"
                    >
                      <span>{space.icon}</span>
                      <span>{space.name}</span>
                      <ChevronRight size={12} className="text-[#8a8a8a]" />
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Add to Space */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-4">
            <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] mb-3">Add to Space</h3>
            <div className="flex flex-wrap gap-2">
              {spaces.map(space => {
                const isInstalled = installedIn.includes(space.id);
                return (
                  <button
                    key={space.id}
                    onClick={() => {
                      if (isInstalled) {
                        navigate(`/space/${space.id}/apps/${app.id}`);
                      }
                    }}
                    disabled={isInstalled}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      isInstalled
                        ? 'bg-[#edf7f0] dark:bg-[#237b4b]/10 border-[#237b4b]/20 text-[#237b4b] dark:text-[#57ab5a] cursor-pointer hover:border-[#237b4b]/40'
                        : 'bg-white dark:bg-[#2a2a2a] border-[#e1dfdd] dark:border-[#3d3d3d] text-[#424242] dark:text-[#c8c8c8] hover:border-[#5b5fc7]/40 hover:text-[#5b5fc7] dark:hover:text-[#a6a9dc] cursor-pointer'
                    }`}
                  >
                    <span>{space.icon}</span>
                    <span>{space.name}</span>
                    {isInstalled ? <CheckCircle2 size={14} /> : <Puzzle size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
            <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] mb-3">About</h3>
            <div className="text-sm text-[#424242] dark:text-[#c8c8c8] whitespace-pre-wrap">{app.longDescription}</div>
          </div>

          {/* Features + Permissions side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
              <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] mb-3">Features</h3>
              <ul className="space-y-2">
                {app.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#424242] dark:text-[#c8c8c8]">
                    <CheckCircle2 size={14} className="text-[#237b4b] dark:text-[#57ab5a] shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
              <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] mb-3 flex items-center gap-2">
                <Shield size={14} className="text-[#d4820c] dark:text-[#f0b850]" />
                Permissions Required
              </h3>
              <ul className="space-y-2">
                {app.permissions.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#424242] dark:text-[#c8c8c8]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d4820c] dark:bg-[#f0b850] mt-1.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Configuration Preview */}
          {app.configFields && app.configFields.length > 0 && (
            <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] p-5">
              <h3 className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] mb-1">Configuration Options</h3>
              <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] mb-3">These settings can be customized per space after installation.</p>
              <div className="space-y-3">
                {app.configFields.map(f => (
                  <div key={f.id} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] dark:border-[#333] last:border-0">
                    <div>
                      <p className="text-sm text-[#242424] dark:text-[#e0e0e0]">{f.label}</p>
                      {f.helpText && <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{f.helpText}</p>}
                    </div>
                    <span className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78] font-medium capitalize px-2 py-0.5 rounded bg-[#f0f0f0] dark:bg-[#333]">{f.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <ReviewsSection app={app} />

          {/* Help Section */}
          <HelpSection app={app} />
        </div>
      </div>
    </div>
  );
}

// ─── Main App Store Page ───
export function AppStore() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory | 'All'>('All');
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return appCatalog.filter(app => {
      const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.shortDescription.toLowerCase().includes(search.toLowerCase()) || app.developer.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'All' || app.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  if (selectedApp) {
    return <AppDetailView app={selectedApp} onBack={() => setSelectedApp(null)} />;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#faf9f8] dark:bg-[#1f1f1f] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-[#252525] border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b5fc7] to-[#7b7dd8] flex items-center justify-center shadow-sm">
              <Puzzle size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#242424] dark:text-[#f0f0f0]">App Store</h1>
              <p className="text-xs text-[#616161] dark:text-[#8a8a8a]">{appCatalog.length} integrations available</p>
            </div>
          </div>
        </div>

        {/* Search + Controls */}
        <div className="px-6 pb-3 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="w-full pl-9 pr-8 py-2 bg-[#f0f0f0] dark:bg-[#1e1f22] rounded-lg text-sm text-[#242424] dark:text-[#e0e0e0] placeholder-[#8a8a8a] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#424242]">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center bg-[#f0f0f0] dark:bg-[#1e1f22] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-[#333] shadow-sm text-[#5b5fc7]' : 'text-[#8a8a8a] hover:text-[#424242]'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-[#333] shadow-sm text-[#5b5fc7]' : 'text-[#8a8a8a] hover:text-[#424242]'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pb-2 flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'All'
                ? 'bg-[#5b5fc7] text-white shadow-sm'
                : 'text-[#616161] dark:text-[#8a8a8a] hover:bg-[#e8e8e8] dark:hover:bg-[#333]'
            }`}
          >
            All
          </button>
          {appCategories.map(cat => {
            const count = appCatalog.filter(a => a.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#5b5fc7] text-white shadow-sm'
                    : 'text-[#616161] dark:text-[#8a8a8a] hover:bg-[#e8e8e8] dark:hover:bg-[#333]'
                }`}
              >
                {cat} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Grid / List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search size={32} className="text-[#d1d1d1] dark:text-[#3d3d3d] mb-3" />
            <p className="text-[#242424] dark:text-[#f0f0f0] font-medium mb-1">No apps found</p>
            <p className="text-sm text-[#616161] dark:text-[#8a8a8a]">Try a different search term or category.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(app => (
              <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(app => {
              const installedIn = getInstalledSpaces(app.id);
              const cat = catColors[app.category];
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="w-full text-left bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] px-4 py-3 hover:shadow-md hover:border-[#5b5fc7]/30 transition-all flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-xl shrink-0">
                    {app.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#242424] dark:text-[#f0f0f0] group-hover:text-[#5b5fc7] dark:group-hover:text-[#a6a9dc] transition-colors">{app.name}</span>
                      {app.verified && <CheckCircle2 size={12} className="text-[#0078d4]" />}
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>{app.category}</span>
                    </div>
                    <p className="text-xs text-[#8a8a8a] dark:text-[#6d6f78] truncate">{app.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-[#d4820c] fill-[#d4820c]" />
                      <span className="text-xs text-[#616161] dark:text-[#8a8a8a]">{app.rating}</span>
                    </div>
                    <span className="text-xs text-[#616161] dark:text-[#8a8a8a]">{formatInstalls(app.installs)}</span>
                    {installedIn.length > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#edf7f0] dark:bg-[#237b4b]/15 text-[#237b4b] dark:text-[#57ab5a]">
                        Installed
                      </span>
                    )}
                    <ChevronRight size={14} className="text-[#d1d1d1] dark:text-[#3d3d3d]" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
