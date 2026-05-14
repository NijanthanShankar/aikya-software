import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff,
  MessageSquare, Users, Hand, Send, ChevronRight, X, Settings,
  Maximize2, Crown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { liveApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { PageSpinner } from '../components/common/Spinner';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function LiveRoom() {
  const { meetingId }   = useParams();
  const { user }        = useAuth();
  const navigate        = useNavigate();
  const { socket, emit, on } = useSocket();

  /* ── Session meta ──────────────────────────── */
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Media state ───────────────────────────── */
  const [micOn, setMicOn]           = useState(true);
  const [camOn, setCamOn]           = useState(true);
  const [screenOn, setScreenOn]     = useState(false);
  const [localStream, setLocalStream]   = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  /* ── Peers ─────────────────────────────────── */
  const peersRef        = useRef({});  // socketId -> RTCPeerConnection
  const [remoteStreams, setRemoteStreams] = useState({}); // socketId -> MediaStream
  const [participants, setParticipants]  = useState([]);

  /* ── UI panels ─────────────────────────────── */
  const [panel, setPanel]   = useState('chat'); // 'chat' | 'participants'
  const [sideOpen, setSideOpen] = useState(true);
  const [raised, setRaised]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [dominantId, setDominantId] = useState(null); // socket who has focus

  /* ── Refs ──────────────────────────────────── */
  const localVideoRef = useRef(null);
  const msgEndRef     = useRef(null);

  /* ── 1. Load session ─────────────────────── */
  useEffect(() => {
    liveApi.getSession(meetingId)
      .then(({ data }) => setSession(data.session))
      .catch(() => { toast.error('Session not found'); navigate('/live'); })
      .finally(() => setLoading(false));
  }, [meetingId]);

  /* ── 2. Get local media ─────────────────── */
  useEffect(() => {
    if (!session) return;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error('Could not access camera/microphone');
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => { setLocalStream(stream); if (localVideoRef.current) localVideoRef.current.srcObject = stream; })
          .catch(() => {});
      });
    return () => localStream?.getTracks().forEach((t) => t.stop());
  }, [session]);

  /* ── 3. Join room & wire up socket ────────── */
  useEffect(() => {
    if (!session || !localStream) return;

    emit('join-room', { roomId: meetingId });

    const cleanups = [
      on('room-participants', (socketIds) => {
        setParticipants(socketIds);
        socketIds.forEach((id) => createPeerConnection(id, true));
      }),

      on('user-joined', ({ socketId, user: remoteUser }) => {
        setParticipants((p) => [...new Set([...p, socketId])]);
        toast.success(`${remoteUser?.name || 'Someone'} joined`);
        createPeerConnection(socketId, false);
      }),

      on('user-left', ({ socketId }) => {
        setParticipants((p) => p.filter((id) => id !== socketId));
        peersRef.current[socketId]?.close();
        delete peersRef.current[socketId];
        setRemoteStreams((prev) => { const n = { ...prev }; delete n[socketId]; return n; });
        toast(`A participant left`, { icon: '👋' });
      }),

      on('offer', async ({ offer, from }) => {
        const pc = getOrCreatePC(from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        emit('answer', { answer, to: from });
      }),

      on('answer', async ({ answer, from }) => {
        await peersRef.current[from]?.setRemoteDescription(new RTCSessionDescription(answer));
      }),

      on('ice-candidate', async ({ candidate, from }) => {
        try { await peersRef.current[from]?.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
      }),

      on('chat-message', (msg) => {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }),

      on('hand-raised', ({ socketId, user: u }) => {
        toast(`✋ ${u?.name || 'Someone'} raised their hand`);
      }),

      on('session-started', () => {
        setSession((s) => ({ ...s, status: 'live' }));
        toast.success('Session has started!');
      }),

      on('session-ended', () => {
        toast('Session ended', { icon: '🏁' });
        setTimeout(() => navigate('/live'), 2000);
      }),
    ];

    return () => {
      cleanups.forEach((cleanup) => typeof cleanup === 'function' && cleanup());
      emit('leave-room', { roomId: meetingId });
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
    };
  }, [session, localStream]);

  /* ── Peer helpers ──────────────────────── */
  const getOrCreatePC = useCallback((socketId) => {
    if (peersRef.current[socketId]) return peersRef.current[socketId];
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStream?.getTracks().forEach((t) => pc.addTrack(t, localStream));

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) emit('ice-candidate', { candidate, to: socketId });
    };

    pc.ontrack = ({ streams }) => {
      setRemoteStreams((prev) => ({ ...prev, [socketId]: streams[0] }));
    };

    peersRef.current[socketId] = pc;
    return pc;
  }, [localStream, emit]);

  const createPeerConnection = useCallback(async (socketId, isInitiator) => {
    const pc = getOrCreatePC(socketId);
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      emit('offer', { offer, to: socketId });
    }
  }, [getOrCreatePC, emit]);

  /* ── Controls ──────────────────────────── */
  const toggleMic = () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const toggleCam = () => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const toggleScreen = async () => {
    if (screenOn) {
      screenStream?.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
      setScreenOn(false);
      Object.values(peersRef.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        const camTrack = localStream?.getVideoTracks()[0];
        if (sender && camTrack) sender.replaceTrack(camTrack);
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(stream);
        setScreenOn(true);
        const screenTrack = stream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        screenTrack.onended = () => { setScreenOn(false); setScreenStream(null); };
      } catch { toast.error('Screen sharing cancelled'); }
    }
  };

  const toggleHand = () => {
    setRaised(!raised);
    emit(raised ? 'lower-hand' : 'raise-hand', { roomId: meetingId });
    if (!raised) toast('✋ Hand raised');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    emit('chat-message', { roomId: meetingId, message: msgInput.trim() });
    setMsgInput('');
  };

  const leaveRoom = () => {
    emit('leave-room', { roomId: meetingId });
    localStream?.getTracks().forEach((t) => t.stop());
    navigate('/live');
  };

  const handleGoLive = async () => {
    try {
      await liveApi.start(session.id);
      emit('go-live', { roomId: meetingId });
      setSession((s) => ({ ...s, status: 'live' }));
      toast.success('Session is now live!');
    } catch { toast.error('Failed to start session'); }
  };

  const handleEndSession = async () => {
    if (!confirm('End this session for everyone?')) return;
    try {
      await liveApi.end(session.id);
      emit('end-session', { roomId: meetingId });
      navigate('/instructor');
    } catch { toast.error('Failed to end session'); }
  };

  /* ── Render helpers ────────────────────── */
  const isHost     = user?.id === session?.instructorId;
  const remoteIds  = Object.keys(remoteStreams);
  const focusId    = dominantId || remoteIds[0] || null;

  if (loading) return <PageSpinner label="Joining session…" />;

  return (
    <div className="h-screen flex flex-col bg-ink overflow-hidden">
      {/* ── Top bar ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dark-800/90 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {session?.status === 'live' && <span className="flex items-center gap-1.5 badge badge-red text-xs"><span className="live-dot" />LIVE</span>}
          <span className="text-sm font-semibold text-white truncate">{session?.title}</span>
          {session?.instructor && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-white/40">
              <Crown size={12} className="text-amber-400" />{session.instructor.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isHost && session?.status === 'scheduled' && (
            <button onClick={handleGoLive} className="btn btn-danger btn-sm text-xs">Go Live</button>
          )}
          {isHost && session?.status === 'live' && (
            <button onClick={handleEndSession} className="btn btn-sm bg-red-700 text-white hover:bg-red-800 text-xs">End Session</button>
          )}
          <span className="text-xs text-white/40 hidden sm:block">{participants.length + 1} participant{participants.length !== 0 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video area */}
        <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
          {/* Main / focused video */}
          <div className="flex-1 relative bg-dark-900 rounded-xl overflow-hidden">
            {focusId && remoteStreams[focusId] ? (
              <RemoteVideo key={focusId} stream={remoteStreams[focusId]} muted={false} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-3">
                <Users size={48} />
                <p className="text-sm">Waiting for others to join…</p>
              </div>
            )}
          </div>

          {/* Participant strip */}
          {(remoteIds.length > 0 || true) && (
            <div className="flex gap-2 h-28 overflow-x-auto hide-scrollbar flex-shrink-0">
              {/* Local preview */}
              <div
                className={`relative flex-shrink-0 w-44 rounded-xl overflow-hidden bg-dark-800 cursor-pointer ring-2 ${!focusId ? 'ring-primary-500' : 'ring-transparent hover:ring-white/30'}`}
                onClick={() => setDominantId(null)}
              >
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1">
                  <span className="text-xs text-white/80 font-medium truncate max-w-[6rem]">You</span>
                  {!micOn && <MicOff size={11} className="text-red-400" />}
                </div>
                {!camOn && (
                  <div className="absolute inset-0 bg-dark-900 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">{user?.name?.[0]}</div>
                  </div>
                )}
              </div>

              {/* Remote participants */}
              {remoteIds.map((id) => (
                <div
                  key={id}
                  className={`relative flex-shrink-0 w-44 rounded-xl overflow-hidden bg-dark-800 cursor-pointer ring-2 ${dominantId === id ? 'ring-primary-500' : 'ring-transparent hover:ring-white/30'}`}
                  onClick={() => setDominantId(id === dominantId ? null : id)}
                >
                  <RemoteVideo stream={remoteStreams[id]} muted={false} />
                  <div className="absolute bottom-1.5 left-2 text-xs text-white/80 truncate max-w-[7rem]">Participant</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel */}
        {sideOpen && (
          <div className="w-72 flex-shrink-0 flex flex-col bg-dark-800/80 border-l border-white/5 animate-slide-up">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {[{ id: 'chat', icon: MessageSquare, label: 'Chat' }, { id: 'participants', icon: Users, label: `People (${participants.length + 1})` }].map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setPanel(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${panel === id ? 'text-white border-b-2 border-primary-500' : 'text-white/40 hover:text-white/70'}`}
                >
                  <Icon size={13} />{label}
                </button>
              ))}
              <button onClick={() => setSideOpen(false)} className="px-3 text-white/30 hover:text-white/60">
                <ChevronRight size={16} />
              </button>
            </div>

            {panel === 'chat' ? (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
                  {messages.length === 0 ? (
                    <p className="text-xs text-white/30 text-center pt-6">No messages yet. Say hi! 👋</p>
                  ) : messages.map((m) => (
                    <div key={m.id} className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(m.sender?.name || 'A')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-white/60 mb-0.5">{m.sender?.name}</p>
                        <p className="text-xs text-white/85 break-words leading-relaxed">{m.message}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={msgEndRef} />
                </div>
                <form onSubmit={sendMessage} className="p-2 border-t border-white/5 flex gap-2">
                  <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="Message everyone…"
                    className="flex-1 bg-white/10 text-white text-xs rounded-xl px-3 py-2 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary-500 min-w-0" />
                  <button type="submit" className="btn btn-primary p-2 rounded-xl flex-shrink-0">
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                <ParticipantRow name={user?.name || 'You'} avatar={user?.avatar} isSelf isHost={isHost} />
                {participants.map((id) => (
                  <ParticipantRow key={id} name="Participant" isSelf={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {!sideOpen && (
          <button onClick={() => setSideOpen(true)}
            className="w-8 flex-shrink-0 flex items-center justify-center bg-dark-800/60 hover:bg-dark-800 text-white/40 hover:text-white/80 transition-all border-l border-white/5">
            <ChevronRight size={16} className="rotate-180" />
          </button>
        )}
      </div>

      {/* ── Controls bar ───────────────────────── */}
      <div className="flex items-center justify-center gap-3 py-4 bg-dark-800/90 border-t border-white/5 flex-shrink-0">
        <ControlBtn active={micOn} onClick={toggleMic} activeIcon={Mic} inactiveIcon={MicOff} label={micOn ? 'Mute' : 'Unmute'} />
        <ControlBtn active={camOn} onClick={toggleCam} activeIcon={Video} inactiveIcon={VideoOff} label={camOn ? 'Stop Video' : 'Start Video'} />
        <ControlBtn active={!screenOn} onClick={toggleScreen} activeIcon={Monitor} inactiveIcon={MonitorOff} label={screenOn ? 'Stop Share' : 'Share Screen'} />
        <ControlBtn
          active={!raised}
          onClick={toggleHand}
          activeIcon={() => <span className="text-base">✋</span>}
          inactiveIcon={() => <span className="text-base">✋</span>}
          label={raised ? 'Lower Hand' : 'Raise Hand'}
          className={raised ? '!bg-amber-500 !text-white' : ''}
        />
        <button onClick={leaveRoom} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg">
            <PhoneOff size={22} className="text-white" />
          </div>
          <span className="text-[10px] text-white/40 group-hover:text-white/60">Leave</span>
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, muted }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && stream) ref.current.srcObject = stream; }, [stream]);
  return <video ref={ref} autoPlay playsInline muted={muted} className="w-full h-full object-cover" />;
}

function ParticipantRow({ name, avatar, isSelf, isHost }) {
  return (
    <div className="flex items-center gap-2.5 px-1 py-1.5">
      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {avatar ? <img src={avatar} className="w-full h-full rounded-full object-cover" alt="" /> : name[0]}
      </div>
      <span className="text-xs text-white/80 flex-1 truncate">{name}{isSelf ? ' (You)' : ''}</span>
      {isHost && <Crown size={13} className="text-amber-400 flex-shrink-0" />}
    </div>
  );
}

function ControlBtn({ active, onClick, activeIcon: ActiveIcon, inactiveIcon: InactiveIcon, label, className = '' }) {
  const Icon = active ? ActiveIcon : InactiveIcon;
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 group ${className}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
        active ? 'bg-white/10 hover:bg-white/20' : 'bg-red-600/90 hover:bg-red-600'
      }`}>
        <Icon size={20} className={active ? 'text-white' : 'text-white'} />
      </div>
      <span className="text-[10px] text-white/40 group-hover:text-white/60 leading-none">{label}</span>
    </button>
  );
}
