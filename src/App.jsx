import React, { useState } from 'react';
import { 
  User, Lock, LogIn, LogOut, ShieldCheck, Camera, CheckCircle2, 
  XCircle, AlertCircle, Calendar, Star, Trophy, RefreshCw, Grid, 
  Send, Users, Eye, EyeOff, Sparkles, Check, Clock, ArrowRightLeft,
  Bell, Image as ImageIcon, MessageSquareText, Award, Filter
} from 'lucide-react';

// --- DEMO ACCOUNTS ---
const DEMO_USERS = {
  teacher: { username: 'teacher', password: '1234', name: 'ครูวิภาดา รักเรียน', role: 'teacher', roleName: 'ครูประจำชั้น (ม.4/7)', avatar: '👩‍🏫' },
  leader: { username: 'leader', password: '1234', name: 'นายสมชาย สายกวาด (หัวหน้ากลุ่ม 3)', role: 'leader', roleName: 'หัวหน้าเวรประจำวัน', avatar: '🧑‍เก' },
  student: { username: 'student', password: '1234', name: 'ด.ญ.สมหญิง ขยันดี', role: 'student', roleName: 'นักเรียน (กลุ่มเวรที่ 3)', avatar: '👧' }
};

// --- INITIAL ROSTER DATA ---
const INITIAL_ROSTERS = [
  { day: 'จันทร์', group: 'กลุ่ม 1', leader: 'นายกิตติศักดิ์', members: ['ด.ช.อนันต์', 'ด.ญ.นิภา', 'นายกิตติศักดิ์', 'ด.ญ.ปิยะดา'] },
  { day: 'อังคาร', group: 'กลุ่ม 2', leader: 'ด.ญ.ปราณี', members: ['ด.ญ.ปราณี', 'นายพงศธร', 'ด.ช.วิชัย', 'ด.ญ.ศิริพร'] },
  { day: 'พุธ', group: 'กลุ่ม 3', leader: 'นายสมชาย', members: ['นายสมชาย สายกวาด', 'ด.ญ.สมหญิง ขยันดี', 'นายธีรเดช', 'ด.ญ.กมลวรรณ'] },
  { day: 'พฤหัสบดี', group: 'กลุ่ม 4', leader: 'ด.ช.ธนกฤต', members: ['ด.ช.ธนกฤต', 'ด.ญ.ชลธิชา', 'นายภานุพงศ์', 'ด.ญ.วรรณิสา'] },
  { day: 'ศุกร์', group: 'กลุ่ม 5', leader: 'ด.ญ.นัชชา', members: ['ด.ญ.นัชชา', 'นายสุรศักดิ์', 'ด.ช.พีรพล', 'ด.ญ.กนกวรรณ'] },
];

export default function App() {
  // Authentication States
  const [currentUser, setCurrentUser] = useState(null); // null = Not Logged In
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // App States
  const [activeTab, setActiveTab] = useState('duty'); // 'duty', 'review', 'roster', 'leaderboard', 'swap'
  const [showGridOverlay, setShowGridOverlay] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Duty Leader Checklist State
  const [attendance, setAttendance] = useState({
    'นายสมชาย สายกวาด': 'present',
    'ด.ญ.สมหญิง ขยันดี': 'present',
    'นายธีรเดช': 'present',
    'ด.ญ.กมลวรรณ': 'absent'
  });
  const [dutyNotes, setDutyNotes] = useState('จัดโต๊ะเก้าอี้เรียบร้อย กวาดและถูพื้นแล้ว ถังขยะนำไปทิ้งเรียบร้อยครับ');

  // Submissions State
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      date: '2026-09-23',
      day: 'พุธ',
      group: 'กลุ่ม 3',
      leader: 'นายสมชาย สายกวาด',
      attendance: { 'นายสมชาย สายกวาด': 'present', 'ด.ญ.สมหญิง ขยันดี': 'present', 'นายธีรเดช': 'present', 'ด.ญ.กมลวรรณ': 'absent' },
      photo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      notes: 'ทำความสะอาดเรียบร้อย ถังขยะนำไปเทที่จุดรวบรวมแล้วครับ',
      status: 'pending', // pending, approved, rejected
      rating: 0,
      feedback: ''
    }
  ]);

  // Rosters State
  const [rosters, setRosters] = useState(INITIAL_ROSTERS);

  // Shift Swap State
  const [swapRequests, setSwapRequests] = useState([
    { id: 1, requester: 'ด.ญ.สมหญิง ขยันดี', currentDay: 'พุธ (กลุ่ม 3)', targetDay: 'ศุกร์ (กลุ่ม 5)', targetPerson: 'ด.ญ.กนกวรรณ', reason: 'ติดซ้อมดนตรีโรงเรียน', status: 'รอการตอบรับ' }
  ]);

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const foundUser = Object.values(DEMO_USERS).find(
      u => u.username === usernameInput.trim() && u.password === passwordInput
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      // Set default view depending on role
      if (foundUser.role === 'teacher') setActiveTab('review');
      else if (foundUser.role === 'leader') setActiveTab('duty');
      else setActiveTab('schedule');
      
      showToast(`ยินดีต้อนรับเข้าสู่ระบบ: ${foundUser.name}`);
    } else {
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (ลองใช้บัญชีทดสอบด้านล่าง)');
    }
  };

  const handleQuickLogin = (roleKey) => {
    const user = DEMO_USERS[roleKey];
    setUsernameInput(user.username);
    setPasswordInput(user.password);
    setCurrentUser(user);
    setLoginError('');
    
    if (user.role === 'teacher') setActiveTab('review');
    else if (user.role === 'leader') setActiveTab('duty');
    else setActiveTab('schedule');

    showToast(`เข้าสู่ระบบในฐานะ: ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError('');
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitDuty = () => {
    const newSub = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      day: 'พุธ',
      group: 'กลุ่ม 3',
      leader: currentUser.name,
      attendance: attendance,
      photo: selectedPhoto || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80',
      notes: dutyNotes,
      status: 'pending',
      rating: 0,
      feedback: ''
    };
    setSubmissions([newSub, ...submissions]);
    showToast('📲 ส่งรายงานเวรทำความสะอาดให้ครูประจำชั้นเรียบร้อยแล้ว!');
    setActiveTab('review');
  };

  const handleReviewSubmission = (id, status, rating, feedback) => {
    setSubmissions(submissions.map(sub => {
      if (sub.id === id) {
        return { ...sub, status, rating, feedback };
      }
      return sub;
    }));
    showToast(status === 'approved' ? '✅ อนุมัติรายงานเวรเรียบร้อยแล้ว' : '⚠️ ส่งข้อความแจ้งแก้ไขแล้ว');
  };

  const handleShuffleRosters = () => {
    const allMembers = rosters.flatMap(r => r.members);
    const shuffled = [...allMembers].sort(() => Math.random() - 0.5);
    
    const updated = rosters.map((r, idx) => ({
      ...r,
      members: shuffled.slice(idx * 4, (idx + 1) * 4),
      leader: shuffled[idx * 4] || r.leader
    }));
    setRosters(updated);
    showToast('🎲 สุ่มจัดกลุ่มเวรทำความสะอาดใหม่เรียบร้อยแล้ว!');
  };

  // --- LOGIN PAGE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        {/* Card */}
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-9 h-9 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              CleanClassroom
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              ระบบบริหารจัดการเวรทำความสะอาดห้องเรียน
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                ชื่อผู้ใช้งาน (Username)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="กรอก Username เช่น teacher, leader"
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="กรอกรหัสผ่าน"
                  className="w-full pl-11 pr-11 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-semibold text-slate-950 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              เข้าสู่ระบบ
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="mt-8 pt-6 border-t border-slate-700/60">
            <p className="text-xs text-center text-slate-400 font-medium mb-3">
              ⚡ ทดลองเข้าใช้งานรวดเร็ว (Quick Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('teacher')}
                className="p-2.5 bg-slate-700/50 hover:bg-emerald-500/20 border border-slate-600/50 hover:border-emerald-500/50 rounded-xl text-xs text-slate-200 transition-all flex flex-col items-center gap-1 text-center"
              >
                <span className="text-lg">👩‍🏫</span>
                <span className="font-semibold text-emerald-400">ครูประจำชั้น</span>
              </button>
              <button
                onClick={() => handleQuickLogin('leader')}
                className="p-2.5 bg-slate-700/50 hover:bg-teal-500/20 border border-slate-600/50 hover:border-teal-500/50 rounded-xl text-xs text-slate-200 transition-all flex flex-col items-center gap-1 text-center"
              >
                <span className="text-lg">🧑‍เก</span>
                <span className="font-semibold text-teal-400">หัวหน้าเวร</span>
              </button>
              <button
                onClick={() => handleQuickLogin('student')}
                className="p-2.5 bg-slate-700/50 hover:bg-sky-500/20 border border-slate-600/50 hover:border-sky-500/50 rounded-xl text-xs text-slate-200 transition-all flex flex-col items-center gap-1 text-center"
              >
                <span className="text-lg">👧</span>
                <span className="font-semibold text-sky-400">นักเรียน</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              * รหัสผ่านเริ่มต้นของทุกบทบาทคือ <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400">1234</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      {/* Toast Notification Simulation */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-300 font-medium animate-bounce">
          <Bell className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-tight">CleanClassroom</h1>
              <p className="text-xs text-slate-400">ห้องเรียน ม.4/7 ประจำปีการศึกษา 2569</p>
            </div>
          </div>

          {/* User Status Badge & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <span className="text-lg">{currentUser.avatar}</span>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400">{currentUser.roleName}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800">
          {(currentUser.role === 'leader' || currentUser.role === 'teacher') && (
            <button
              onClick={() => setActiveTab('duty')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 transition-all ${
                activeTab === 'duty'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              บันทึกตรวจเวรประจำวัน
            </button>
          )}

          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            รายงานการตรวจเวร ({submissions.length})
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'roster'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            ตารางเวรประจำสัปดาห์
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard คะแนนความสะอาด
          </button>

          <button
            onClick={() => setActiveTab('swap')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shrink-0 transition-all ${
              activeTab === 'swap'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            ยื่นขอสลับเวร
          </button>
        </div>

        {/* TAB 1: DUTY LEADER RECORDING FORM */}
        {activeTab === 'duty' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Attendance & Notes */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Card 1: Attendance Check */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      เช็คชื่อสมาชิกกลุ่มเวรประจำวัน
                    </h2>
                    <p className="text-xs text-slate-400">เวรประจำวันพุธ (กลุ่ม 3)</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                    สมาชิก 4 คน
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(attendance).map(([memberName, status]) => (
                    <div key={memberName} className="flex items-center justify-between p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                      <span className="text-sm font-medium text-slate-200">{memberName}</span>
                      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
                        <button
                          type="button"
                          onClick={() => setAttendance({ ...attendance, [memberName]: 'present' })}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            status === 'present' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          มาทำ
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttendance({ ...attendance, [memberName]: 'absent' })}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            status === 'absent' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          ขาด/หนี
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Remarks / Notes */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <MessageSquareText className="w-5 h-5 text-emerald-400" />
                  หมายเหตุ / ปัญหาที่พบ
                </h2>
                <textarea
                  rows={3}
                  value={dutyNotes}
                  onChange={(e) => setDutyNotes(e.target.value)}
                  placeholder="เช่น ไม้กวาดชำรุด 1 อัน, จัดโต๊ะเรียบร้อย..."
                  className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>

            {/* Right Column: Photo Attachment & Rule of Thirds Grid */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Camera className="w-5 h-5 text-emerald-400" />
                      ถ่ายภาพแนบส่งตรวจเวร
                    </h2>
                    <p className="text-xs text-slate-400">ใช้เส้นตาราง 9 ช่อง เพื่อช่วยจัดมุมกล้องกว้าง</p>
                  </div>

                  {/* Toggle Rule of Thirds Grid */}
                  <button
                    onClick={() => setShowGridOverlay(!showGridOverlay)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                      showGridOverlay
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    Grid 点 9 ช่อง
                  </button>
                </div>

                {/* Viewfinder Simulator */}
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center group">
                  <img
                    src={selectedPhoto || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=800&q=80"}
                    alt="Classroom"
                    className="w-full h-full object-cover"
                  />

                  {/* RULE OF THIRDS GRID OVERLAY */}
                  {showGridOverlay && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-500/30">
                      <div className="border-r border-b border-emerald-500/25"></div>
                      <div className="border-r border-b border-emerald-500/25"></div>
                      <div className="border-b border-emerald-500/25"></div>
                      <div className="border-r border-b border-emerald-500/25"></div>
                      <div className="border-r border-b border-emerald-500/25"></div>
                      <div className="border-b border-emerald-500/25"></div>
                      <div className="border-r border-emerald-500/25"></div>
                      <div className="border-r border-emerald-500/25"></div>
                      <div></div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    จัดองค์ประกอบภาพเรียบร้อย
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  onClick={handleSubmitDuty}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 font-bold text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-base"
                >
                  <Send className="w-5 h-5" />
                  ส่งรายงานให้ครูประจำชั้นตรวจสอบ
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: TEACHER REVIEW & SUBMISSIONS QUEUE */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">คิวตรวจงานเวรทำความสะอาด</h2>
                <p className="text-xs text-slate-400">สำหรับครูประจำชั้นตรวจสอบและประเมินผล</p>
              </div>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
                ทั้งหมด {submissions.length} รายการ
              </span>
            </div>

            {submissions.map((sub) => (
              <div key={sub.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                
                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center font-bold text-emerald-400">
                      {sub.group}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">รายงานเวรประจำวัน{sub.day} ({sub.date})</h3>
                      <p className="text-xs text-slate-400">หัวหน้าเวร: <span className="text-slate-200">{sub.leader}</span></p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {sub.status === 'pending' && (
                      <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> รอครูตรวจสอบ
                      </span>
                    )}
                    {sub.status === 'approved' && (
                      <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> อนุมัติผ่านแล้ว ({sub.rating} ⭐)
                      </span>
                    )}
                    {sub.status === 'rejected' && (
                      <span className="px-3.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> ให้กลับไปแก้ไข
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Photo */}
                  <div className="md:col-span-5 aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
                    <img src={sub.photo} alt="Report" className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">การเข้าทำเวรของสมาชิก</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(sub.attendance).map(([name, stat]) => (
                          <span
                            key={name}
                            className={`px-3 py-1 rounded-xl text-xs font-medium border ${
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
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">หมายเหตุจากหัวหน้าเวร</h4>
                      <p className="text-sm text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">{sub.notes}</p>
                    </div>

                    {/* Teacher Action Controls */}
                    {currentUser.role === 'teacher' && sub.status === 'pending' && (
                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ส่วนประเมินสำหรับครูประจำชั้น</h4>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleReviewSubmission(sub.id, 'approved', 5, 'ห้องสะอาดเรียบร้อยมากครับ')}
                            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-4 h-4" /> อนุมัติผ่าน (ให้ 5 ดาว ⭐)
                          </button>
                          <button
                            onClick={() => handleReviewSubmission(sub.id, 'rejected', 0, 'ยังมีขยะใต้อาคาร ให้กลับไปกวาดเพิ่มเติม')}
                            className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold rounded-xl transition-all text-sm"
                          >
                            ให้แก้ไข
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* TAB 3: WEEKLY ROSTER MANAGEMENT */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">ตารางเวรทำความสะอาดประจำสัปดาห์</h2>
                <p className="text-xs text-slate-400">แบ่งกลุ่มรับผิดชอบตั้งแต่วันจันทร์ - วันศุกร์</p>
              </div>

              {currentUser.role === 'teacher' && (
                <button
                  onClick={handleShuffleRosters}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                >
                  <RefreshCw className="w-4 h-4" />
                  สุ่มจัดกลุ่มเวรใหม่ (Auto Shuffle)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {rosters.map((ros) => (
                <div key={ros.day} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                      <span className="font-bold text-emerald-400 text-base">วัน{ros.day}</span>
                      <span className="text-xs text-slate-400 font-medium">{ros.group}</span>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">
                      หัวหน้าเวร: <span className="text-slate-200 font-medium">{ros.leader}</span>
                    </p>

                    <div className="space-y-2">
                      {ros.members.map((mem, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-800/50 rounded-xl text-xs text-slate-200 border border-slate-700/40 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                          <span>{mem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LEADERBOARD & STARS */}
        {activeTab === 'leaderboard' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="text-center max-w-md mx-auto my-4">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl font-bold text-white">Leaderboard กลุ่มเวรยอดเยี่ยม</h2>
              <p className="text-xs text-slate-400">สะสมคะแนนดาวจากการตรวจเวรประจำเดือนกันยายน</p>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              {[
                { rank: 1, group: 'กลุ่ม 3 (วันพุธ)', stars: '48 ดาว', leader: 'นายสมชาย', badge: '🥇 อันดับ 1' },
                { rank: 2, group: 'กลุ่ม 1 (วันจันทร์)', stars: '45 ดาว', leader: 'นายกิตติศักดิ์', badge: '🥈 อันดับ 2' },
                { rank: 3, group: 'กลุ่ม 5 (วันศุกร์)', stars: '42 ดาว', leader: 'ด.ญ.นัชชา', badge: '🥉 อันดับ 3' },
                { rank: 4, group: 'กลุ่ม 2 (วันอังคาร)', stars: '39 ดาว', leader: 'ด.ญ.ปราณี', badge: '' },
                { rank: 5, group: 'กลุ่ม 4 (วันพฤหัสบดี)', stars: '36 ดาว', leader: 'ด.ช.ธนกฤต', badge: '' },
              ].map((item) => (
                <div key={item.rank} className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-lg text-emerald-400 w-6">{item.rank}</span>
                    <div>
                      <div className="font-bold text-slate-100 text-sm">{item.group}</div>
                      <div className="text-xs text-slate-400">หัวหน้า: {item.leader}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.badge && <span className="text-xs font-bold text-amber-400">{item.badge}</span>}
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
                      ⭐ {item.stars}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SHIFT SWAP */}
        {activeTab === 'swap' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">ระบบยื่นขอสลับเวรกับเพื่อน</h2>
                <p className="text-xs text-slate-400">กรณีติดธุระ ป่วย หรือติดซ้อมกิจกรรมโรงเรียน</p>
              </div>
            </div>

            <div className="space-y-4">
              {swapRequests.map((req) => (
                <div key={req.id} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.requester}</span>
                      <span className="text-xs text-emerald-400">ขอสลับจาก {req.currentDay} ➡️ {req.targetDay}</span>
                    </div>
                    <p className="text-xs text-slate-400">เหตุผล: {req.reason}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold">
                      {req.status}
                    </span>
                    {currentUser.role === 'teacher' && (
                      <button
                        onClick={() => showToast('อนุมัติการสลับเวรเรียบร้อยแล้ว')}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-bold"
                      >
                        อนุมัติ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
