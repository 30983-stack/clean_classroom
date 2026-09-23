import React, { useState, useMemo } from 'react';
import { 
  User, Lock, LogIn, LogOut, ShieldCheck, Camera, CheckCircle2, 
  XCircle, AlertCircle, Calendar, Star, Trophy, RefreshCw, Grid, 
  Send, Users, Eye, EyeOff, Sparkles, Check, Clock, ArrowRightLeft,
  Bell, Image as ImageIcon, MessageSquareText, Award, Filter, Plus,
  CheckCircle, ChevronRight, BarChart3, Shuffle, Trash2, ArrowUpRight
} from 'lucide-react';

// --- DEMO ACCOUNTS ---
const DEMO_USERS = {
  teacher: { 
    username: 'teacher', 
    password: '1234', 
    name: 'ครูวิภาดา รักเรียน', 
    role: 'teacher', 
    roleName: 'ครูประจำชั้น (ม.2/1)', 
    avatar: '👩‍🏫',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
  },
  leader: { 
    username: 'leader', 
    password: '1234', 
    name: 'นายสมชาย สายกวาด', 
    role: 'leader', 
    roleName: 'หัวหน้าเวร (กลุ่ม 3 - วันพุธ)', 
    avatar: '🧑‍เก',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  },
  student: { 
    username: 'student', 
    password: '1234', 
    name: 'ด.ญ.สมหญิง ขยันดี', 
    role: 'student', 
    roleName: 'นักเรียน (กลุ่ม 3 - วันพุธ)', 
    avatar: '👧',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30'
  }
};

// --- INITIAL ROSTER DATA ---
const INITIAL_ROSTERS = [
  { day: 'จันทร์', group: 'กลุ่ม 1', leader: 'นายกิตติศักดิ์ ใจดี', members: ['นายกิตติศักดิ์ ใจดี', 'ด.ช.อนันต์ สุขใจ', 'ด.ญ.นิภา รักเรียน', 'ด.ญ.ปิยะดา รุ่งเรือง'] },
  { day: 'อังคาร', group: 'กลุ่ม 2', leader: 'ด.ญ.ปราณี มีสุข', members: ['ด.ญ.ปราณี มีสุข', 'นายพงศธร ขยันงาน', 'ด.ช.วิชัย ตรงเวลา', 'ด.ญ.ศิริพร อ่อนหวาน'] },
  { day: 'พุธ', group: 'กลุ่ม 3', leader: 'นายสมชาย สายกวาด', members: ['นายสมชาย สายกวาด', 'ด.ญ.สมหญิง ขยันดี', 'นายธีรเดช พร้อมมิตร', 'ด.ญ.กมลวรรณ สว่างวงศ์'] },
  { day: 'พฤหัสบดี', group: 'กลุ่ม 4', leader: 'ด.ช.ธนกฤต มั่นคง', members: ['ด.ช.ธนกฤต มั่นคง', 'ด.ญ.ชลธิชา สดใส', 'นายภานุพงศ์ ช่วยเหลือ', 'ด.ญ.วรรณิสา ตั้งใจ'] },
  { day: 'ศุกร์', group: 'กลุ่ม 5', leader: 'ด.ญ.นัชชา งามพร้อม', members: ['ด.ญ.นัชชา งามพร้อม', 'นายสุรศักดิ์ สามัคคี', 'ด.ช.พีรพล สะอาดดี', 'ด.ญ.กนกวรรณ เรียบร้อย'] },
];

// Sample Image Presets for Photo Upload Simulation
const SAMPLE_PHOTOS = [
  { label: 'ห้องเรียนจัดเรียบร้อย กวาดพื้นสะอาด', url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80' },
  { label: 'โต๊ะนักเรียนจัดเป็นระเบียบ', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80' },
  { label: 'กระดานดำเช็ดสะอาด พร้อมใช้งาน', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80' }
];

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(null); // null = Not logged in
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // App navigation
  const [activeTab, setActiveTab] = useState('duty'); // 'duty', 'review', 'roster', 'leaderboard', 'swap'
  const [toastMessage, setToastMessage] = useState(null);

  // Duty recording states
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [attendance, setAttendance] = useState({
    'นายสมชาย สายกวาด': 'present',
    'ด.ญ.สมหญิง ขยันดี': 'present',
    'นายธีรเดช พร้อมมิตร': 'present',
    'ด.ญ.กมลวรรณ สว่างวงศ์': 'absent'
  });
  const [dutyNotes, setDutyNotes] = useState('จัดโต๊ะเก้าอี้เรียบร้อย กวาดและถูพื้นหมดทุกจุด ถังขยะนำไปเทที่จุดรวบรวมแล้วครับ');

  // Submissions state
  const [submissions, setSubmissions] = useState([
    {
      id: 101,
      date: '2026-09-23',
      day: 'พุธ',
      group: 'กลุ่ม 3',
      leader: 'นายสมชาย สายกวาด',
      attendance: {
        'นายสมชาย สายกวาด': 'present',
        'ด.ญ.สมหญิง ขยันดี': 'present',
        'นายธีรเดช พร้อมมิตร': 'present',
        'ด.ญ.กมลวรรณ สว่างวงศ์': 'absent'
      },
      photo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
      notes: 'ทำความสะอาดเรียบร้อย ถังขยะนำไปเทที่จุดรวบรวมแล้วครับ',
      status: 'pending', // pending, approved, rejected
      rating: 0,
      feedback: ''
    },
    {
      id: 100,
      date: '2026-09-22',
      day: 'อังคาร',
      group: 'กลุ่ม 2',
      leader: 'ด.ญ.ปราณี มีสุข',
      attendance: {
        'ด.ญ.ปราณี มีสุข': 'present',
        'นายพงศธร ขยันงาน': 'present',
        'ด.ช.วิชัย ตรงเวลา': 'present',
        'ด.ญ.ศิริพร อ่อนหวาน': 'present'
      },
      photo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
      notes: 'จัดเรียงโต๊ะตรงตามแนวเส้นเรียบร้อยดีมากค่ะ',
      status: 'approved',
      rating: 5,
      feedback: 'ดีเยี่ยมมากค่ะ ห้องสะอาด เป็นระเบียบเรียบร้อยมาก!'
    }
  ]);

  // Reviewing modal / temporary rating state
  const [activeRating, setActiveRating] = useState({});
  const [activeFeedback, setActiveFeedback] = useState({});

  // Rosters state
  const [rosters, setRosters] = useState(INITIAL_ROSTERS);

  // Shift swap state
  const [swapRequests, setSwapRequests] = useState([
    {
      id: 1,
      requester: 'ด.ญ.สมหญิง ขยันดี',
      currentDay: 'พุธ (กลุ่ม 3)',
      targetDay: 'ศุกร์ (กลุ่ม 5)',
      targetPerson: 'ด.ญ.กนกวรรณ เรียบร้อย',
      reason: 'ติดซ้อมดนตรีสากลเตรียมงานโรงเรียน',
      status: 'รอการตอบรับ',
      createdAt: '2026-09-23 08:30'
    }
  ]);

  // Swap Form Modal state
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [newSwap, setNewSwap] = useState({
    targetDay: 'ศุกร์ (กลุ่ม 5)',
    targetPerson: 'ด.ญ.กนกวรรณ เรียบร้อย',
    reason: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const userKey = Object.keys(DEMO_USERS).find(
      key => DEMO_USERS[key].username === usernameInput.trim() && DEMO_USERS[key].password === passwordInput
    );

    if (userKey) {
      const foundUser = DEMO_USERS[userKey];
      setCurrentUser(foundUser);
      // Auto-switch default tab according to role
      if (foundUser.role === 'teacher') setActiveTab('review');
      else if (foundUser.role === 'leader') setActiveTab('duty');
      else setActiveTab('roster');

      showToast(`เข้าสู่ระบบสำเร็จ: Welcome ${foundUser.name}`);
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (กรุณาดูข้อมูลบัญชีทดสอบด้านล่าง)');
    }
  };

  // Quick Account Login Button Handler
  const handleQuickLogin = (roleKey) => {
    const user = DEMO_USERS[roleKey];
    setUsernameInput(user.username);
    setPasswordInput(user.password);
    setCurrentUser(user);
    setLoginError('');

    if (user.role === 'teacher') setActiveTab('review');
    else if (user.role === 'leader') setActiveTab('duty');
    else setActiveTab('roster');

    showToast(`สลับบัญชีผู้ใช้เป็น: ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  // Submit Duty Report
  const handleSubmitDuty = () => {
    const chosenPhoto = customPhotoUrl || SAMPLE_PHOTOS[selectedPhotoIndex].url;
    const newSubmission = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      day: 'พุธ',
      group: 'กลุ่ม 3',
      leader: currentUser.name,
      attendance: attendance,
      photo: chosenPhoto,
      notes: dutyNotes,
      status: 'pending',
      rating: 0,
      feedback: ''
    };

    setSubmissions([newSubmission, ...submissions]);
    showToast('📲 ส่งรายงานเวรทำความสะอาดให้ครูประจำชั้นเรียบร้อยแล้ว!');
    setActiveTab('review');
  };

  // Teacher Reviewing Action
  const handleReviewAction = (subId, newStatus) => {
    const ratingVal = activeRating[subId] || 5;
    const feedbackVal = activeFeedback[subId] || (newStatus === 'approved' ? 'ห้องทำความสะอาดได้ดีมากค่ะ' : 'กรุณากลับไปกวาดพื้นใต้อาคารเรียนเพิ่มเติม');

    setSubmissions(submissions.map(sub => {
      if (sub.id === subId) {
        return {
          ...sub,
          status: newStatus,
          rating: newStatus === 'approved' ? ratingVal : 0,
          feedback: feedbackVal
        };
      }
      return sub;
    }));

    showToast(newStatus === 'approved' ? '✅ อนุมัติผ่านรายงานเวรเรียบร้อยแล้ว' : '⚠️ ส่งข้อความแจ้งให้แก้ไขแล้ว');
  };

  // Random Shuffle Roster Algorithm
  const handleShuffleRosters = () => {
    const allMembers = rosters.flatMap(r => r.members);
    // Fisher-Yates shuffle algorithm
    const shuffled = [...allMembers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const updatedRosters = rosters.map((r, idx) => {
      const groupMembers = shuffled.slice(idx * 4, (idx + 1) * 4);
      return {
        ...r,
        members: groupMembers,
        leader: groupMembers[0] || r.leader
      };
    });

    setRosters(updatedRosters);
    showToast('🎲 สุ่มจัดกลุ่มเวรทำความสะอาดประจำสัปดาห์ใหม่เรียบร้อย!');
  };

  // Submit New Shift Swap Request
  const handleCreateSwapRequest = (e) => {
    e.preventDefault();
    if (!newSwap.reason.trim()) {
      showToast('กรุณาระบุเหตุผลในการขอสลับเวร');
      return;
    }

    const requestObj = {
      id: Date.now(),
      requester: currentUser.name,
      currentDay: 'พุธ (กลุ่ม 3)',
      targetDay: newSwap.targetDay,
      targetPerson: newSwap.targetPerson,
      reason: newSwap.reason,
      status: 'รอการตอบรับ',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setSwapRequests([requestObj, ...swapRequests]);
    setShowSwapModal(false);
    setNewSwap({ targetDay: 'ศุกร์ (กลุ่ม 5)', targetPerson: 'ด.ญ.กนกวรรณ เรียบร้อย', reason: '' });
    showToast('ส่งคำขอสลับเวรเรียบร้อยแล้ว');
  };

  // Approve / Reject Swap Request
  const handleUpdateSwapStatus = (id, newStatus) => {
    setSwapRequests(swapRequests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    showToast(`อัปเดตสถานะคำขอสลับเวรเป็น: ${newStatus}`);
  };

  // Dynamically calculate group leaderboard score
  const groupLeaderboard = useMemo(() => {
    const scores = {
      'กลุ่ม 1': { stars: 40, approvedCount: 8, leader: 'นายกิตติศักดิ์ ใจดี', day: 'จันทร์' },
      'กลุ่ม 2': { stars: 45, approvedCount: 9, leader: 'ด.ญ.ปราณี มีสุข', day: 'อังคาร' },
      'กลุ่ม 3': { stars: 42, approvedCount: 8, leader: 'นายสมชาย สายกวาด', day: 'พุธ' },
      'กลุ่ม 4': { stars: 38, approvedCount: 7, leader: 'ด.ช.ธนกฤต มั่นคง', day: 'พฤหัสบดี' },
      'กลุ่ม 5': { stars: 46, approvedCount: 9, leader: 'ด.ญ.นัชชา งามพร้อม', day: 'ศุกร์' },
    };

    // Aggregate stars from actual submissions
    submissions.forEach(sub => {
      if (sub.status === 'approved' && scores[sub.group]) {
        scores[sub.group].stars += sub.rating;
        scores[sub.group].approvedCount += 1;
      }
    });

    return Object.entries(scores)
      .map(([groupName, data]) => ({ groupName, ...data }))
      .sort((a, b) => b.stars - a.stars);
  }, [submissions]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
        {/* Glowing Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Login Container */}
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20 transform hover:scale-105 transition-transform">
              <Sparkles className="w-9 h-9 text-slate-950" />
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              CleanClassroom
            </h1>
            <p className="text-slate-400 text-xs mt-1 font-medium">
              ระบบบริหารจัดการเวรทำความสะอาดห้องเรียนประจำวัน
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="กรอก Username (เช่น teacher, leader, student)"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-11 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-bold text-slate-950 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <LogIn className="w-5 h-5" />
              เข้าสู่ระบบ
            </button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-semibold">⚡ เลือกสลับบัญชีทดสอบด่วน:</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                รหัสผ่าน: 1234
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {Object.entries(DEMO_USERS).map(([key, user]) => (
                <button
                  key={key}
                  onClick={() => handleQuickLogin(key)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all flex flex-col items-center gap-1.5 text-center group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{user.avatar}</span>
                  <span className="text-xs font-bold text-slate-200">{user.roleName.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-300 font-bold text-sm animate-bounce">
          <Bell className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-white leading-none">CleanClassroom</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">ห้องเรียน ม.4/7 • ประจำปีการศึกษา 2569</p>
            </div>
          </div>

          {/* Account Profile Bar & Quick Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Role Switcher Buttons */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold px-2">สลับบทบาท:</span>
              {Object.entries(DEMO_USERS).map(([key, u]) => (
                <button
                  key={key}
                  onClick={() => handleQuickLogin(key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    currentUser.role === u.role
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{u.avatar}</span>
                  <span>{u.role === 'teacher' ? 'ครู' : u.role === 'leader' ? 'หัวหน้าเวร' : 'นักเรียน'}</span>
                </button>
              ))}
            </div>

            {/* User Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${currentUser.badgeColor}`}>
              <span className="text-base">{currentUser.avatar}</span>
              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight">{currentUser.name}</div>
                <div className="text-[10px] opacity-80">{currentUser.roleName}</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="max-w-6xl mx-auto px-4 mt-6">

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800 scrollbar-none">
          {(currentUser.role === 'leader' || currentUser.role === 'teacher') && (
            <button
              onClick={() => setActiveTab('duty')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === 'duty'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              บันทึกตรวจเวรประจำวัน
            </button>
          )}

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            รายงานการตรวจเวร ({submissions.length})
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'roster'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            ตารางเวรประจำสัปดาห์
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard คะแนนดาว
          </button>

          <button
            onClick={() => setActiveTab('swap')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'swap'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            ยื่นขอสลับเวร ({swapRequests.length})
          </button>
        </div>

        {/* TAB 1: DUTY LEADER FORM (RECORD & PHOTO CAPTURE WITH RULE OF THIRDS GRID) */}
        {activeTab === 'duty' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Attendance & Checklist Column */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Member Attendance Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      เช็คชื่อสมาชิกกลุ่มเวรประจำวัน
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">ประจำวันพุธ • กลุ่มเวรที่ 3</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
                    4 คน
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(attendance).map(([memberName, status]) => (
                    <div key={memberName} className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        <span className="text-xs font-bold text-slate-200">{memberName}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setAttendance({ ...attendance, [memberName]: 'present' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            status === 'present'
                              ? 'bg-emerald-500 text-slate-950 shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          มาทำเวร
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendance({ ...attendance, [memberName]: 'absent' })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            status === 'absent'
                              ? 'bg-red-500 text-white shadow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          ขาด / หนี
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duty Remarks Textarea */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-base font-extrabold text-white mb-2 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-emerald-400" />
                  หมายเหตุ / ปัญหาที่พบในการทำความสะอาด
                </h2>
                <textarea
                  rows={3}
                  value={dutyNotes}
                  onChange={(e) => setDutyNotes(e.target.value)}
                  placeholder="กรอกรายละเอียด เช่น จัดโต๊ะเก้าอี้เรียบร้อย กวาดและถูพื้นหมดแล้ว..."
                  className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

            </div>

            {/* Photo Capture & Rule of Thirds Grid Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Camera className="w-5 h-5 text-emerald-400" />
                      ถ่ายภาพแนบส่งตรวจเวร
                    </h2>
                    <p className="text-xs text-slate-400">ใช้องค์ประกอบภาพมุมกว้างให้เห็นความสะอาดทั้งห้อง</p>
                  </div>

                  {/* RULE OF THIRDS GRID SWITCH TOGGLE */}
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                      showGridOverlay
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grid 点 9 ช่อง {showGridOverlay ? '(เปิด)' : '(ปิด)'}
                  </button>
                </div>

                {/* Viewfinder Camera Simulation */}
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
                  <img
                    src={customPhotoUrl || SAMPLE_PHOTOS[selectedPhotoIndex].url}
                    alt="Classroom preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* RULE OF THIRDS GRID OVERLAY */}
                  {showGridOverlay && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-400/40">
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-b border-emerald-400/30"></div>
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-r border-b border-emerald-400/30"></div>
                      <div className="border-b border-emerald-400/30"></div>
                      <div className="border-r border-emerald-400/30"></div>
                      <div className="border-r border-emerald-400/30"></div>
                      <div></div>
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    องค์ประกอบภาพมุมกว้าง 3x3
                  </div>
                </div>

                {/* Sample Photo Selector or Custom URL */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block">เลือกรูปจำลองการตรวจเวร:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_PHOTOS.map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setSelectedPhotoIndex(idx); setCustomPhotoUrl(''); }}
                        className={`p-1.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                          selectedPhotoIndex === idx && !customPhotoUrl
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/10'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <div className="aspect-video rounded-lg overflow-hidden mb-1">
                          <img src={photo.url} alt="sample" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] text-slate-300 font-medium truncate">{photo.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={handleSubmitDuty}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 font-extrabold text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <Send className="w-5 h-5" />
                  ส่งรายงานเวรทำความสะอาดให้ครูประจำชั้น
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TEACHER SUBMISSION REVIEW QUEUE & RATING */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">คิวตรวจงานเวรทำความสะอาด</h2>
                <p className="text-xs text-slate-400">รายการรายงานเวรที่ส่งมาจากหัวหน้าเวรประจำวัน</p>
              </div>
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-full text-xs font-bold">
                ทั้งหมด {submissions.length} รายการ
              </span>
            </div>

            <div className="space-y-6">
              {submissions.map((sub) => (
                <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                  
                  {/* Submission Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center font-extrabold text-emerald-400">
                        {sub.group}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base">รายงานเวรประจำวัน{sub.day} ({sub.date})</h3>
                        <p className="text-xs text-slate-400">หัวหน้าเวร: <span className="text-slate-200 font-semibold">{sub.leader}</span></p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {sub.status === 'pending' && (
                        <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> รอครูตรวจสอบ
                        </span>
                      )}
                      {sub.status === 'approved' && (
                        <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> อนุมัติผ่านแล้ว ({sub.rating} ⭐)
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="px-3.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" /> ให้กลับไปแก้ไข
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Attached Photo */}
                    <div className="md:col-span-5 aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 relative group">
                      <img src={sub.photo} alt="Duty Report" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-white font-bold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700">
                          รูปถ่ายตรวจเวร
                        </span>
                      </div>
                    </div>

                    {/* Attendance & Notes Details */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">การเข้าทำเวรของสมาชิก</h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(sub.attendance).map(([name, stat]) => (
                            <span
                              key={name}
                              className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                                stat === 'present'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                            >
                              {name} ({stat === 'present' ? 'มาทำ' : 'ขาด'})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">หมายเหตุจากหัวหน้าเวร</h4>
                        <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">{sub.notes}</p>
                      </div>

                      {/* Display Rating & Feedback if Approved */}
                      {sub.status === 'approved' && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400">ผลการประเมินจากครู:</span>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(sub.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-200 font-medium">"{sub.feedback}"</p>
                        </div>
                      )}

                      {/* Teacher Grading & Action Panel */}
                      {currentUser.role === 'teacher' && sub.status === 'pending' && (
                        <div className="pt-4 border-t border-slate-800 space-y-4">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            ประเมินให้คะแนนเวรทำความสะอาด (1 - 5 ดาว)
                          </h4>

                          {/* Interactive Star Picker */}
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((starCount) => (
                              <button
                                key={starCount}
                                type="button"
                                onClick={() => setActiveRating({ ...activeRating, [sub.id]: starCount })}
                                className="p-1 text-amber-400 hover:scale-125 transition-transform"
                              >
                                <Star
                                  className={`w-7 h-7 ${
                                    (activeRating[sub.id] || 5) >= starCount ? 'fill-amber-400' : 'text-slate-600'
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-amber-400 ml-2">
                              {activeRating[sub.id] || 5} ดาว
                            </span>
                          </div>

                          {/* Teacher Feedback Textarea */}
                          <textarea
                            rows={2}
                            value={activeFeedback[sub.id] || ''}
                            onChange={(e) => setActiveFeedback({ ...activeFeedback, [sub.id]: e.target.value })}
                            placeholder="เขียนข้อเสนอแนะหรือคำชมเชยจากครูประจำชั้น..."
                            className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          />

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleReviewAction(sub.id, 'approved')}
                              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 font-extrabold text-slate-950 rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-500/20"
                            >
                              <CheckCircle2 className="w-4 h-4" /> อนุมัติผ่านการตรวจ
                            </button>
                            <button
                              onClick={() => handleReviewAction(sub.id, 'rejected')}
                              className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl transition-all text-xs"
                            >
                              ส่งกลับแก้ไข
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: WEEKLY ROSTER & SHUFFLE SYSTEM */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">ตารางเวรทำความสะอาดประจำสัปดาห์</h2>
                <p className="text-xs text-slate-400">การจัดแบ่งกลุ่มรับผิดชอบประจำวันจันทร์ - วันศุกร์</p>
              </div>

              {currentUser.role === 'teacher' && (
                <button
                  onClick={handleShuffleRosters}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <Shuffle className="w-4 h-4" />
                  สุ่มจัดตารางเวรใหม่ (Auto Shuffle)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {rosters.map((ros) => (
                <div key={ros.day} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <span className="font-extrabold text-emerald-400 text-sm">วัน{ros.day}</span>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                        {ros.group}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">หัวหน้ากลุ่มเวร:</span>
                      <div className="text-xs font-bold text-slate-200 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-300">
                        👑 {ros.leader}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">สมาชิกประจำกลุ่ม:</span>
                      {ros.members.map((mem, idx) => (
                        <div key={idx} className="p-2 bg-slate-950/70 rounded-xl text-xs text-slate-300 border border-slate-800/80 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                          <span className="truncate">{mem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD & STARS SUMMARY */}
        {activeTab === 'leaderboard' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="text-center max-w-md mx-auto my-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Leaderboard กลุ่มเวรยอดเยี่ยม</h2>
              <p className="text-xs text-slate-400 mt-1">สรุปคะแนนดาวสะสมประจำเดือนกันยายน 2026</p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {groupLeaderboard.map((item, index) => {
                const isFirst = index === 0;
                return (
                  <div
                    key={item.groupName}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-amber-500/40 shadow-lg ring-1 ring-amber-500/20'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                        index === 0 ? 'bg-amber-400 text-slate-950 shadow' :
                        index === 1 ? 'bg-slate-300 text-slate-950' :
                        index === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {index + 1}
                      </div>

                      <div>
                        <div className="font-extrabold text-white text-sm flex items-center gap-2">
                          <span>{item.groupName} (วัน{item.day})</span>
                          {isFirst && <span className="text-xs font-bold text-amber-400">🥇 ชนะเลิศ</span>}
                        </div>
                        <div className="text-xs text-slate-400">หัวหน้า: {item.leader}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs text-slate-400">ผ่านการตรวจ</div>
                        <div className="text-xs font-bold text-emerald-400">{item.approvedCount} ครั้ง</div>
                      </div>

                      <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-extrabold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {item.stars} ดาว
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: SHIFT SWAP REQUEST SYSTEM */}
        {activeTab === 'swap' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-white">ระบบยื่นขอสลับเวรทำความสะอาด</h2>
                <p className="text-xs text-slate-400">กรณีติดภารกิจ ป่วย หรือติดซ้อมกิจกรรมโรงเรียน</p>
              </div>

              <button
                onClick={() => setShowSwapModal(true)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                ยื่นขอสลับเวรใหม่
              </button>
            </div>

            <div className="space-y-4">
              {swapRequests.map((req) => (
                <div key={req.id} className="p-5 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-white text-sm">{req.requester}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                        {req.currentDay} ➡️ {req.targetDay}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      สลับกับ: <span className="font-semibold text-slate-200">{req.targetPerson}</span>
                    </p>
                    <p className="text-xs text-slate-400 bg-slate-900 p-2 rounded-xl border border-slate-800/80">
                      เหตุผล: "{req.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'รอการตอบรับ'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : req.status === 'อนุมัติแล้ว'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {req.status}
                    </span>

                    {/* Teacher / Classmate Approval Buttons */}
                    {currentUser.role === 'teacher' && req.status === 'รอการตอบรับ' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateSwapStatus(req.id, 'อนุมัติแล้ว')}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                        >
                          อนุมัติ
                        </button>
                        <button
                          onClick={() => handleUpdateSwapStatus(req.id, 'ปฏิเสธ')}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl text-xs transition-all"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Shift Swap Modal Dialog */}
            {showSwapModal && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-extrabold text-white text-base">ยื่นขอสลับเวรทำความสะอาด</h3>
                    <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateSwapRequest} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">กลุ่มและวันที่ต้องการสลับไป:</label>
                      <select
                        value={newSwap.targetDay}
                        onChange={(e) => setNewSwap({ ...newSwap, targetDay: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="จันทร์ (กลุ่ม 1)">จันทร์ (กลุ่ม 1)</option>
                        <option value="อังคาร (กลุ่ม 2)">อังคาร (กลุ่ม 2)</option>
                        <option value="พฤหัสบดี (กลุ่ม 4)">พฤหัสบดี (กลุ่ม 4)</option>
                        <option value="ศุกร์ (กลุ่ม 5)">ศุกร์ (กลุ่ม 5)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">ชื่อเพื่อนที่ขอสลับตัว:</label>
                      <input
                        type="text"
                        value={newSwap.targetPerson}
                        onChange={(e) => setNewSwap({ ...newSwap, targetPerson: e.target.value })}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                        placeholder="ระบุชื่อเพื่อน..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">เหตุผลในการขอสลับ:</label>
                      <textarea
                        rows={3}
                        required
                        value={newSwap.reason}
                        onChange={(e) => setNewSwap({ ...newSwap, reason: e.target.value })}
                        placeholder="ระบุเหตุผล เช่น ติดนัดพบแพทย์, ติดกิจกรรมชมรม..."
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                      >
                        ส่งคำขอสลับเวร
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSwapModal(false)}
                        className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
