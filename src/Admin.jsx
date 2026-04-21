import { useState, useEffect, useRef, useCallback } from "react";
import {
  Lock, LogOut, Plus, Pencil, Trash2, Save, X, Upload,
  Package, Tag, Image, ChevronDown, Search, Eye, EyeOff,
  AlertCircle, Check, Loader2, LayoutGrid, List, ArrowLeft
} from "lucide-react";

/* ═══════════════════════════════════════════
   SUPABASE CONFIG
   ═══════════════════════════════════════════ */
const SUPABASE_URL = "https://yvizvdgnbaohjkrzdnlu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aXp2ZGduYmFvaGprcnpkbmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTQyNjMsImV4cCI6MjA5MjM3MDI2M30.FSovYin7pDVJBvqlQTaugMBt529miAE-dn5MwhYQovI";

const headers = {
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation"
};

async function supaFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function uploadImage(file) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/product-images/${fileName}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": file.type,
    },
    body: file,
  });
  if (!res.ok) throw new Error("Ошибка загрузки фото");
  return `${SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0E0E14; font-family: 'Outfit', sans-serif; color: #E8E4DF; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0E0E14; }
  ::-webkit-scrollbar-thumb { background: #2A2A36; border-radius: 3px; }
  ::selection { background: rgba(201,169,110,0.3); }

  .admin-input {
    width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
    color: #E8E4DF; font-family: 'Outfit', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.3s;
  }
  .admin-input:focus { border-color: rgba(201,169,110,0.4); }
  .admin-input::placeholder { color: #555; }

  .admin-textarea {
    width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
    color: #E8E4DF; font-family: 'Outfit', sans-serif; font-size: 14px;
    outline: none; transition: border-color 0.3s; resize: vertical; min-height: 80px;
  }
  .admin-textarea:focus { border-color: rgba(201,169,110,0.4); }

  .admin-select {
    width: 100%; padding: 12px 16px; background: #16161F;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
    color: #E8E4DF; font-family: 'Outfit', sans-serif; font-size: 14px;
    outline: none; cursor: pointer; appearance: none;
  }
  .admin-select:focus { border-color: rgba(201,169,110,0.4); }

  .btn-gold {
    padding: 12px 28px; background: linear-gradient(135deg, #C9A96E, #B8944F);
    color: #0E0E14; border: none; border-radius: 12px; font-family: 'Outfit', sans-serif;
    font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(201,169,110,0.25); }
  .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

  .btn-ghost {
    padding: 10px 20px; background: transparent; color: #8A8A9A;
    border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
    font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer;
    transition: all 0.3s; display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-ghost:hover { border-color: rgba(201,169,110,0.3); color: #C9A96E; }

  .btn-danger {
    padding: 10px 20px; background: transparent; color: #EF4444;
    border: 1px solid rgba(239,68,68,0.2); border-radius: 12px;
    font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer;
    transition: all 0.3s; display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4); }

  .card {
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px; overflow: hidden; transition: all 0.3s;
  }
  .card:hover { border-color: rgba(201,169,110,0.15); }

  .badge-new { background: #6366F1; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
  .badge-hit { background: #C9A96E; color: #0E0E14; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
  .badge-sale { background: #EF4444; color: #fff; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }

  .toast {
    position: fixed; bottom: 24px; right: 24px; padding: 16px 24px;
    border-radius: 12px; font-size: 14px; z-index: 9999;
    animation: slideUp 0.3s ease; display: flex; align-items: center; gap: 10px;
  }
  .toast-success { background: #065F46; color: #6EE7B7; border: 1px solid #10B981; }
  .toast-error { background: #7F1D1D; color: #FCA5A5; border: 1px solid #EF4444; }

  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 1s linear infinite; }

  .drop-zone {
    border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px;
    padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s;
  }
  .drop-zone:hover, .drop-zone.dragover {
    border-color: rgba(201,169,110,0.4); background: rgba(201,169,110,0.03);
  }
`;

/* ═══════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════ */
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      {type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
      {message}
    </div>
  );
}

/* ═══════════════════════════════════════════
   LOGIN SCREEN
   ═══════════════════════════════════════════ */
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async () => {
    setLoading(true); setError("");
    try {
      const data = await supaFetch("admin_settings?key=eq.admin_password&select=value");
      if (data && data[0] && data[0].value === password) {
        onLogin(true);
      } else {
        setError("Неверный пароль");
      }
    } catch (e) {
      setError("Ошибка подключения к базе");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E0E14", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,0.08), transparent)", top: "-5%", right: "-5%" }} />
      <div style={{ width: 400, padding: 48, borderRadius: 24, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Lock size={24} color="#C9A96E" />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, marginBottom: 4 }}>Админ-панель</h1>
          <p style={{ fontSize: 13, color: "#8A8A9A", fontWeight: 300 }}>Балдёж · Магазин для взрослых</p>
        </div>
        <div style={{ position: "relative", marginBottom: 20 }}>
          <input type={showPw ? "text" : "password"} className="admin-input" placeholder="Введите пароль" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            style={{ paddingRight: 44 }} />
          <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer" }}>
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p style={{ color: "#EF4444", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}><AlertCircle size={14} /> {error}</p>}
        <button className="btn-gold" onClick={handleLogin} disabled={loading || !password} style={{ width: "100%", justifyContent: "center" }}>
          {loading ? <Loader2 size={18} className="spinner" /> : "Войти"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   IMAGE UPLOADER
   ═══════════════════════════════════════════ */
function ImageUploader({ currentUrl, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUpload(url);
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  return (
    <div>
      {currentUrl ? (
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 8 }}>
          <img src={currentUrl} alt="" style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
          <button onClick={() => onUpload("")} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <X size={14} />
          </button>
          <button onClick={() => fileRef.current.click()} style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: "#fff", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
            <Pencil size={12} /> Заменить
          </button>
        </div>
      ) : (
        <div className={`drop-zone ${dragover ? "dragover" : ""}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
          onDragLeave={() => setDragover(false)}
          onDrop={(e) => { e.preventDefault(); setDragover(false); handleFile(e.dataTransfer.files[0]); }}>
          {uploading ? (
            <Loader2 size={32} color="#C9A96E" className="spinner" />
          ) : (
            <>
              <Upload size={32} color="#555" style={{ marginBottom: 12 }} />
              <p style={{ color: "#8A8A9A", fontSize: 13 }}>Нажмите или перетащите фото сюда</p>
              <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>JPG, PNG до 5 МБ</p>
            </>
          )}
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRODUCT FORM (Add / Edit)
   ═══════════════════════════════════════════ */
function ProductForm({ product, categories, onSave, onCancel }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || "",
    category_id: product?.category_id || (categories[0]?.id || ""),
    price: product?.price || "",
    old_price: product?.old_price || "",
    description: product?.description || "",
    full_description: product?.full_description || "",
    badge: product?.badge || "",
    image_url: product?.image_url || "",
    is_active: product?.is_active ?? true,
    specs_material: product?.specs?.material || "",
    specs_size: product?.specs?.size || "",
    specs_color: product?.specs?.color || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    const payload = {
      name: form.name,
      category_id: form.category_id || null,
      price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      description: form.description || null,
      full_description: form.full_description || null,
      badge: form.badge || null,
      image_url: form.image_url || null,
      is_active: form.is_active,
      specs: { material: form.specs_material, size: form.specs_size, color: form.specs_color },
      updated_at: new Date().toISOString(),
    };
    try {
      if (isEdit) {
        await supaFetch(`products?id=eq.${product.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await supaFetch("products", { method: "POST", body: JSON.stringify(payload) });
      }
      onSave();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <button className="btn-ghost" onClick={onCancel} style={{ padding: "8px 12px" }}><ArrowLeft size={18} /></button>
        <h2 style={{ fontSize: 22, fontWeight: 500 }}>{isEdit ? "Редактировать товар" : "Новый товар"}</h2>
      </div>

      <div className="card" style={{ padding: 32 }}>
        {/* Фото */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Image size={14} /> Фотография товара</label>
          <ImageUploader currentUrl={form.image_url} onUpload={(url) => set("image_url", url)} />
        </div>

        {/* Название */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Название *</label>
          <input className="admin-input" placeholder="Например: Velvet Touch Pro" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>

        {/* Категория + Бейдж */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Категория</label>
            <select className="admin-select" value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id} style={{ background: "#16161F" }}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Бейдж</label>
            <select className="admin-select" value={form.badge} onChange={(e) => set("badge", e.target.value)}>
              <option value="" style={{ background: "#16161F" }}>Без бейджа</option>
              <option value="Новинка" style={{ background: "#16161F" }}>Новинка</option>
              <option value="Хит" style={{ background: "#16161F" }}>Хит</option>
              <option value="Скидка" style={{ background: "#16161F" }}>Скидка</option>
            </select>
          </div>
        </div>

        {/* Цена */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Цена, ₽ *</label>
            <input className="admin-input" type="number" placeholder="5990" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Старая цена, ₽</label>
            <input className="admin-input" type="number" placeholder="7490 (для скидки)" value={form.old_price} onChange={(e) => set("old_price", e.target.value)} />
          </div>
        </div>

        {/* Описания */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Краткое описание</label>
          <input className="admin-input" placeholder="1-2 предложения для карточки" value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 8, display: "block" }}>Полное описание</label>
          <textarea className="admin-textarea" placeholder="Подробное описание для страницы товара" value={form.full_description} onChange={(e) => set("full_description", e.target.value)} />
        </div>

        {/* Характеристики */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Tag size={14} /> Характеристики</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: "#555", marginBottom: 4, display: "block" }}>Материал</label>
              <input className="admin-input" placeholder="Силикон" value={form.specs_material} onChange={(e) => set("specs_material", e.target.value)} style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#555", marginBottom: 4, display: "block" }}>Размер</label>
              <input className="admin-input" placeholder="18 × 3 см" value={form.specs_size} onChange={(e) => set("specs_size", e.target.value)} style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#555", marginBottom: 4, display: "block" }}>Цвет</label>
              <input className="admin-input" placeholder="Розовый" value={form.specs_color} onChange={(e) => set("specs_color", e.target.value)} style={{ fontSize: 13 }} />
            </div>
          </div>
        </div>

        {/* Активность */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
          <div onClick={() => set("is_active", !form.is_active)}
            style={{ width: 44, height: 24, borderRadius: 12, background: form.is_active ? "#C9A96E" : "rgba(255,255,255,0.08)", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: form.is_active ? 23 : 3, transition: "left 0.3s" }} />
          </div>
          <span style={{ fontSize: 14, color: form.is_active ? "#E8E4DF" : "#555" }}>{form.is_active ? "Активен (виден на сайте)" : "Скрыт"}</span>
        </div>

        {/* Кнопки */}
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn-gold" onClick={handleSave} disabled={saving || !form.name || !form.price}>
            {saving ? <Loader2 size={16} className="spinner" /> : <Save size={16} />}
            {isEdit ? "Сохранить" : "Добавить товар"}
          </button>
          <button className="btn-ghost" onClick={onCancel}>Отмена</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ADMIN PANEL
   ═══════════════════════════════════════════ */
export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // list, add, edit
  const [editProduct, setEditProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid, table
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = useCallback((message, type = "success") => setToast({ message, type }), []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        supaFetch("categories?order=sort_order.asc"),
        supaFetch("products?order=created_at.desc&select=*,categories(name)"),
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
    } catch (e) {
      showToast("Ошибка загрузки данных", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn, loadData]);

  const handleDelete = async (id) => {
    try {
      await supaFetch(`products?id=eq.${id}`, { method: "DELETE" });
      showToast("Товар удалён");
      loadData();
    } catch (e) {
      showToast("Ошибка удаления", "error");
    }
    setDeleteConfirm(null);
  };

  const filteredProducts = products
    .filter((p) => filterCategory === "all" || p.category_id == filterCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!loggedIn) return (<><style>{STYLES}</style><LoginScreen onLogin={setLoggedIn} /></>);

  if (view === "add") return (
    <><style>{STYLES}</style>
      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <ProductForm categories={categories} onCancel={() => setView("list")} onSave={() => { setView("list"); loadData(); showToast("Товар добавлен!"); }} />
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );

  if (view === "edit") return (
    <><style>{STYLES}</style>
      <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <ProductForm product={editProduct} categories={categories} onCancel={() => setView("list")} onSave={() => { setView("list"); loadData(); showToast("Товар обновлён!"); }} />
      </div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );

  return (
    <><style>{STYLES}</style>
      <div style={{ minHeight: "100vh" }}>
        {/* Header */}
        <header style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(14,14,20,0.9)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: "#C9A96E" }}>Балдёж</span>
            <span style={{ fontSize: 12, color: "#555", padding: "4px 10px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 6 }}>Админ-панель</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#8A8A9A" }}>Товаров: {products.length}</span>
            <button className="btn-ghost" onClick={() => setLoggedIn(false)} style={{ padding: "8px 14px" }}><LogOut size={14} /> Выйти</button>
          </div>
        </header>

        <div style={{ padding: "32px 24px", maxWidth: 1200, margin: "0 auto" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Управление товарами</h1>
              <p style={{ fontSize: 13, color: "#8A8A9A" }}>Добавляйте, редактируйте и удаляйте товары магазина</p>
            </div>
            <button className="btn-gold" onClick={() => setView("add")}><Plus size={18} /> Добавить товар</button>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 360 }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#555" }} />
              <input className="admin-input" placeholder="Поиск товаров..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 40 }} />
            </div>
            <select className="admin-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: "auto", minWidth: 180 }}>
              <option value="all" style={{ background: "#16161F" }}>Все категории</option>
              {categories.map((c) => <option key={c.id} value={c.id} style={{ background: "#16161F" }}>{c.name}</option>)}
            </select>
            <div style={{ display: "flex", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setViewMode("grid")}
                style={{ padding: "10px 14px", background: viewMode === "grid" ? "rgba(201,169,110,0.15)" : "transparent", border: "none", color: viewMode === "grid" ? "#C9A96E" : "#555", cursor: "pointer" }}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode("table")}
                style={{ padding: "10px 14px", background: viewMode === "table" ? "rgba(201,169,110,0.15)" : "transparent", border: "none", color: viewMode === "table" ? "#C9A96E" : "#555", cursor: "pointer" }}>
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: 80 }}>
              <Loader2 size={36} color="#C9A96E" className="spinner" />
              <p style={{ color: "#8A8A9A", marginTop: 16 }}>Загрузка...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredProducts.length === 0 && (
            <div style={{ textAlign: "center", padding: 80 }}>
              <Package size={48} color="#333" style={{ marginBottom: 16 }} />
              <p style={{ color: "#8A8A9A", marginBottom: 8 }}>{searchQuery ? "Ничего не найдено" : "Товаров пока нет"}</p>
              {!searchQuery && <button className="btn-gold" onClick={() => setView("add")}><Plus size={16} /> Добавить первый товар</button>}
            </div>
          )}

          {/* Grid View */}
          {!loading && viewMode === "grid" && filteredProducts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filteredProducts.map((p) => (
                <div key={p.id} className="card">
                  <div style={{ height: 180, background: p.image_url ? `url(${p.image_url}) center/cover` : "linear-gradient(135deg, #1A1A2E, #2D2D3A)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {!p.image_url && <Image size={36} color="#333" />}
                    {p.badge && <span className={p.badge === "Хит" ? "badge-hit" : p.badge === "Новинка" ? "badge-new" : "badge-sale"} style={{ position: "absolute", top: 10, left: 10 }}>{p.badge}</span>}
                    {!p.is_active && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#8A8A9A", fontSize: 13, fontWeight: 500 }}>Скрыт</span></div>}
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 11, color: "#C9A96E", letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>{p.categories?.name || "—"}</p>
                    <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>{p.name}</h3>
                    <p style={{ fontSize: 12, color: "#8A8A9A", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description || "Без описания"}</p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <div>
                        <span style={{ fontSize: 18, fontWeight: 600, color: "#C9A96E" }}>{Number(p.price).toLocaleString()} ₽</span>
                        {p.old_price && <span style={{ fontSize: 12, color: "#555", textDecoration: "line-through", marginLeft: 8 }}>{Number(p.old_price).toLocaleString()} ₽</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-ghost" onClick={() => { setEditProduct(p); setView("edit"); }} style={{ flex: 1, justifyContent: "center" }}>
                        <Pencil size={14} /> Изменить
                      </button>
                      <button className="btn-danger" onClick={() => setDeleteConfirm(p.id)} style={{ padding: "10px 14px" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {!loading && viewMode === "table" && filteredProducts.length > 0 && (
            <div className="card" style={{ overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Фото", "Название", "Категория", "Цена", "Бейдж", "Статус", "Действия"].map((h) => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, color: "#8A8A9A", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: p.image_url ? `url(${p.image_url}) center/cover` : "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {!p.image_url && <Image size={16} color="#333" />}
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 14, fontWeight: 500 }}>{p.name}</td>
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "#8A8A9A" }}>{p.categories?.name || "—"}</td>
                      <td style={{ padding: "10px 16px", fontSize: 14, color: "#C9A96E", fontWeight: 500 }}>{Number(p.price).toLocaleString()} ₽</td>
                      <td style={{ padding: "10px 16px" }}>
                        {p.badge ? <span className={p.badge === "Хит" ? "badge-hit" : p.badge === "Новинка" ? "badge-new" : "badge-sale"}>{p.badge}</span> : <span style={{ color: "#555" }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: 12, color: p.is_active ? "#10B981" : "#EF4444" }}>{p.is_active ? "Активен" : "Скрыт"}</span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn-ghost" onClick={() => { setEditProduct(p); setView("edit"); }} style={{ padding: "6px 10px" }}><Pencil size={13} /></button>
                          <button className="btn-danger" onClick={() => setDeleteConfirm(p.id)} style={{ padding: "6px 10px" }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#16161F", borderRadius: 20, padding: 32, maxWidth: 400, width: "90%", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={22} color="#EF4444" />
            </div>
            <h3 style={{ textAlign: "center", fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Удалить товар?</h3>
            <p style={{ textAlign: "center", fontSize: 13, color: "#8A8A9A", marginBottom: 24 }}>Это действие нельзя отменить. Товар будет удалён навсегда.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)} style={{ flex: 1, justifyContent: "center" }}>Отмена</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, justifyContent: "center", background: "rgba(239,68,68,0.15)" }}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  );
}
