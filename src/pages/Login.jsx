import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFleet } from '../context/FleetContext'
import { Lock, Mail, Eye, EyeOff, ArrowRight, Check } from '../components/icons'

function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 70
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 400 + 100,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.4,
    }))

    let frame
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        if (p.z < 50 || p.z > 600) p.vz *= -1
        const scale = 500 / (500 + p.z)
        const sx = cx + (p.x - cx) * scale
        const sy = cy + (p.y - cy) * scale
        ctx.beginPath()
        ctx.arc(sx, sy, scale * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,255,102,${scale * 0.7})`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i]
        const si = 500 / (500 + pi.z)
        const xi = cx + (pi.x - cx) * si
        const yi = cy + (pi.y - cy) * si
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j]
          const sj = 500 / (500 + pj.z)
          const xj = cx + (pj.x - cx) * sj
          const yj = cy + (pj.y - cy) * sj
          const dist = Math.hypot(xi - xj, yi - yj)
          if (dist < 90) {
            ctx.beginPath(); ctx.moveTo(xi, yi); ctx.lineTo(xj, yj)
            ctx.strokeStyle = `rgba(0,255,102,${0.12 * (1 - dist / 90)})`
            ctx.lineWidth = 0.6; ctx.stroke()
          }
        }
      }
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{ opacity: 0.45 }} />
}

export default function Login() {
  const { login, showToast } = useFleet()
  const navigate = useNavigate()
  const [saveCredentials, setSaveCredentials] = useState(() => localStorage.getItem('fc_save_creds') === 'true')
  const [email, setEmail] = useState(() => localStorage.getItem('fc_saved_email') || '')
  const [password, setPassword] = useState(() => localStorage.getItem('fc_saved_password') || '')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forgotModalOpen, setForgotModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) { showToast('Please enter both email and password'); return }
    if (saveCredentials) {
      localStorage.setItem('fc_save_creds', 'true')
      localStorage.setItem('fc_saved_email', email)
      localStorage.setItem('fc_saved_password', password)
    } else {
      localStorage.removeItem('fc_save_creds')
      localStorage.removeItem('fc_saved_email')
      localStorage.removeItem('fc_saved_password')
    }
    setIsSubmitting(true)
    setTimeout(() => { login(email, password); setIsSubmitting(false); navigate('/') }, 900)
  }

  const handleResetPassword = (e) => {
    e.preventDefault()
    if (!resetEmail) return
    setResetSuccess(true)
    setTimeout(() => {
      setForgotModalOpen(false); setResetSuccess(false); setResetEmail('')
      showToast('Password reset link sent to your inbox')
    }, 1400)
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-base text-hi font-sans">
      <div className="pointer-events-none absolute inset-0">
        <ParticleCanvas />
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,102,0.08) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite' }} />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,255,102,0.06) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite reverse' }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: 'linear-gradient(rgba(0,255,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,102,1) 1px, transparent 1px)', backgroundSize: '50px 50px', transform: 'perspective(600px) rotateX(55deg) translateY(-80px) scale(2.8)', transformOrigin: 'top center' }} />
      </div>

      <div className="relative z-10 mx-4 w-full max-w-sm">
        <div className="rounded-2xl border border-white/[0.08] bg-panel/80 px-8 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="mb-5 text-center">
            <div className="font-display text-[32px] font-bold leading-none tracking-tight">
              Electri<span className="text-green-400" style={{ filter: 'drop-shadow(0 0 2px rgba(0,255,102,0.95)) drop-shadow(0 0 22px rgba(0,255,102,0.55))' }}>E</span>
            </div>
            <p className="mt-1 text-[12px] text-dim tracking-wide">Fleet Telemetry & Operations</p>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-[10.5px] font-medium uppercase tracking-widest text-dim">Sign in</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11.5px] font-medium text-lo">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 h-4 w-4 text-dim" strokeWidth={2} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full rounded-xl border border-line bg-panel-2/60 px-3.5 py-2 pl-10 text-[13px] text-hi placeholder:text-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11.5px] font-medium text-lo">Password</label>
                <button type="button" onClick={() => setForgotModalOpen(true)} className="text-[11px] text-accent hover:underline cursor-pointer">Forgot password?</button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 h-4 w-4 text-dim" strokeWidth={2} />
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full rounded-xl border border-line bg-panel-2/60 px-3.5 py-2 pl-10 pr-10 text-[13px] text-hi placeholder:text-dim focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-dim hover:text-hi transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Save Credentials */}
            <label className="flex cursor-pointer items-center gap-2.5 select-none">
              <div
                onClick={() => setSaveCredentials(!saveCredentials)}
                className={`relative h-4 w-4 shrink-0 rounded border transition-all cursor-pointer ${
                  saveCredentials ? 'border-accent bg-accent' : 'border-line bg-panel-2/60'
                }`}
              >
                {saveCredentials && (
                  <svg className="absolute inset-0 h-full w-full p-[2.5px] text-base" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-[12px] text-lo" onClick={() => setSaveCredentials(!saveCredentials)}>
                Save credentials on this device
              </span>
            </label>

            <button type="submit" disabled={isSubmitting} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[13.5px] font-semibold text-base transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer">
              {isSubmitting ? (
                <><div className="h-4 w-4 rounded-full border-2 border-base border-t-transparent animate-spin" /><span>Authenticating…</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="h-4 w-4" strokeWidth={2.5} /></>
              )}
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-line bg-panel-2/40 px-4 py-2.5 text-center">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-dim">Demo Credentials</p>
            <p className="font-mono text-[11.5px] text-lo">Email: <span className="text-hi">admin@electrie.io</span></p>
            <p className="font-mono text-[11.5px] text-lo">Password: <span className="text-hi">admin2026pass</span></p>
          </div>
        </div>
        <p className="mt-4 text-center text-[10.5px] text-dim">Authorized personnel only · ElectriE Telemetry v2.4</p>
      </div>

      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="font-display text-[15px] font-bold text-hi">Reset Password</div>
              <button onClick={() => setForgotModalOpen(false)} className="rounded-lg p-1 text-dim hover:bg-hover hover:text-hi cursor-pointer">✕</button>
            </div>
            {resetSuccess ? (
              <div className="my-6 flex flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/15 text-accent"><Check className="h-6 w-6" strokeWidth={2.5} /></div>
                <div className="text-[13.5px] font-semibold text-hi">Link Sent!</div>
                <p className="mt-1 text-[11.5px] text-lo">Check your inbox for the recovery link.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 flex flex-col gap-4">
                <p className="text-[12px] text-lo">Enter your registered email to receive a password reset link.</p>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 h-4 w-4 text-dim" />
                  <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="admin@company.com" className="w-full rounded-xl border border-line bg-panel-2 px-3.5 py-2.5 pl-10 text-[13px] text-hi focus:border-accent focus:outline-none" />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setForgotModalOpen(false)} className="rounded-xl border border-line px-4 py-2 text-[12px] font-medium text-lo hover:bg-hover cursor-pointer">Cancel</button>
                  <button type="submit" className="rounded-xl bg-accent px-4 py-2 text-[12px] font-semibold text-base hover:bg-accent/90 cursor-pointer">Send Link</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
