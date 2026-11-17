import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  Activity, AlertTriangle, ArrowLeftRight, ClipboardList,
  FileSpreadsheet, LayoutDashboard, LogOut, Package, PackagePlus, Pencil, Pill,
  Plus, Search, Trash2, TrendingDown, Users, Upload
} from "lucide-react";

const menu = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["medicines", "Data Obat", Pill],
  ["incoming", "Stok Masuk", PackagePlus],
  ["outgoing", "Stok Keluar", TrendingDown],
  ["mutations", "Mutasi Stok", ArrowLeftRight],
  ["reports", "Laporan & Export", FileSpreadsheet],
  ["users", "Data Pengambil", Users],
  ["activity", "Log Aktivitas", Activity]
];

export default function AdminDashboard({ medicines, transactions, activities, onSaveMedicines, onLogout, onStockIn }) {
  const [page, setPage] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [stockForm, setStockForm] = useState(null);
  const [period, setPeriod] = useState("all");

  const totalStock = medicines.reduce((sum, m) => sum + Number(m.stock || 0), 0);
  const lowStock = medicines.filter(m => m.stock <= m.minStock).length;
  const filtered = useMemo(() => medicines.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.id.toLowerCase().includes(query.toLowerCase())), [medicines, query]);

  // Fungsi untuk menangani file upload gambar dari folder lokal
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  function saveMedicine(e) {
    e.preventDefault();
    const item = { ...form, stock: Number(form.stock), minStock: Number(form.minStock) };
    if (!item.name.trim() || item.stock < 0 || item.minStock < 0) return;
    const exists = medicines.some(m => m.id === item.id);
    onSaveMedicines(exists ? medicines.map(m => m.id === item.id ? item : m) : [...medicines, item]);
    setForm(null);
  }

  function removeMedicine(m) {
    if (window.confirm(`Hapus data ${m.name}? Transaksi lama tetap disimpan.`)) {
      onSaveMedicines(medicines.filter(x => x.id !== m.id));
    }
  }

  function exportExcel() {
    const wb = XLSX.utils.book_new();
    const medicineRows = medicines.map(({ id, name, category, form, unit, stock, minStock }) => ({ ID: id, "Nama Obat": name, Kategori: category, Bentuk: form, Satuan: unit, Stok: stock, "Batas Minimum": minStock }));
    const trxRows = transactions.map(t => ({ "ID Transaksi": t.id, Tanggal: new Date(t.date).toLocaleString("id-ID"), "Nama Pengambil": t.employee, Divisi: t.department, "Nama Obat": t.medicineName, Jumlah: t.quantity, Satuan: t.unit, Keterangan: t.note || "" }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(medicineRows), "Data Obat");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(trxRows), "Transaksi");
    XLSX.writeFile(wb, `Laporan_HCKLINIK_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  const shownTransactions = transactions.filter(t => {
    if (period === "all") return true;
    const date = new Date(t.date), now = new Date();
    if (period === "day") return date.toDateString() === now.toDateString();
    if (period === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === "year") return date.getFullYear() === now.getFullYear();
    return true;
  });

  const title = menu.find(m => m[0] === page)?.[1] || "Dashboard";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span className="brand-symbol"><Pill/></span><div><b>HCKLINIK</b><small>Administrator</small></div></div>
        <div className="sidebar-label">MENU UTAMA</div>
        <nav>{menu.map(([id, label, Icon]) => <button key={id} className={page === id ? "selected" : ""} onClick={() => setPage(id)}><Icon size={18}/>{label}</button>)}</nav>
        <button className="sidebar-logout" onClick={onLogout}><LogOut size={18}/> Keluar</button>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><span className="muted">HCKLINIK / Administrator</span><h1>{title}</h1></div><div className="admin-profile"><span className="avatar">A</span><div><b>Administrator</b><small>Admin</small></div></div></header>

        {page === "dashboard" && <>
          <div className="stats-grid">
            <Stat icon={<Pill/>} value={medicines.length} label="Jenis Obat" tone="blue"/>
            <Stat icon={<Package/>} value={totalStock.toLocaleString("id-ID")} label="Total Stok" tone="green"/>
            <Stat icon={<AlertTriangle/>} value={lowStock} label="Stok Menipis" tone="orange"/>
            <Stat icon={<ClipboardList/>} value={transactions.length} label="Total Transaksi" tone="purple"/>
          </div>
          <div className="admin-panels">
            <section className="panel"><div className="panel-heading"><div><h3>Stok Obat</h3><p>Ringkasan stok terkini</p></div><button className="btn btn-outline btn-small" onClick={() => setPage("medicines")}>Kelola Obat</button></div>
              {medicines.slice(0,6).map(m => <div className="stock-line" key={m.id}><div><b>{m.name}</b><small>{m.id} · {m.category}</small></div><div className="stock-line-value"><b>{m.stock}</b><span className={m.stock <= m.minStock ? "text-danger" : "text-success"}>{m.stock <= m.minStock ? "Menipis" : "Tersedia"}</span></div></div>)}
            </section>
            <section className="panel"><div className="panel-heading"><div><h3>Transaksi Terbaru</h3><p>Aktivitas pengambilan obat</p></div><button className="btn btn-outline btn-small" onClick={() => setPage("outgoing")}>Lihat Semua</button></div>
              {transactions.length ? transactions.slice(-5).reverse().map(t => <div className="transaction-line" key={t.id}><span className="transaction-icon"><TrendingDown size={17}/></span><div><b>{t.employee} · {t.medicineName}</b><small>{t.department} · {new Date(t.date).toLocaleString("id-ID")}</small></div><strong>-{t.quantity}</strong></div>) : <div className="empty-cell">Belum ada transaksi.</div>}
            </section>
          </div>
        </>}

        {page === "medicines" && <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Manajemen Data Obat</h3>
              <p>Tambah, ubah, dan hapus data inventaris.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setForm({ id: `MED${Math.floor(1000 + Math.random() * 9000)}`, name: "", category: "Pereda Nyeri & Demam", form: "Tablet", unit: "Tablet", stock: 0, minStock: 5, description: "", function: "", storage: "", image: "" })}>
              <Plus size={17}/> Tambah Obat
            </button>
          </div>
          <div className="search-box admin-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari nama atau ID obat..."/></div>
          <div className="table-wrap"><table><thead><tr><th>ID</th><th>Obat</th><th>Kategori</th><th>Stok</th><th>Min.</th><th>Aksi</th></tr></thead><tbody>
            {filtered.map(m => <tr key={m.id}><td>{m.id}</td><td><div className="table-medicine"><span className="mini-pill"><Pill size={16}/></span><b>{m.name}</b></div></td><td>{m.category}</td><td><span className={m.stock <= m.minStock ? "text-danger" : "text-success"}><b>{m.stock} {m.unit}</b></span></td><td>{m.minStock}</td><td><div className="table-actions"><button className="icon-action edit" title="Edit" onClick={() => setForm({...m})}><Pencil size={16}/></button><button className="icon-action delete" title="Hapus" onClick={() => removeMedicine(m)}><Trash2 size={16}/></button></div></td></tr>)}
            {!filtered.length && <tr><td colSpan="6" className="empty-cell">Data obat tidak ditemukan.</td></tr>}
          </tbody></table></div>
        </section>}

        {(page === "incoming" || page === "outgoing") && <section className="panel"><div className="panel-heading"><div><h3>{page === "incoming" ? "Pencatatan Stok Masuk" : "Riwayat Stok Keluar"}</h3><p>{page === "incoming" ? "Tambahkan jumlah stok obat." : "Transaksi pengambilan yang tercatat dari halaman user."}</p></div>{page === "incoming" && <button className="btn btn-primary" onClick={() => setStockForm({ medicineId: medicines[0]?.id || "", quantity: 1, note: "" })}><Plus size={17}/> Catat Stok Masuk</button>}</div>
          {page === "incoming" ? <div className="empty-state"><PackagePlus size={34}/><b>Stok masuk dilakukan melalui formulir</b><span>Setiap penambahan stok akan masuk ke riwayat mutasi.</span></div> :
            <TransactionTable transactions={transactions.filter(t => t.type === "Keluar" || !t.type)}/>}
        </section>}

        {page === "mutations" && <section className="panel"><div className="panel-heading"><div><h3>Mutasi Stok</h3><p>Riwayat stok masuk dan keluar.</p></div></div><TransactionTable transactions={transactions}/></section>}

        {page === "reports" && <section className="panel"><div className="panel-heading"><div><h3>Laporan & Export Excel</h3><p>Filter periode transaksi lalu unduh laporan.</p></div><button className="btn btn-success" onClick={exportExcel}><FileSpreadsheet size={17}/> Export Excel</button></div>
          <div className="filter-row"><label>Periode transaksi</label><select value={period} onChange={e => setPeriod(e.target.value)}><option value="all">Semua Periode</option><option value="day">Hari Ini</option><option value="month">Bulan Ini</option><option value="year">Tahun Ini</option></select><span>{shownTransactions.length} transaksi</span></div><TransactionTable transactions={shownTransactions}/>
        </section>}

        {page === "users" && <section className="panel"><div className="panel-heading"><div><h3>Data Pengambil Obat</h3><p>Daftar karyawan berdasarkan transaksi yang tercatat.</p></div></div><div className="table-wrap"><table><thead><tr><th>Nama</th><th>Divisi</th><th>Jumlah Transaksi</th></tr></thead><tbody>{Object.values(transactions.reduce((acc,t) => { const k = `${t.employee}|${t.department}`; acc[k] ||= { employee:t.employee, department:t.department, count:0 }; acc[k].count++; return acc; }, {})).map((u,i) => <tr key={i}><td>{u.employee}</td><td>{u.department}</td><td>{u.count}</td></tr>)}{!transactions.length && <tr><td colSpan="3" className="empty-cell">Belum ada data pengambil.</td></tr>}</tbody></table></div></section>}

        {page === "activity" && <section className="panel"><div className="panel-heading"><div><h3>Log Aktivitas</h3><p>Aktivitas pengelolaan data pada perangkat ini.</p></div></div>{activities.length ? activities.map(a => <div className="activity-row" key={a.id}><Activity size={17}/><div><b>{a.message}</b><small>{new Date(a.date).toLocaleString("id-ID")}</small></div></div>) : <div className="empty-cell">Belum ada aktivitas admin.</div>}</section>}
      </main>

      {form && (
        <div className="modal-backdrop" onMouseDown={() => setForm(null)}>
          <section className="modal admin-form-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{medicines.some(m => m.id === form.id) ? "Edit Obat" : "Tambah Obat"}</h2>
              <button className="icon-btn" onClick={() => setForm(null)}>×</button>
            </div>
            <form className="form-stack" onSubmit={saveMedicine}>
              
              {/* Baris 1: ID Obat Otomatis (ReadOnly) & Nama Obat */}
              <div className="form-two">
                <div>
                  <label>ID Obat (Otomatis)</label>
                  <input 
                    value={form.id} 
                    disabled 
                    style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed", color: "#64748b" }} 
                  />
                </div>
                <div>
                  <label>Nama Obat</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Contoh: Paracetamol 500mg" required/>
                </div>
              </div>

              {/* Baris 2: Kategori & Bentuk (Dropdown) */}
              <div className="form-two">
                <div>
                  <label>Kategori</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {[
                      "Pereda Nyeri & Demam", 
                      "Flu & Batuk", 
                      "Obat Lambung", 
                      "Pencernaan & Diare", 
                      "Vitamin & Suplemen", 
                      "P3K & Obat Luar", 
                      "Lainnya"
                    ].map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label>Bentuk</label>
                  <select value={form.form} onChange={e => setForm({...form, form: e.target.value})}>
                    {[
                      "Tablet",
                      "Kaplet",
                      "Kapsul",
                      "Sirup",
                      "Salep / Krim",
                      "Tetes Mata / Telinga",
                      "Injeksi",
                      "Supositoria",
                      "Serbuk / Puyer",
                      "Spray / Semprot",
                      "Lainnya"
                    ].map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              </div>

              {/* Baris 3: Satuan Pengambilan (Dropdown), Stok, & Stok Minimum */}
              <div className="form-three">
                <div>
                  <label>Satuan Pengambilan</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                    {[
                      "Tablet",
                      "Kaplet",
                      "Kapsul",
                      "Botol",
                      "Strip",
                      "Tube",
                      "Ampul",
                      "Sachet",
                      "Box",
                      "Pcs"
                    ].map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label>Stok</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}/>
                </div>
                <div>
                  <label>Stok Minimum</label>
                  <input type="number" min="0" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})}/>
                </div>
              </div>

              {/* Input Upload Gambar dari Folder Komputer */}
              <label>Upload Gambar Obat</label>
              <div className="upload-container" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <label className="btn btn-outline" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Upload size={16}/> Pilih Berkas Gambar
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                </label>
                {form.image && <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600" }}>✓ Gambar Terpilih</span>}
              </div>
              {form.image && (
                <div style={{ marginTop: "8px" }}>
                  <img src={form.image} alt="Preview" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                </div>
              )}

              <label>Deskripsi</label><textarea rows="2" value={form.description} onChange={e => setForm({...form,description:e.target.value})}/>
              <label>Fungsi / Informasi</label><textarea rows="2" value={form.function} onChange={e => setForm({...form,function:e.target.value})}/>
              <label>Informasi Penyimpanan</label><textarea rows="2" value={form.storage} onChange={e => setForm({...form,storage:e.target.value})}/>
              <button className="btn btn-primary btn-full" type="submit">Simpan Data Obat</button>
            </form>
          </section>
        </div>
      )}

      {stockForm && <div className="modal-backdrop" onMouseDown={() => setStockForm(null)}><section className="modal" onMouseDown={e => e.stopPropagation()}><div className="modal-header"><h2>Tambah Stok</h2><button className="icon-btn" onClick={() => setStockForm(null)}>×</button></div><form className="form-stack" onSubmit={e => {e.preventDefault(); const m = medicines.find(x => x.id === stockForm.medicineId); if (!m || Number(stockForm.quantity) < 1) return; onStockIn(m.id, Number(stockForm.quantity), stockForm.note); setStockForm(null);}}><label>Pilih Obat</label><select value={stockForm.medicineId} onChange={e => setStockForm({...stockForm,medicineId:e.target.value})}>{medicines.map(m => <option key={m.id} value={m.id}>{m.name} (stok {m.stock})</option>)}</select><label>Jumlah Stok Masuk</label><input type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm({...stockForm,quantity:e.target.value})} required/><label>Keterangan</label><textarea value={stockForm.note} onChange={e => setStockForm({...stockForm,note:e.target.value})}/><button className="btn btn-primary btn-full">Simpan Stok Masuk</button></form></section></div>}
    </div>
  );
}

function Stat({ icon, value, label, tone }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div><b>{value}</b><small>{label}</small></div></div>;
}
function TransactionTable({ transactions }) {
  return <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Jenis</th><th>Nama Pengambil / Sumber</th><th>Divisi</th><th>Obat</th><th>Jumlah</th><th>Keterangan</th></tr></thead><tbody>
    {transactions.length ? transactions.slice().reverse().map(t => <tr key={t.id}><td>{new Date(t.date).toLocaleString("id-ID")}</td><td><span className={`type-pill ${t.type === "Masuk" ? "incoming" : "outgoing"}`}>{t.type || "Keluar"}</span></td><td>{t.employee || "Admin"}</td><td>{t.department || "—"}</td><td>{t.medicineName}</td><td>{t.quantity} {t.unit}</td><td>{t.note || "—"}</td></tr>) : <tr><td colSpan="7" className="empty-cell">Belum ada data transaksi.</td></tr>}
  </tbody></table></div>;
}