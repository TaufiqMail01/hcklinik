import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import "./App.css";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DrugDetailModal from "./components/DrugDetailModal";
import LoginModal from "./components/LoginModal";
import { supabase } from "./services/supabase";

export default function App() {
  const [medicines, setMedicines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  // Ambil data awal dari Supabase saat aplikasi dimuat
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: medData, error: medErr } = await supabase.from("medicines").select("*");
      const { data: trxData, error: trxErr } = await supabase.from("transactions").select("*");
      const { data: actData, error: actErr } = await supabase.from("activities").select("*");

      if (medErr) console.error("Error fetching medicines:", medErr);
      if (trxErr) console.error("Error fetching transactions:", trxErr);
      if (actErr) console.error("Error fetching activities:", actErr);

      if (medData) setMedicines(medData);
      if (trxData) setTransactions(trxData);
      if (actData) setActivities(actData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Gagal terhubung ke Supabase:", err);
      notify("Gagal memuat data dari server.");
    } finally {
      setLoading(false);
    }
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function addActivityMessage(message) {
    const newAct = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toISOString()
    };
    setActivities(prev => [newAct, ...prev]);
    await supabase.from("activities").insert([newAct]);
  }

  // Pencatatan Pengambilan Obat oleh User (Stok Keluar) - Diperbarui dengan Key Ganda
  async function recordTake(payload) {
    const medicine = medicines.find(m => m.id === selectedMedicine.id);
    if (!medicine || payload.quantity > medicine.stock) {
      notify("Stok tidak mencukupi. Silakan periksa kembali.");
      return;
    }

    const newStock = Number(medicine.stock) - Number(payload.quantity);
    const updatedMedicines = medicines.map(m => m.id === medicine.id ? { ...m, stock: newStock } : m);
    
    // Objek transaksi dengan properti lengkap (mendukung camelCase & snake_case)
    const transaction = {
      id: `TRX${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: "Keluar",
      medicineId: medicine.id,
      medicine_id: medicine.id,
      medicineName: medicine.name,
      medicine_name: medicine.name,
      quantity: Number(payload.quantity),
      unit: medicine.unit,
      employee: payload.employee,
      department: payload.department,
      note: payload.note,
      status: "Tercatat"
    };

    setMedicines(updatedMedicines);
    setTransactions(prev => [...prev, transaction]);
    setSelectedMedicine(null);
    notify("Pengambilan obat berhasil dicatat.");

    // Sinkronisasi ke Supabase
    await supabase.from("medicines").update({ stock: newStock }).eq("id", medicine.id);
    await supabase.from("transactions").insert([transaction]);
  }

  // Update Data Obat oleh Admin (Tambah / Edit / Hapus)
  async function updateMedicines(newMedicines) {
    setMedicines(newMedicines);
    await addActivityMessage("Admin memperbarui data obat.");
    notify("Data obat berhasil diperbarui.");

    // Sinkronisasi Upsert ke Supabase
    for (let m of newMedicines) {
      await supabase.from("medicines").upsert({
        id: m.id,
        name: m.name,
        category: m.category,
        form: m.form,
        unit: m.unit,
        stock: Number(m.stock),
        min_stock: Number(m.minStock || m.min_stock || 5),
        description: m.description,
        function: m.function,
        storage: m.storage,
        image: m.image
      });
    }
  }

  // Pencatatan Stok Masuk oleh Admin
  async function stockIn(medicineId, quantity, note) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    const newStock = Number(medicine.stock) + Number(quantity);
    const updatedMedicines = medicines.map(m => m.id === medicineId ? { ...m, stock: newStock } : m);
    
    const transaction = {
      id: `TRX${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      type: "Masuk",
      medicineId: medicineId,
      medicine_id: medicineId,
      medicineName: medicine.name,
      medicine_name: medicine.name,
      quantity: Number(quantity),
      unit: medicine.unit,
      employee: "Admin",
      department: "Gudang",
      note,
      status: "Tercatat"
    };

    setMedicines(updatedMedicines);
    setTransactions(prev => [...prev, transaction]);
    
    await addActivityMessage(`Admin menambahkan stok ${medicine.name} sebanyak ${quantity} ${medicine.unit}.`);
    notify("Stok masuk berhasil dicatat.");

    // Sinkronisasi ke Supabase
    await supabase.from("medicines").update({ stock: newStock }).eq("id", medicineId);
    await supabase.from("transactions").insert([transaction]);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "36px", height: "36px", border: "4px solid #2563eb", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }}></div>
          <p style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Memuat database HCKlinik dari Supabase...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <>
        <AdminDashboard 
          medicines={medicines} 
          transactions={transactions} 
          activities={activities}
          onSaveMedicines={updateMedicines} 
          onStockIn={stockIn} 
          onLogout={() => setIsAdmin(false)} 
        />
        {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
      </>
    );
  }

  return (
    <>
      <UserDashboard 
        medicines={medicines} 
        transactions={transactions}
        onSelectMedicine={setSelectedMedicine} 
        onAdmin={() => setShowLogin(true)} 
      />
      {selectedMedicine && (
        <DrugDetailModal 
          medicine={selectedMedicine} 
          onClose={() => setSelectedMedicine(null)} 
          onTake={recordTake}
        />
      )}
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)} 
          onSuccess={() => { setShowLogin(false); setIsAdmin(true); }}
        />
      )}
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </>
  );
}