import { useState, useEffect, useRef, useReducer } from "react";
import {
  ShoppingBag, Heart, Search, X, Plus, Minus, Trash2,
  Package, Truck, ShieldCheck, CreditCard, ChevronDown,
  ChevronUp, Star, Menu, ArrowRight, Instagram, Send,
  MessageCircle, Lock, Eye, Sparkles
} from "lucide-react";

/* ═══════════════════════════════════════════
   LOGO — Балдёж logo component
   ═══════════════════════════════════════════ */

function Logo({ height = 48, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", ...style }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: height * 0.75, fontWeight: 700, color: "#C9A96E", lineHeight: 1, letterSpacing: 2, background: "linear-gradient(135deg, #C9A96E 0%, #E8D5A3 40%, #C9A96E 60%, #A67C2E 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", textShadow: "none", filter: "drop-shadow(0 2px 4px rgba(201,169,110,0.3))" }}>Балдёж</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: height * 0.22, fontWeight: 400, color: "#C9A96E", letterSpacing: 3, textTransform: "uppercase", marginTop: -2, opacity: 0.8 }}>магазин для взрослых</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SUPABASE CONFIG
   ═══════════════════════════════════════════ */
const SUPABASE_URL = "https://yvizvdgnbaohjkrzdnlu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aXp2ZGduYmFvaGprcnpkbmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTQyNjMsImV4cCI6MjA5MjM3MDI2M30.FSovYin7pDVJBvqlQTaugMBt529miAE-dn5MwhYQovI";

async function supaFetch(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });
  if (!res.ok) return [];
  return res.json();
}

/* ═══════════════════════════════════════════
   DATA — Reviews, FAQ (static)
   ═══════════════════════════════════════════ */

const SAMPLE_REVIEWS = [
  { author: "Анна К.", rating: 5, text: "Качество превосходное! Доставили в дискретной упаковке, очень довольна.", date: "2 недели назад" },
  { author: "Дмитрий В.", rating: 4, text: "Хороший товар, соответствует описанию. Доставка быстрая, упаковка аккуратная.", date: "1 месяц назад" },
  { author: "Мария С.", rating: 5, text: "Заказываю уже не первый раз. Сервис на высоте, рекомендую!", date: "3 дня назад" },
];

const FAQ_DATA = [
  { q: "Как оформить заказ?", a: "Выберите товары, добавьте в корзину и перейдите к оформлению. Заполните данные доставки и выберите способ оплаты. Подтверждение придёт на указанный email." },
  { q: "Какая упаковка используется?", a: "Все заказы отправляются в полностью непрозрачной упаковке без опознавательных знаков. На посылке не указывается содержимое — только ваш адрес и номер заказа." },
  { q: "Можно ли вернуть товар?", a: "Мы принимаем возврат неиспользованных товаров в оригинальной упаковке в течение 14 дней. Бельё и косметика возврату не подлежат по гигиеническим причинам." },
  { q: "Как происходит оплата?", a: "Принимаем банковские карты, СБП, электронные кошельки и наложенный платёж. В выписке отображается нейтральное название компании." },
  { q: "Сколько занимает доставка?", a: "Доставка по Москве — 1-2 дня, по России — 3-7 дней. Доступны курьерская доставка, пункты выдачи и почта. Отслеживание по трек-номеру." },
  { q: "Товары сертифицированы?", a: "Да, все товары имеют сертификаты соответствия и проходят контроль качества. Мы работаем только с проверенными производителями." },
];

/* ═══════════════════════════════════════
   CART REDUCER
   ═══════════════════════════════════════ */

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.id === action.product.id);
      if (existing) return state.map((i) => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE": return state.filter((i) => i.id !== action.id);
    case "INC": return state.map((i) => i.id === action.id ? { ...i, qty: i.qty + 1 } : i);
    case "DEC": return state.map((i) => i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i);
    default: return state;
  }
}

/* ═══════════════════════════════════════
   HELPER — Intersection Observer hook
   ═══════════════════════════════════════ */

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════ */

export default function BaldejShop() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [favorites, setFavorites] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortBy, setSortBy] = useState("popular");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(null);
  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const catalogRef = useRef(null);

  // Load products and categories from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          supaFetch("products?is_active=eq.true&select=*,categories(name)&order=sort_order.asc,created_at.desc"),
          supaFetch("categories?order=sort_order.asc"),
        ]);
        setDbProducts((prods || []).map((p) => ({
          id: p.id,
          name: p.name,
          category: p.categories?.name || "Другое",
          price: Number(p.price),
          oldPrice: p.old_price ? Number(p.old_price) : null,
          badge: p.badge,
          description: p.description || "",
          fullDescription: p.full_description || "",
          image_url: p.image_url,
          specs: p.specs || {},
          rating: Number(p.rating) || 0,
          reviews: p.reviews_count || 0,
        })));
        setDbCategories(["Все", ...(cats || []).map((c) => c.name)]);
      } catch (e) {
        console.error("Error loading data:", e);
      }
      setDataLoaded(true);
    }
    loadData();
  }, []);

  const PRODUCTS = dbProducts;
  const CATEGORIES = dbCategories.length > 1 ? dbCategories : ["Все"];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleFav = (id) => setFavorites((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);

  const addToCart = (product) => {
    dispatch({ type: "ADD", product });
    setAddedAnimation(product.id);
    setTimeout(() => setAddedAnimation(null), 800);
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const filtered = PRODUCTS
    .filter((p) => activeCategory === "Все" || p.category === activeCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "new") return b.id - a.id;
      return b.reviews - a.reviews;
    });

  const editorsPick = PRODUCTS.filter((p) => ["Хит", "Новинка"].includes(p.badge)).slice(0, 6);

  const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth" });

  /* ─── AGE GATE ─── */
  if (!ageVerified) {
    return (
      <div style={{ fontFamily: "'Cormorant Garamond', serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0F", position: "relative", overflow: "hidden" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0A0A0F; }
          .age-blob { position: absolute; width: 500px; height: 500px; border-radius: 50%; filter: blur(120px); opacity: 0.3; animation: blobFloat 8s ease-in-out infinite; }
          @keyframes blobFloat { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.1); } }
          .age-btn { padding: 16px 48px; border: none; border-radius: 60px; font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.4s ease; letter-spacing: 0.5px; }
          .age-btn:hover { transform: translateY(-2px); }
        `}</style>
        <div className="age-blob" style={{ background: "radial-gradient(circle, #C9A96E, transparent)", top: "-10%", left: "-10%" }} />
        <div className="age-blob" style={{ background: "radial-gradient(circle, #D4727A, transparent)", bottom: "-10%", right: "-10%", animationDelay: "4s" }} />
        <div style={{ textAlign: "center", zIndex: 10, padding: "48px", borderRadius: "24px", background: "rgba(255,255,255,0.03)", backdropFilter: "blur(40px)", border: "1px solid rgba(201,169,110,0.15)", maxWidth: 480 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Logo height={52} style={{ alignItems: "center" }} /></div>
          <div style={{ width: 64, height: 64, margin: "0 auto 24px", borderRadius: "50%", border: "2px solid rgba(201,169,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={24} color="#C9A96E" />
          </div>
          <h1 style={{ fontSize: 32, color: "#F5F0EB", fontWeight: 400, marginBottom: 12, lineHeight: 1.3 }}>Подтвердите ваш возраст</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "#8A8A9A", marginBottom: 40, lineHeight: 1.7 }}>Данный сайт содержит материалы, предназначенные исключительно для лиц старше 18 лет.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="age-btn" onClick={() => setAgeVerified(true)} style={{ background: "linear-gradient(135deg, #C9A96E, #B8944F)", color: "#0A0A0F" }}>Да, мне есть 18</button>
            <button className="age-btn" onClick={() => window.location.href = "https://google.com"} style={{ background: "transparent", color: "#8A8A9A", border: "1px solid rgba(138,138,154,0.3)" }}>Нет, покинуть сайт</button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── MAIN RENDER ─── */
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: "#0A0A0F", color: "#F5F0EB", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0F; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #2D2D3A; border-radius: 3px; }
        ::selection { background: rgba(201,169,110,0.3); color: #F5F0EB; }
        .serif { font-family: 'Cormorant Garamond', serif; }
        .card-hover { transition: all 0.45s cubic-bezier(0.23,1,0.32,1); }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(201,169,110,0.08); }
        .gold-glow:hover { box-shadow: 0 0 30px rgba(201,169,110,0.15); }
        .btn-primary { background: linear-gradient(135deg, #C9A96E, #B8944F); color: #0A0A0F; border: none; padding: 14px 32px; border-radius: 60px; font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 14px; cursor: pointer; transition: all 0.3s ease; letter-spacing: 0.5px; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,169,110,0.25); }
        .btn-ghost { background: transparent; color: #F5F0EB; border: 1px solid rgba(245,240,235,0.15); padding: 14px 32px; border-radius: 60px; font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 14px; cursor: pointer; transition: all 0.3s ease; }
        .btn-ghost:hover { border-color: #C9A96E; color: #C9A96E; }
        .noise { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .fade-slide { animation: fadeSlide 0.5s ease forwards; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .heart-pulse { animation: pulse 0.4s ease; }
        @keyframes cartPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .cart-pop { animation: cartPop 0.4s ease; }
        .faq-body { max-height: 0; overflow: hidden; transition: max-height 0.5s cubic-bezier(0.23,1,0.32,1), padding 0.5s ease; padding: 0 24px; }
        .faq-body.open { max-height: 300px; padding: 0 24px 20px; }
        @keyframes heroBlob { 0%,100% { transform: translate(0,0) rotate(0deg) scale(1); } 33% { transform: translate(40px,-30px) rotate(120deg) scale(1.05); } 66% { transform: translate(-20px,20px) rotate(240deg) scale(0.95); } }
        .hero-blob { animation: heroBlob 20s ease-in-out infinite; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .mobile-full { width: 100% !important; max-width: 100% !important; right: 0 !important; }
        }
      `}</style>

      {/* Noise overlay */}
      <div className="noise" />

      {/* ─── HEADER ─── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "12px 24px" : "20px 24px",
        background: scrolled ? "rgba(10,10,15,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(201,169,110,0.08)" : "none",
        transition: "all 0.4s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <button onClick={() => setMobileMenu(!mobileMenu)} style={{ display: "none", background: "none", border: "none", color: "#F5F0EB", cursor: "pointer", padding: 4 }} className="show-mobile" id="burger">
            <Menu size={22} />
          </button>
          <style>{`@media (max-width: 768px) { #burger { display: block !important; } }`}</style>
          <div style={{ cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <Logo height={scrolled ? 36 : 44} />
          </div>
          <nav className="hide-mobile" style={{ display: "flex", gap: 28 }}>
            {["Каталог", "Новинки", "О нас", "Доставка"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => { e.preventDefault(); if (item === "Каталог") scrollToCatalog(); }}
                style={{ color: "#8A8A9A", textDecoration: "none", fontSize: 13, fontWeight: 400, letterSpacing: 0.5, transition: "color 0.3s" }}
                onMouseOver={(e) => e.target.style.color = "#F5F0EB"} onMouseOut={(e) => e.target.style.color = "#8A8A9A"}>
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontSize: 11, padding: "4px 10px", border: "1px solid rgba(201,169,110,0.3)", borderRadius: 20, color: "#C9A96E", fontWeight: 500, letterSpacing: 1 }}>18+</span>
          <button onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }} style={{ background: "none", border: "none", color: "#8A8A9A", cursor: "pointer", transition: "color 0.3s" }} onMouseOver={(e) => e.target.closest("button").style.color = "#F5F0EB"} onMouseOut={(e) => e.target.closest("button").style.color = "#8A8A9A"}>
            <Search size={18} />
          </button>
          <button style={{ background: "none", border: "none", color: "#8A8A9A", cursor: "pointer", position: "relative", transition: "color 0.3s" }} onMouseOver={(e) => e.target.closest("button").style.color = "#F5F0EB"} onMouseOut={(e) => e.target.closest("button").style.color = "#8A8A9A"}>
            <Heart size={18} fill={favorites.length > 0 ? "#D4727A" : "none"} color={favorites.length > 0 ? "#D4727A" : "currentColor"} />
            {favorites.length > 0 && <span style={{ position: "absolute", top: -6, right: -8, background: "#D4727A", color: "#fff", fontSize: 10, fontWeight: 600, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{favorites.length}</span>}
          </button>
          <button onClick={() => setCartOpen(true)} style={{ background: "none", border: "none", color: "#8A8A9A", cursor: "pointer", position: "relative", transition: "color 0.3s" }} onMouseOver={(e) => e.target.closest("button").style.color = "#F5F0EB"} onMouseOut={(e) => e.target.closest("button").style.color = "#8A8A9A"}>
            <ShoppingBag size={18} className={addedAnimation ? "cart-pop" : ""} />
            {cartCount > 0 && <span style={{ position: "absolute", top: -6, right: -8, background: "#C9A96E", color: "#0A0A0F", fontSize: 10, fontWeight: 600, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* ─── MOBILE MENU ─── */}
      {mobileMenu && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(10,10,15,0.97)", zIndex: 2000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
          <button onClick={() => setMobileMenu(false)} style={{ position: "absolute", top: 20, right: 24, background: "none", border: "none", color: "#F5F0EB", cursor: "pointer" }}><X size={24} /></button>
          {["Каталог", "Новинки", "О нас", "Доставка", "Контакты"].map((item, i) => (
            <a key={item} href="#" onClick={(e) => { e.preventDefault(); setMobileMenu(false); if (item === "Каталог") scrollToCatalog(); }}
              style={{ color: "#F5F0EB", textDecoration: "none", fontSize: 28, fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, opacity: 0, animation: `fadeSlide 0.4s ease ${i * 0.1}s forwards` }}>
              {item}
            </a>
          ))}
        </div>
      )}

      {/* ─── SEARCH BAR ─── */}
      {searchOpen && (
        <div style={{ position: "fixed", top: scrolled ? 56 : 72, left: 0, right: 0, zIndex: 999, padding: "16px 24px", background: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#8A8A9A" }} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Поиск товаров..." autoFocus
              style={{ width: "100%", padding: "14px 44px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,169,110,0.15)", borderRadius: 60, color: "#F5F0EB", fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }} />
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#8A8A9A", cursor: "pointer" }}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "120px 24px 80px" }}>
        <div className="hero-blob" style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,0.12), transparent 70%)", top: "10%", right: "-10%", pointerEvents: "none" }} />
        <div className="hero-blob" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,114,122,0.1), transparent 70%)", bottom: "10%", left: "-5%", pointerEvents: "none", animationDelay: "7s" }} />
        <div style={{ textAlign: "center", maxWidth: 800, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: 5, color: "#C9A96E", fontWeight: 500, marginBottom: 28, textTransform: "uppercase" }}>Premium intimate boutique</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h1 className="serif" style={{ fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 300, lineHeight: 1.1, marginBottom: 28, color: "#F5F0EB" }}>
              Искусство<br /><span style={{ fontStyle: "italic", color: "#C9A96E" }}>удовольствия</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p style={{ fontSize: 16, color: "#8A8A9A", maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.8, fontWeight: 300 }}>
              Премиальные товары для вашего комфорта. Дискретная доставка, безупречное качество, полная конфиденциальность.
            </p>
          </FadeIn>
          <FadeIn delay={0.45}>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-primary" onClick={scrollToCatalog} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Перейти в каталог <ArrowRight size={16} />
              </button>
              <button className="btn-ghost">О магазине</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── ADVANTAGES ─── */}
      <section style={{ padding: "60px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { icon: <Package size={22} />, title: "Дискретная упаковка", desc: "Нейтральная упаковка без опознавательных знаков" },
            { icon: <Truck size={22} />, title: "Быстрая доставка", desc: "От 1 дня по Москве, 3-7 дней по России" },
            { icon: <ShieldCheck size={22} />, title: "Сертифицированные товары", desc: "Только проверенные бренды и материалы" },
            { icon: <CreditCard size={22} />, title: "Анонимная оплата", desc: "Нейтральное название в банковской выписке" },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="card-hover gold-glow" style={{ padding: 32, borderRadius: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201,169,110,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#C9A96E" }}>{item.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: "#8A8A9A", lineHeight: 1.6, fontWeight: 300 }}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── EDITOR'S PICK ─── */}
      <section style={{ padding: "40px 0 80px" }}>
        <FadeIn>
          <div style={{ padding: "0 24px", maxWidth: 1200, margin: "0 auto 32px" }}>
            <p style={{ fontSize: 13, letterSpacing: 4, color: "#C9A96E", fontWeight: 500, marginBottom: 8, textTransform: "uppercase" }}>Рекомендуем</p>
            <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400 }}>Выбор редакции</h2>
          </div>
        </FadeIn>
        <div style={{ display: "flex", gap: 20, overflowX: "auto", padding: "0 24px 16px", scrollSnapType: "x mandatory" }}>
          {editorsPick.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.08}>
              <div className="card-hover" onClick={() => setModalProduct(p)} style={{ minWidth: 260, scrollSnapAlign: "start", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(201,169,110,0.15)", cursor: "pointer", background: "rgba(255,255,255,0.02)" }}>
                <div style={{ height: 200, background: p.image_url ? `url(${p.image_url}) center/cover no-repeat` : "linear-gradient(135deg, #2D2D3A, #1A1A2E)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {!p.image_url && <Sparkles size={40} color="rgba(255,255,255,0.15)" />}
                  {p.badge && <span style={{ position: "absolute", top: 12, left: 12, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: p.badge === "Хит" ? "#C9A96E" : p.badge === "Новинка" ? "#6366F1" : "#EF4444", color: "#fff" }}>{p.badge}</span>}
                </div>
                <div style={{ padding: 20 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{p.name}</h4>
                  <p style={{ fontSize: 12, color: "#8A8A9A", marginBottom: 12 }}>{p.category}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 600, color: "#C9A96E" }}>{p.price.toLocaleString()} ₽</span>
                    {p.oldPrice && <span style={{ fontSize: 13, color: "#8A8A9A", textDecoration: "line-through" }}>{p.oldPrice.toLocaleString()} ₽</span>}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── CATALOG ─── */}
      <section ref={catalogRef} id="catalog" style={{ padding: "40px 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 13, letterSpacing: 4, color: "#C9A96E", fontWeight: 500, marginBottom: 8, textTransform: "uppercase" }}>Каталог</p>
            <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, marginBottom: 32 }}>Наши товары</h2>
            {/* Category tabs */}
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  style={{ padding: "10px 22px", borderRadius: 60, border: activeCategory === cat ? "1px solid #C9A96E" : "1px solid rgba(255,255,255,0.08)", background: activeCategory === cat ? "rgba(201,169,110,0.1)" : "transparent", color: activeCategory === cat ? "#C9A96E" : "#8A8A9A", fontSize: 13, fontFamily: "'Outfit',sans-serif", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.3s", fontWeight: 400 }}>
                  {cat}
                </button>
              ))}
            </div>
            {/* Sort */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 13, color: "#8A8A9A" }}>Сортировка:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#F5F0EB", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontFamily: "'Outfit',sans-serif", cursor: "pointer", outline: "none" }}>
                <option value="popular" style={{ background: "#1A1A2E" }}>По популярности</option>
                <option value="price_asc" style={{ background: "#1A1A2E" }}>Цена ↑</option>
                <option value="price_desc" style={{ background: "#1A1A2E" }}>Цена ↓</option>
                <option value="new" style={{ background: "#1A1A2E" }}>Новинки</option>
              </select>
            </div>
          </div>
        </FadeIn>

        {/* Product grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {filtered.map((p, i) => (
            <FadeIn key={p.id} delay={(i % 4) * 0.08}>
              <div className="card-hover gold-glow" style={{ borderRadius: 20, overflow: "hidden", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div onClick={() => setModalProduct(p)} style={{ height: 220, background: p.image_url ? `url(${p.image_url}) center/cover no-repeat` : "linear-gradient(135deg, #1A1A2E, #2D2D3A)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                  {!p.image_url && <Sparkles size={36} color="rgba(255,255,255,0.1)" />}
                  {p.badge && <span style={{ position: "absolute", top: 12, left: 12, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: p.badge === "Хит" ? "#C9A96E" : p.badge === "Новинка" ? "#6366F1" : "#EF4444", color: "#fff" }}>{p.badge}</span>}
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }}
                    className={favorites.includes(p.id) ? "heart-pulse" : ""}
                    style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.3)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(8px)" }}>
                    <Heart size={16} fill={favorites.includes(p.id) ? "#D4727A" : "none"} color={favorites.includes(p.id) ? "#D4727A" : "#fff"} />
                  </button>
                </div>
                <div style={{ padding: 20 }}>
                  <p style={{ fontSize: 11, color: "#C9A96E", letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>{p.category}</p>
                  <h4 onClick={() => setModalProduct(p)} style={{ fontSize: 16, fontWeight: 500, marginBottom: 6, cursor: "pointer" }}>{p.name}</h4>
                  <p style={{ fontSize: 12, color: "#8A8A9A", marginBottom: 16, lineHeight: 1.5, fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#C9A96E" }}>{p.price.toLocaleString()} ₽</span>
                      {p.oldPrice && <span style={{ fontSize: 12, color: "#8A8A9A", textDecoration: "line-through", marginLeft: 8 }}>{p.oldPrice.toLocaleString()} ₽</span>}
                    </div>
                    <button onClick={() => addToCart(p)} className="btn-primary" style={{ padding: "10px 20px", fontSize: 12 }}>В корзину</button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 12 }}>
                    <Star size={12} fill="#C9A96E" color="#C9A96E" />
                    <span style={{ fontSize: 12, color: "#8A8A9A" }}>{p.rating} · {p.reviews} отзывов</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        {!dataLoaded && (
          <div style={{ textAlign: "center", padding: 80, color: "#8A8A9A" }}>
            <p style={{ fontSize: 15 }}>Загрузка товаров...</p>
          </div>
        )}
        {dataLoaded && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, color: "#8A8A9A" }}>
            <Search size={40} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p>{PRODUCTS.length === 0 ? "Скоро здесь появятся товары" : "Ничего не найдено"}</p>
          </div>
        )}
      </section>

      {/* ─── ABOUT ─── */}
      <section style={{ padding: "80px 24px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ fontSize: 13, letterSpacing: 4, color: "#C9A96E", fontWeight: 500, marginBottom: 8, textTransform: "uppercase" }}>О нас</p>
            <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, marginBottom: 24 }}>Дискретно. Надёжно. Для вас.</h2>
            <p style={{ fontSize: 15, color: "#8A8A9A", lineHeight: 1.9, maxWidth: 640, margin: "0 auto 48px", fontWeight: 300 }}>
              Балдёж — это пространство, где качество, эстетика и уважение к вашей приватности стоят на первом месте. Мы тщательно отбираем каждый товар, работаем только с сертифицированными производителями и гарантируем полную конфиденциальность.
            </p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>
            {[
              { num: "10 000+", label: "Довольных клиентов" },
              { num: "500+", label: "Товаров в каталоге" },
              { num: "5 лет", label: "На рынке" },
              { num: "24/7", label: "Поддержка" },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div>
                  <div className="serif" style={{ fontSize: 36, fontWeight: 600, color: "#C9A96E", marginBottom: 4 }}>{s.num}</div>
                  <div style={{ fontSize: 13, color: "#8A8A9A", fontWeight: 300 }}>{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ padding: "80px 24px", maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <p style={{ fontSize: 13, letterSpacing: 4, color: "#C9A96E", fontWeight: 500, marginBottom: 8, textTransform: "uppercase" }}>Частые вопросы</p>
          <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, marginBottom: 40 }}>FAQ</h2>
        </FadeIn>
        {FAQ_DATA.map((item, i) => (
          <FAQItem key={i} item={item} delay={i * 0.05} />
        ))}
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: "60px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 48 }}>
          <div>
            <Logo height={40} />
            <p style={{ fontSize: 13, color: "#8A8A9A", marginTop: 12, lineHeight: 1.7, fontWeight: 300 }}>Премиальный интернет-магазин товаров для взрослых. Качество, эстетика, конфиденциальность.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Каталог</h4>
            {CATEGORIES.filter((c) => c !== "Все").map((c) => (
              <p key={c} style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 10, cursor: "pointer", fontWeight: 300 }}>{c}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Помощь</h4>
            {["Доставка и оплата", "Возврат", "Политика конфиденциальности", "Контакты"].map((link) => (
              <p key={link} style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 10, cursor: "pointer", fontWeight: 300 }}>{link}</p>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Контакты</h4>
            <p style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 10, fontWeight: 300 }}>info@baldezh.ru</p>
            <p style={{ fontSize: 13, color: "#8A8A9A", marginBottom: 20, fontWeight: 300 }}>8 (800) 555-02-20</p>
            <div style={{ display: "flex", gap: 12 }}>
              {[Instagram, Send, MessageCircle].map((Icon, i) => (
                <div key={i} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8A8A9A", transition: "all 0.3s" }}>
                  <Icon size={16} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "#8A8A9A", fontWeight: 300 }}> 2026 Балдёж. Все права защищены.</p>
          <p style={{ fontSize: 12, color: "#8A8A9A", fontWeight: 300 }}>Сайт предназначен для лиц старше 18 лет (18+)</p>
        </div>
      </footer>

      {/* ─── PRODUCT MODAL ─── */}
      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} addToCart={addToCart} toggleFav={toggleFav} isFav={favorites.includes(modalProduct.id)} />}

      {/* ─── CART DRAWER ─── */}
      {cartOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000 }}>
          <div onClick={() => setCartOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div className="mobile-full fade-slide" style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "100%", background: "#111118", borderLeft: "1px solid rgba(201,169,110,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 18, fontWeight: 500 }}>Корзина ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#8A8A9A", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#8A8A9A" }}>
                  <ShoppingBag size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
                  <p>Корзина пуста</p>
                </div>
              ) : cart.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 12, background: item.image_url ? `url(${item.image_url}) center/cover no-repeat` : "linear-gradient(135deg, #1A1A2E, #2D2D3A)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{item.name}</h4>
                    <p style={{ fontSize: 12, color: "#8A8A9A", marginBottom: 8 }}>{item.price.toLocaleString()} ₽</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button onClick={() => dispatch({ type: "DEC", id: item.id })} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0EB", cursor: "pointer" }}><Minus size={12} /></button>
                      <span style={{ fontSize: 14, fontWeight: 500, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => dispatch({ type: "INC", id: item.id })} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0EB", cursor: "pointer" }}><Plus size={12} /></button>
                      <button onClick={() => dispatch({ type: "REMOVE", id: item.id })} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", marginLeft: "auto" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: 24, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontSize: 15, color: "#8A8A9A" }}>Итого:</span>
                  <span style={{ fontSize: 22, fontWeight: 600, color: "#C9A96E" }}>{cartTotal.toLocaleString()} ₽</span>
                </div>
                <button className="btn-primary" style={{ width: "100%", textAlign: "center", padding: 16 }}>Оформить заказ</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── FAQ Accordion Item ─── */
function FAQItem({ item, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
        <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "none", border: "none", color: "#F5F0EB", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 400, textAlign: "left" }}>
          {item.q}
          <span style={{ color: "#C9A96E", transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0)" }}><ChevronDown size={18} /></span>
        </button>
        <div className={`faq-body ${open ? "open" : ""}`}>
          <p style={{ fontSize: 14, color: "#8A8A9A", lineHeight: 1.8, fontWeight: 300 }}>{item.a}</p>
        </div>
      </div>
    </FadeIn>
  );
}

/* ─── Product Modal ─── */
function ProductModal({ product, onClose, addToCart, toggleFav, isFav }) {
  const [qty, setQty] = useState(1);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }} />
      <div className="fade-slide" style={{ position: "relative", background: "#131320", borderRadius: 24, maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto", border: "1px solid rgba(201,169,110,0.1)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0EB", cursor: "pointer", zIndex: 10, backdropFilter: "blur(8px)" }}><X size={18} /></button>
        <div style={{ height: 280, background: product.image_url ? `url(${product.image_url}) center/cover no-repeat` : "linear-gradient(135deg, #1A1A2E, #2D2D3A)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "24px 24px 0 0", position: "relative" }}>
          {!product.image_url && <Sparkles size={48} color="rgba(255,255,255,0.1)" />}
          {product.badge && <span style={{ position: "absolute", top: 16, left: 16, padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: product.badge === "Хит" ? "#C9A96E" : product.badge === "Новинка" ? "#6366F1" : "#EF4444", color: "#fff" }}>{product.badge}</span>}
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <p style={{ fontSize: 12, color: "#C9A96E", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>{product.category}</p>
              <h2 style={{ fontSize: 26, fontWeight: 500, fontFamily: "'Cormorant Garamond', serif" }}>{product.name}</h2>
            </div>
            <button onClick={() => toggleFav(product.id)} style={{ background: "rgba(255,255,255,0.05)", border: "none", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <Heart size={20} fill={isFav ? "#D4727A" : "none"} color={isFav ? "#D4727A" : "#8A8A9A"} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(product.rating) ? "#C9A96E" : "none"} color="#C9A96E" />)}
            <span style={{ fontSize: 13, color: "#8A8A9A", marginLeft: 4 }}>{product.rating} · {product.reviews} отзывов</span>
          </div>
          <p style={{ fontSize: 14, color: "#8A8A9A", lineHeight: 1.8, marginBottom: 24, fontWeight: 300 }}>{product.fullDescription || product.description}</p>
          {/* Specs */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Характеристики</h4>
            {Object.entries(product.specs).map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
                <span style={{ color: "#8A8A9A", textTransform: "capitalize" }}>{key === "material" ? "Материал" : key === "size" ? "Размер" : "Цвет"}</span>
                <span style={{ fontWeight: 400 }}>{val}</span>
              </div>
            ))}
          </div>
          {/* Price & Add */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div>
              <span style={{ fontSize: 28, fontWeight: 600, color: "#C9A96E", fontFamily: "'Cormorant Garamond', serif" }}>{product.price.toLocaleString()} ₽</span>
              {product.oldPrice && <span style={{ fontSize: 16, color: "#8A8A9A", textDecoration: "line-through", marginLeft: 12 }}>{product.oldPrice.toLocaleString()} ₽</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ background: "none", border: "none", color: "#F5F0EB", padding: "10px 14px", cursor: "pointer" }}><Minus size={14} /></button>
                <span style={{ padding: "0 8px", fontSize: 15, fontWeight: 500, minWidth: 28, textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ background: "none", border: "none", color: "#F5F0EB", padding: "10px 14px", cursor: "pointer" }}><Plus size={14} /></button>
              </div>
              <button onClick={() => { for (let i = 0; i < qty; i++) addToCart(product); onClose(); }} className="btn-primary" style={{ padding: "14px 28px" }}>В корзину</button>
            </div>
          </div>
          {/* Reviews */}
          <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24 }}>
            <h4 style={{ fontSize: 13, fontWeight: 500, marginBottom: 16, letterSpacing: 1, textTransform: "uppercase" }}>Отзывы</h4>
            {SAMPLE_REVIEWS.map((r, i) => (
              <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < SAMPLE_REVIEWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.author}</span>
                  <span style={{ fontSize: 11, color: "#8A8A9A" }}>{r.date}</span>
                </div>
                <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={11} fill={j < r.rating ? "#C9A96E" : "none"} color="#C9A96E" />)}
                </div>
                <p style={{ fontSize: 13, color: "#8A8A9A", lineHeight: 1.6, fontWeight: 300 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
