import { useState } from "react";
import { LockKeyhole, UserRound, X, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginModal({ onClose, onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    // DEMO ONLY: autentikasi frontend ini belum aman untuk produksi.
    // Ganti dengan verifikasi backend Google Apps Script/server sebelum dipublikasikan.
    if (username.trim() === "admin" && password === "admin123") {
      onSuccess();
    } else {
      setError("Username atau password tidak sesuai.");
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="login-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Tutup"><X size={20}/></button>
        <div className="login-icon"><ShieldCheck size={30}/></div>
        <h2>Login Administrator</h2>
        <p className="muted">Masuk untuk mengelola inventaris obat.</p>
        <form onSubmit={submit} className="form-stack">
          <label>Username</label>
          <div className="input-icon"><UserRound size={18}/><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Masukkan username" autoFocus required /></div>
          <label>Password</label>
          <div className="input-icon"><LockKeyhole size={18}/><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required/><button type="button" className="plain-icon" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-full" type="submit">Masuk sebagai Admin</button>
        </form>
        <div className="demo-hint">Akun demo: <b>admin</b> / <b>admin123</b></div>
      </section>
    </div>
  );
}
