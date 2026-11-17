import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import "./App.css";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import DrugDetailModal from "./components/DrugDetailModal";
import LoginModal from "./components/LoginModal";
import { getMedicines, saveMedicines, getTransactions, saveTransactions, getActivities, addActivity, makeId } from "./services/storage";

export default function App() {
  const [medicines, setMedicines] = useState(getMedicines);
  const [transactions, setTransactions] = useState(getTransactions);
  const [activities, setActivities] = useState(getActivities);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => saveMedicines(medicines), [medicines]);
  useEffect(() => saveTransactions(transactions), [transactions]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  function recordTake(payload) {
    const medicine = medicines.find(m => m.id === selectedMedicine.id);
    if (!medicine || payload.quantity > medicine.stock) {
      notify("Stok tidak mencukupi. Silakan periksa kembali.");
      return;
    }
    const updatedMedicines = medicines.map(m => m.id === medicine.id ? { ...m, stock: m.stock - payload.quantity } : m);
    const transaction = {
      id: makeId("TRX"),
      date: new Date().toISOString(),
      type: "Keluar",
      medicineId: medicine.id,
      medicineName: medicine.name,
      quantity: payload.quantity,
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
  }

  function updateMedicines(items) {
    setMedicines(items);
    addActivity("Admin memperbarui data obat.");
    setActivities(getActivities());
    notify("Data obat berhasil diperbarui.");
  }

  function stockIn(medicineId, quantity, note) {
    const medicine = medicines.find(m => m.id === medicineId);
    if (!medicine) return;
    setMedicines(prev => prev.map(m => m.id === medicineId ? { ...m, stock: m.stock + quantity } : m));
    setTransactions(prev => [...prev, {
      id: makeId("TRX"), date: new Date().toISOString(), type: "Masuk",
      medicineId, medicineName: medicine.name, quantity, unit: medicine.unit,
      employee: "Admin", department: "Gudang", note, status: "Tercatat"
    }]);
    addActivity(`Admin menambahkan stok ${medicine.name} sebanyak ${quantity} ${medicine.unit}.`);
    setActivities(getActivities());
    notify("Stok masuk berhasil dicatat.");
  }

  if (isAdmin) {
    return <>
      <AdminDashboard medicines={medicines} transactions={transactions} activities={activities}
        onSaveMedicines={updateMedicines} onStockIn={stockIn} onLogout={() => setIsAdmin(false)} />
      {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    </>;
  }

  return <>
    <UserDashboard medicines={medicines} transactions={transactions}
      onSelectMedicine={setSelectedMedicine} onAdmin={() => setShowLogin(true)} />
    {selectedMedicine && <DrugDetailModal medicine={selectedMedicine} onClose={() => setSelectedMedicine(null)} onTake={recordTake}/>}
    {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={() => { setShowLogin(false); setIsAdmin(true); }}/>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </>;
}
