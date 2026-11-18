import { useMemo, useState } from "react";
import { History, Info, Search, ShieldCheck, Pill, HeartPulse, LayoutGrid } from "lucide-react";

const categories = [
  "Semua",
  "Pereda Nyeri & Demam", // Pengganti Analgesik (cth: Paracetamol, Ibuprofen)
  "Flu & Batuk",          // Sangat sering dicari di kantor (cth: Decolgen, OBH)
  "Obat Lambung",         // Pengganti Antasida (cth: Promag, Mylanta, Polysilane)
  "Pencernaan & Diare",   // Pengganti Rehidrasi (cth: Oralit, Diatabs, Norit)
  "Vitamin & Suplemen",   // Untuk daya tahan tubuh (cth: Vitamin C, Enervon-C)
  "P3K & Obat Luar",      // Sangat penting di kantor (cth: Betadine, Plester, Minyak Kayu Putih)
  "Lainnya"               // Untuk obat alergi, obat tetes mata, dll.
];

export default function UserDashboard({ medicines, transactions, onSelectMedicine, onAdmin }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [showHistory, setShowHistory] = useState(false);

  const filtered = useMemo(() => medicines.filter((m) =>
    (category === "Semua" || m.category === category) &&
    (m.name.toLowerCase().includes(query.toLowerCase()) || m.category.toLowerCase().includes(query.toLowerCase()))
  ), [medicines, query, category]);

  return (
    <div className="user-page">
      <header className="public-header">
        <div className="public-brand"><div className="brand-symbol"><HeartPulse size={34}/></div><div><b>HCKLINIK</b><small>Sistem Pencatatan Digital Pengambilan Obat</small></div></div>
        <div className="header-actions">
          <button className={`btn ${showHistory ? "btn-primary" : "btn-soft"}`} onClick={() => setShowHistory(!showHistory)}><History size={17}/> Riwayat Pengambilan</button>
          <button className="btn btn-outline" onClick={onAdmin}><ShieldCheck size={17}/> Admin</button>
        </div>
      </header>

      <section className="welcome-banner">
        <div><span className="eyebrow">LAYANAN KESEHATAN KARYAWAN</span><h1>Selamat Datang!</h1><p>Pilih obat yang Anda butuhkan dan catat pengambilannya dengan mudah.</p></div>
        <div className="banner-art"><Pill size={76}/><HeartPulse size={54}/></div>
      </section>

      {showHistory ? (
        <section className="content-section">
          <div className="section-heading"><div><h2><History size={22}/> Riwayat Pengambilan</h2><p>Daftar transaksi pengambilan obat yang tercatat.</p></div><button className="btn btn-outline" onClick={() => setShowHistory(false)}>Kembali ke Katalog</button></div>
          <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Nama Pengambil</th><th>Divisi</th><th>Obat</th><th>Jumlah</th></tr></thead><tbody>
            {transactions.length ? transactions.slice().reverse().map(t => <tr key={t.id}><td>{new Date(t.date).toLocaleString("id-ID")}</td><td>{t.employee}</td><td>{t.department}</td><td>{t.medicineName || t.medicine_name || "—"}</td><td>{t.quantity} {t.unit}</td></tr>) : <tr><td colSpan="5" className="empty-cell">Belum ada transaksi pengambilan.</td></tr>}
          </tbody></table></div>
        </section>
      ) : (
        <main className="content-section">
          <div className="search-row"><div className="search-box"><Search size={20}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama obat atau kategori..."/></div><span className="result-count">{filtered.length} jenis obat</span></div>
          <div className="category-row">{categories.map(c => <button key={c} className={`category-chip ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c === "Semua" && <LayoutGrid size={15}/>} {c}</button>)}</div>
          <div className="section-heading"><div><h2><Pill size={23}/> Daftar Obat</h2><p>Pilih obat untuk melihat informasi dan mencatat pengambilan.</p></div></div>
          <div className="medicine-grid">
            {filtered.map(m => <article className="medicine-card" key={m.id}>
              <div className="medicine-photo">{m.image ? <img src={m.image} alt={m.name} onError={e => { e.currentTarget.style.display = "none"; }}/> : <Pill size={55}/>}<span className={`stock-badge ${m.stock <= m.minStock ? "low" : ""}`}>Stok: {m.stock}</span></div>
              <div className="medicine-card-body"><h3>{m.name}</h3><p>{m.form} · {m.category}</p><button className="btn btn-primary btn-full" onClick={() => onSelectMedicine(m)}><Info size={16}/> Lihat Detail</button></div>
            </article>)}
          </div>
          {!filtered.length && <div className="empty-state"><Pill size={34}/><b>Obat tidak ditemukan</b><span>Coba kata kunci atau kategori lain.</span></div>}
        </main>
      )}
      <footer className="public-footer"><span>© {new Date().getFullYear()} HCKLINIK · Pencatatan Digital Pengambilan Obat</span><span><ShieldCheck size={14}/> Stok diperbarui berdasarkan transaksi</span></footer>
    </div>
  );
}
