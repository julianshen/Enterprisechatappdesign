import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Camera, Mail, Phone, MapPin, Building2, Briefcase,
  Bell, BellOff, Shield, Lock, Eye, EyeOff, Globe, Palette,
  Monitor, Moon, Sun, LogOut, ChevronRight, Check, X,
  User, Settings, KeyRound, Smartphone, Languages, Clock,
} from 'lucide-react';
import { currentUser } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

// ─── Types ───

type Tab = 'profile' | 'account' | 'notifications' | 'appearance' | 'privacy';
type UserStatus = 'online' | 'away' | 'busy' | 'offline';

interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  timezone: string;
  bio: string;
  pronouns: string;
}

// ─── Component ───

export function ProfileSettings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [statusMessage, setStatusMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    displayName: currentUser.name,
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    timezone: 'Pacific Time (PT)',
    bio: 'Full-stack developer passionate about building great team experiences. Coffee enthusiast and occasional contributor to open source projects.',
    pronouns: 'he/him',
  });

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    mentionsAndReplies: true,
    directMessages: true,
    channelActivity: false,
    taskAssignments: true,
    appUpdates: true,
    emailDigest: true,
    desktopNotifications: true,
    soundEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
    showTypingIndicator: true,
    profileVisibility: 'everyone' as 'everyone' | 'team' | 'private',
    allowSearchByEmail: true,
    twoFactorEnabled: false,
  });

  const statusOptions: { value: UserStatus; label: string; color: string; dot: string }[] = [
    { value: 'online', label: 'Available', color: 'text-[#237b4b] dark:text-[#57ab5a]', dot: 'bg-[#237b4b]' },
    { value: 'busy', label: 'Busy', color: 'text-[#c4314b] dark:text-[#f47067]', dot: 'bg-[#c4314b]' },
    { value: 'away', label: 'Away', color: 'text-[#d4820c] dark:text-[#f0b850]', dot: 'bg-[#d4820c]' },
    { value: 'offline', label: 'Appear Offline', color: 'text-[#8a8a8a] dark:text-[#6d6f78]', dot: 'bg-[#8a8a8a]' },
  ];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'account', label: 'Account', icon: <Settings size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={16} /> },
  ];

  const handleSave = () => {
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (key: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-white to-[#faf9f8] dark:from-[#313338] dark:to-[#2b2d31] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e1dfdd] dark:border-[#3d3d3d]">
        {/* Top bar */}
        <div className="px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-[#616161] dark:text-[#b9bbbe] hover:bg-[#e8e8e8] dark:hover:bg-[#3d3d3d] transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Profile & Settings</h1>
          <div className="flex-1" />
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#237b4b]/10 text-[#237b4b] dark:text-[#57ab5a] rounded-lg text-[12px] font-medium">
              <Check size={14} /> Saved
            </div>
          )}
        </div>

        {/* Profile banner + avatar */}
        <div className="relative">
          <div className="h-[100px] bg-gradient-to-r from-[#5b5fc7] via-[#7b4db8] to-[#a855f7]" />
          <div className="absolute -bottom-10 left-6 flex items-end gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#313338] overflow-hidden shadow-lg bg-[#e8e8f8] dark:bg-[#3d3d3d]">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <button className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </button>
              {/* Status dot */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-3 border-white dark:border-[#313338] ${statusOptions.find(s => s.value === status)?.dot || 'bg-[#8a8a8a]'}`} />
            </div>
            <div className="pb-1">
              <h2 className="text-[16px] font-semibold text-[#242424] dark:text-[#f0f0f0]">{profile.displayName}</h2>
              <p className="text-[12px] text-[#616161] dark:text-[#b9bbbe]">{profile.jobTitle} · {profile.department}</p>
            </div>
          </div>
        </div>
        <div className="h-12" />

        {/* Tabs */}
        <div className="px-6 flex gap-0.5 mt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#2b2d31] text-[#5b5fc7] dark:text-[#a6a9dc] border-t-2 border-x border-[#e1dfdd] dark:border-[#3d3d3d] border-t-[#5b5fc7] -mb-px'
                  : 'text-[#616161] dark:text-[#b9bbbe] hover:text-[#242424] dark:hover:text-[#f0f0f0] hover:bg-[#f5f5f5] dark:hover:bg-[#252525]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[720px] mx-auto space-y-6">

          {/* ─── Profile Tab ─── */}
          {activeTab === 'profile' && (
            <>
              {/* Status */}
              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Status</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex gap-2">
                    {statusOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setStatus(opt.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${
                          status === opt.value
                            ? 'border-[#5b5fc7] bg-[#eeeef8] dark:bg-[#5b5fc7]/10 text-[#5b5fc7] dark:text-[#a6a9dc]'
                            : 'border-[#e1dfdd] dark:border-[#3d3d3d] text-[#616161] dark:text-[#b9bbbe] hover:border-[#5b5fc7]/30'
                        }`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] mb-1.5">Status message</label>
                    <input
                      type="text"
                      value={statusMessage}
                      onChange={e => setStatusMessage(e.target.value)}
                      placeholder="What's on your mind?"
                      className="w-full px-3 py-2 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#e0e0e0] placeholder-[#b9bbbe] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30"
                    />
                  </div>
                </div>
              </section>

              {/* Personal info */}
              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333] flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Personal Information</h3>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`text-[12px] font-medium px-3 py-1.5 rounded-lg transition-all ${
                      isEditing
                        ? 'bg-[#5b5fc7] text-white hover:bg-[#4b4fb7]'
                        : 'text-[#5b5fc7] dark:text-[#a6a9dc] hover:bg-[#eeeef8] dark:hover:bg-[#5b5fc7]/10'
                    }`}
                  >
                    {isEditing ? 'Save Changes' : 'Edit'}
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <ProfileField icon={<User size={15} />} label="Display Name" value={profile.displayName} editing={isEditing} onChange={v => updateProfile('displayName', v)} />
                  <ProfileField icon={<Mail size={15} />} label="Email" value={profile.email} editing={isEditing} onChange={v => updateProfile('email', v)} />
                  <ProfileField icon={<Phone size={15} />} label="Phone" value={profile.phone} editing={isEditing} onChange={v => updateProfile('phone', v)} />
                  <ProfileField icon={<Briefcase size={15} />} label="Job Title" value={profile.jobTitle} editing={isEditing} onChange={v => updateProfile('jobTitle', v)} />
                  <ProfileField icon={<Building2 size={15} />} label="Department" value={profile.department} editing={isEditing} onChange={v => updateProfile('department', v)} />
                  <ProfileField icon={<MapPin size={15} />} label="Location" value={profile.location} editing={isEditing} onChange={v => updateProfile('location', v)} />
                  <ProfileField icon={<Clock size={15} />} label="Timezone" value={profile.timezone} editing={isEditing} onChange={v => updateProfile('timezone', v)} />
                  <ProfileField icon={<Languages size={15} />} label="Pronouns" value={profile.pronouns} editing={isEditing} onChange={v => updateProfile('pronouns', v)} />
                  <div>
                    <label className="flex items-center gap-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] mb-1.5">
                      <User size={15} /> Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={profile.bio}
                        onChange={e => updateProfile('bio', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30 resize-none"
                      />
                    ) : (
                      <p className="text-[13px] text-[#242424] dark:text-[#e0e0e0] leading-relaxed">{profile.bio}</p>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ─── Account Tab ─── */}
          {activeTab === 'account' && (
            <>
              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Account Details</h3>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  <AccountRow icon={<Mail size={16} />} label="Email Address" value={profile.email} />
                  <AccountRow icon={<KeyRound size={16} />} label="Password" value="Last changed 45 days ago" action="Change" />
                  <AccountRow icon={<Shield size={16} />} label="Two-Factor Authentication" value={privacySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'} action={privacySettings.twoFactorEnabled ? 'Manage' : 'Enable'} />
                  <AccountRow icon={<Smartphone size={16} />} label="Connected Devices" value="3 active sessions" action="Manage" />
                  <AccountRow icon={<Globe size={16} />} label="Language" value="English (US)" action="Change" />
                  <AccountRow icon={<Clock size={16} />} label="Timezone" value={profile.timezone} action="Change" />
                </div>
              </section>

              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#c4314b]/20 overflow-hidden">
                <div className="px-5 py-3 border-b border-[#c4314b]/10">
                  <h3 className="text-[14px] font-semibold text-[#c4314b] dark:text-[#f47067]">Danger Zone</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0]">Deactivate Account</p>
                      <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Temporarily disable your account</p>
                    </div>
                    <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[#c4314b]/30 text-[#c4314b] dark:text-[#f47067] hover:bg-[#c4314b]/5 transition-colors">
                      Deactivate
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0]">Delete Account</p>
                      <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Permanently delete your account and all data</p>
                    </div>
                    <button className="text-[12px] font-medium px-3 py-1.5 rounded-lg bg-[#c4314b] text-white hover:bg-[#a3283f] transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ─── Notifications Tab ─── */}
          {activeTab === 'notifications' && (
            <>
              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Notification Preferences</h3>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  <ToggleRow label="Mentions & Replies" desc="Get notified when someone mentions or replies to you" checked={notifSettings.mentionsAndReplies} onChange={v => setNotifSettings(p => ({ ...p, mentionsAndReplies: v }))} />
                  <ToggleRow label="Direct Messages" desc="Notifications for new direct messages" checked={notifSettings.directMessages} onChange={v => setNotifSettings(p => ({ ...p, directMessages: v }))} />
                  <ToggleRow label="Channel Activity" desc="Get notified for all messages in channels you follow" checked={notifSettings.channelActivity} onChange={v => setNotifSettings(p => ({ ...p, channelActivity: v }))} />
                  <ToggleRow label="Task Assignments" desc="Notifications when tasks are assigned to you" checked={notifSettings.taskAssignments} onChange={v => setNotifSettings(p => ({ ...p, taskAssignments: v }))} />
                  <ToggleRow label="App Updates" desc="Notifications from installed apps and integrations" checked={notifSettings.appUpdates} onChange={v => setNotifSettings(p => ({ ...p, appUpdates: v }))} />
                </div>
              </section>

              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Delivery</h3>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  <ToggleRow label="Email Digest" desc="Receive a daily summary of activity by email" checked={notifSettings.emailDigest} onChange={v => setNotifSettings(p => ({ ...p, emailDigest: v }))} />
                  <ToggleRow label="Desktop Notifications" desc="Show browser push notifications" checked={notifSettings.desktopNotifications} onChange={v => setNotifSettings(p => ({ ...p, desktopNotifications: v }))} />
                  <ToggleRow label="Sound" desc="Play a sound for new notifications" checked={notifSettings.soundEnabled} onChange={v => setNotifSettings(p => ({ ...p, soundEnabled: v }))} />
                </div>
              </section>

              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Quiet Hours</h3>
                </div>
                <div className="p-5 space-y-4">
                  <ToggleRow label="Enable Quiet Hours" desc="Mute all notifications during specified hours" checked={notifSettings.quietHoursEnabled} onChange={v => setNotifSettings(p => ({ ...p, quietHoursEnabled: v }))} noBorder />
                  {notifSettings.quietHoursEnabled && (
                    <div className="flex items-center gap-4 pl-1">
                      <div>
                        <label className="block text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] mb-1">From</label>
                        <input type="time" value={notifSettings.quietHoursStart} onChange={e => setNotifSettings(p => ({ ...p, quietHoursStart: e.target.value }))} className="px-3 py-1.5 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#616161] dark:text-[#b9bbbe] mb-1">To</label>
                        <input type="time" value={notifSettings.quietHoursEnd} onChange={e => setNotifSettings(p => ({ ...p, quietHoursEnd: e.target.value }))} className="px-3 py-1.5 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30" />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* ─── Appearance Tab ─── */}
          {activeTab === 'appearance' && (
            <>
              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Theme</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'light' as const, label: 'Light', icon: <Sun size={24} />, colors: 'bg-white border-[#e1dfdd]', preview: 'bg-gradient-to-br from-[#faf9f8] to-white' },
                      { id: 'dark' as const, label: 'Dark', icon: <Moon size={24} />, colors: 'bg-[#1e1f22] border-[#3d3d3d]', preview: 'bg-gradient-to-br from-[#313338] to-[#1e1f22]' },
                      { id: 'system' as const, label: 'System', icon: <Monitor size={24} />, colors: 'bg-gradient-to-r from-white to-[#1e1f22] border-[#8a8a8a]', preview: 'bg-gradient-to-r from-[#faf9f8] to-[#313338]' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { if ((t.id === 'light' && theme === 'dark') || (t.id === 'dark' && theme === 'light')) toggleTheme(); }}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          (theme === t.id || (t.id === 'system' && false))
                            ? 'border-[#5b5fc7] bg-[#eeeef8]/50 dark:bg-[#5b5fc7]/5'
                            : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
                        }`}
                      >
                        <div className={`w-full h-16 rounded-lg ${t.preview} border ${t.id === 'dark' ? 'border-[#3d3d3d]' : 'border-[#e1dfdd]'} flex items-center justify-center`}>
                          <div className={`${t.id === 'dark' ? 'text-[#b9bbbe]' : t.id === 'system' ? 'text-[#616161]' : 'text-[#424242]'}`}>{t.icon}</div>
                        </div>
                        <span className="text-[12px] font-medium text-[#424242] dark:text-[#c8c8c8]">{t.label}</span>
                        {theme === t.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5b5fc7] flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Accent Color</h3>
                </div>
                <div className="p-5">
                  <div className="flex gap-3">
                    {['#5b5fc7', '#0078d4', '#237b4b', '#8764b8', '#c4314b', '#d4820c', '#e74856', '#00b7c3'].map(color => (
                      <button
                        key={color}
                        className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${color === '#5b5fc7' ? 'ring-2 ring-offset-2 ring-[#5b5fc7] dark:ring-offset-[#252525]' : ''}`}
                        style={{ backgroundColor: color }}
                        title={color}
                      >
                        {color === '#5b5fc7' && <Check size={16} className="text-white mx-auto" />}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ─── Privacy Tab ─── */}
          {activeTab === 'privacy' && (
            <>
              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Visibility</h3>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  <ToggleRow label="Show Online Status" desc="Let others see when you're online" checked={privacySettings.showOnlineStatus} onChange={v => setPrivacySettings(p => ({ ...p, showOnlineStatus: v }))} />
                  <ToggleRow label="Show Last Seen" desc="Let others see when you were last active" checked={privacySettings.showLastSeen} onChange={v => setPrivacySettings(p => ({ ...p, showLastSeen: v }))} />
                  <ToggleRow label="Read Receipts" desc="Let others know when you've read their messages" checked={privacySettings.showReadReceipts} onChange={v => setPrivacySettings(p => ({ ...p, showReadReceipts: v }))} />
                  <ToggleRow label="Typing Indicator" desc="Show when you're typing a message" checked={privacySettings.showTypingIndicator} onChange={v => setPrivacySettings(p => ({ ...p, showTypingIndicator: v }))} />
                  <ToggleRow label="Searchable by Email" desc="Allow others to find you by email address" checked={privacySettings.allowSearchByEmail} onChange={v => setPrivacySettings(p => ({ ...p, allowSearchByEmail: v }))} />
                </div>
              </section>

              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Profile Visibility</h3>
                </div>
                <div className="p-5">
                  <div className="flex gap-2">
                    {[
                      { value: 'everyone' as const, label: 'Everyone', desc: 'Anyone in the org' },
                      { value: 'team' as const, label: 'Team Only', desc: 'People in your spaces' },
                      { value: 'private' as const, label: 'Private', desc: 'Only you' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setPrivacySettings(p => ({ ...p, profileVisibility: opt.value }))}
                        className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                          privacySettings.profileVisibility === opt.value
                            ? 'border-[#5b5fc7] bg-[#eeeef8] dark:bg-[#5b5fc7]/10'
                            : 'border-[#e1dfdd] dark:border-[#3d3d3d] hover:border-[#5b5fc7]/30'
                        }`}
                      >
                        <span className="text-[12px] font-semibold text-[#242424] dark:text-[#e0e0e0]">{opt.label}</span>
                        <span className="text-[10px] text-[#8a8a8a] dark:text-[#6d6f78]">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#252525] rounded-xl border border-[#e1dfdd] dark:border-[#3d3d3d] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#f0f0f0] dark:border-[#333]">
                  <h3 className="text-[14px] font-semibold text-[#242424] dark:text-[#f0f0f0]">Security</h3>
                </div>
                <div className="divide-y divide-[#f0f0f0] dark:divide-[#333]">
                  <ToggleRow label="Two-Factor Authentication" desc="Add an extra layer of security with 2FA" checked={privacySettings.twoFactorEnabled} onChange={v => setPrivacySettings(p => ({ ...p, twoFactorEnabled: v }))} />
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0]">Active Sessions</p>
                      <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Manage devices signed into your account</p>
                    </div>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0]">Download My Data</p>
                      <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">Export a copy of all your data</p>
                    </div>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline">
                      Request Export <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function ProfileField({ icon, label, value, editing, onChange }: {
  icon: React.ReactNode; label: string; value: string; editing: boolean; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-[12px] font-medium text-[#616161] dark:text-[#b9bbbe] mb-1.5">
        {icon} {label}
      </label>
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 bg-[#faf9f8] dark:bg-[#1e1f22] border border-[#e1dfdd] dark:border-[#3d3d3d] rounded-lg text-[13px] text-[#242424] dark:text-[#e0e0e0] focus:outline-none focus:ring-2 focus:ring-[#5b5fc7]/30"
        />
      ) : (
        <p className="text-[13px] text-[#242424] dark:text-[#e0e0e0]">{value}</p>
      )}
    </div>
  );
}

function AccountRow({ icon, label, value, action }: {
  icon: React.ReactNode; label: string; value: string; action?: string;
}) {
  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] dark:bg-[#333] flex items-center justify-center text-[#616161] dark:text-[#b9bbbe] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0]">{label}</p>
        <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{value}</p>
      </div>
      {action && (
        <button className="text-[12px] font-medium text-[#5b5fc7] dark:text-[#a6a9dc] hover:underline">
          {action}
        </button>
      )}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, noBorder }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; noBorder?: boolean;
}) {
  return (
    <div className={`px-5 py-4 flex items-center justify-between ${noBorder ? '' : ''}`}>
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-[13px] font-medium text-[#242424] dark:text-[#e0e0e0]">{label}</p>
        <p className="text-[11px] text-[#8a8a8a] dark:text-[#6d6f78]">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-[22px] rounded-full transition-colors shrink-0 ${
          checked ? 'bg-[#5b5fc7]' : 'bg-[#d1d1d1] dark:bg-[#5a5a5a]'
        }`}
      >
        <div className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'left-[22px]' : 'left-[3px]'
        }`} />
      </button>
    </div>
  );
}
