import { initialMedicines, initialTransactions } from "../data/initialData";

const KEYS = {
  medicines: "hcklinik_medicines_v1",
  transactions: "hcklinik_transactions_v1",
  activities: "hcklinik_activities_v1"
};

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export const getMedicines = () => read(KEYS.medicines, initialMedicines);
export const saveMedicines = (items) => localStorage.setItem(KEYS.medicines, JSON.stringify(items));
export const getTransactions = () => read(KEYS.transactions, initialTransactions);
export const saveTransactions = (items) => localStorage.setItem(KEYS.transactions, JSON.stringify(items));
export const getActivities = () => read(KEYS.activities, []);

export function addActivity(message) {
  const items = getActivities();
  items.unshift({
    id: `${Date.now()}-${Math.floor(Math.random() * 9999)}`,
    message,
    date: new Date().toISOString()
  });
  localStorage.setItem(KEYS.activities, JSON.stringify(items.slice(0, 300)));
}

export function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
