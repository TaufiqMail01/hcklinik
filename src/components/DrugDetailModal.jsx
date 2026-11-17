import { useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardList, Info, Package, Pill, X } from "lucide-react";

export default function DrugDetailModal({ medicine, onClose, onTake }) {
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const amount = Number(quantity);
    if (!employee.trim() || !department.trim()) return setError("Nama karyawan dan divisi wajib diisi.");
    if (!Number.isInteger(amount) || amount < 1) return setError("Jumlah harus berupa bilangan bulat minimal 1.");
    if (amount > medicine.stock) return setError("Jumlah pengambilan melebihi stok yang tersedia.");
    onTake({ employee: employee.trim(), department: department.trim(), quantity: amount, note: note.trim() });
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal detail-modal" onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-header"><h2><Pill size={21}/> Detail & Pengambilan Obat</h2><button className="icon-btn" onClick={onClose}><X/></button></header>
        <div className="detail-grid">
          <div className="detail-product">
            <div className="detail-image">{medicine.image ? <img src={medicine.image} alt={medicine.name}/> : <Pill size={60}/>}</div>
            <span className={`stock-badge ${medicine.stock <= medicine.minStock ? "low" : ""}`}>Stok tersedia: {medicine.stock} {medicine.unit}</span>
            <h2>{medicine.name}</h2>
            <p className="muted">{medicine.id} · {medicine.category} · {medicine.form}</p>
            <div className="detail-copy"><h4><Info size={16}/> Deskripsi</h4><p>{medicine.description || "Belum ada deskripsi."}</p></div>
            <div className="detail-copy"><h4><CheckCircle2 size={16}/> Fungsi / Informasi</h4><p>{medicine.function || "Belum ada informasi."}</p></div>
            <div className="detail-copy"><h4><Package size={16}/> Penyimpanan</h4><p>{medicine.storage || "Ikuti petunjuk penyimpanan pada kemasan."}</p></div>
            <p className="safety-note"><AlertCircle size={15}/> Informasi ini bukan pengganti konsultasi tenaga kesehatan. Gunakan obat sesuai label atau resep.</p>
          </div>
          <form className="take-form" onSubmit={submit}>
            <h3><ClipboardList size={19}/> Form Pengambilan Obat</h3>
            <label>Nama Karyawan *</label>
            <input value={employee} onChange={(e) => setEmployee(e.target.value)} placeholder="Masukkan nama lengkap" required/>
            <label>Divisi / Departemen *</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Contoh: IT, HR, Finance" required/>
            <label>Jumlah Pengambilan *</label>
            <div className="quantity-control">
              <button type="button" onClick={() => setQuantity(Math.max(1, Number(quantity) - 1))}>−</button>
              <input type="number" min="1" max={medicine.stock} value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
              <span>{medicine.unit}</span>
              <button type="button" onClick={() => setQuantity(Math.min(medicine.stock, Number(quantity) + 1))}>+</button>
            </div>
            <label>Keterangan (opsional)</label>
            <textarea rows="4" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan keterangan jika diperlukan..."/>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary btn-full" type="submit" disabled={medicine.stock < 1}>Simpan Pengambilan</button>
            <p className="muted tiny">Stok akan berkurang setelah transaksi berhasil disimpan.</p>
          </form>
        </div>
      </section>
    </div>
  );
}
