import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User 
} from 'firebase/auth';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogOut, 
  Building2, 
  Briefcase, 
  Users, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  ExternalLink,
  Car,
  Home,
  Truck,
  DollarSign,
  ChevronRight,
  Sparkles,
  Search,
  MapPin,
  X,
  Star,
  ChevronLeft,
  ChevronDown,
  Layers,
  ArrowRight,
  MessageCircle,
  Tag
} from 'lucide-react';

/**
 * CONFIGURACIÓN OFICIAL SEGURA DE CLIENTE - FIREBASE
 * Proyecto: alianza-estrategica-coca
 * Cero credenciales expuestas: autenticación validada estrictamente por Firebase Auth.
 */
export const firebaseConfig = {
  apiKey: "AIzaSyCLQFG1X62E5_WJ6hyCDjoDVkWbja02N3A",
  authDomain: "alianza-estrategica-coca.firebaseapp.com",
  projectId: "alianza-estrategica-coca",
  storageBucket: "alianza-estrategica-coca.firebasestorage.app",
  messagingSenderId: "1029575911279",
  appId: "1:1029575911279:web:1ceb020bb865711ced6a9a",
  measurementId: "G-TGB0C5WEKW"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Instancia aislada para registrar agentes sin desconectar la sesión de Gerencia
const getSecondaryAuthInstance = () => {
  const secondaryAppName = 'SecondaryAgentCreationApp';
  const existingApp = getApps().find(a => a.name === secondaryAppName);
  const secondaryApp = existingApp || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
};

// Correo exclusivo autorizado con rol de Administrador Principal (Gerencia General - Control Total)
const GERENCIA_WHITELIST = [
  'gerencia@alianzaestrategica2026.com'
];

export const isGerenciaUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return GERENCIA_WHITELIST.includes(cleanEmail);
};

const parseFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenciales incorrectas. Verifique el correo y la contraseña registrados en el sistema.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico ingresado no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada por la administración.';
    case 'auth/too-many-requests':
      return 'Acceso temporalmente bloqueado por demasiados intentos fallidos. Intente más tarde.';
    case 'auth/email-already-in-use':
      return 'Este correo ya se encuentra registrado en Firebase Auth.';
    case 'auth/weak-password':
      return 'La contraseña debe contener al menos 6 caracteres.';
    default:
      return 'Ocurrió un error al procesar la solicitud de autenticación.';
  }
};

// Interfaz para los productos del Marketplace
export interface ProductItem {
  id: string;
  code: string;
  category: 'RE' | 'AR' | 'VH' | 'MQ' | 'LQ';
  categoryLabel: string;
  title: string;
  priceUSD: number;
  priceLabel: string;
  location: string;
  sector: string;
  province: string;
  description: string;
  status: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
  isFeatured: boolean;
  imageUrl: string;
  details: {
    metros2?: string;
    habitaciones?: string;
    banos?: string;
    ano?: string;
    kilometraje?: string;
    horasUso?: string;
  };
}

// Catálogo verificado de Alianza Estratégica S.A.S.
const INITIAL_INVENTORY: ProductItem[] = [
  {
    id: 'prod_1',
    code: 'RE-001',
    category: 'RE',
    categoryLabel: 'Bienes Raíces Venta',
    title: '🏡 Casa y Terreno Residencial en El Coca',
    priceUSD: 45000,
    priceLabel: '$45,000 USD',
    location: 'El Coca, Orellana',
    sector: 'Sector 6 de Diciembre',
    province: 'Orellana',
    description: 'Propiedad con cerramiento perimetral, escrituras legalizadas al día y servicios básicos instalados. Ideal para residencia familiar o proyecto comercial con alta plusvalía.',
    status: 'DISPONIBLE',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    details: { metros2: '280 m²', habitaciones: '3', banos: '2' }
  },
  {
    id: 'prod_2',
    code: 'VH-001',
    category: 'VH',
    categoryLabel: 'Vehículos',
    title: '🚗 Camioneta Toyota Hilux 4x4 Diésel',
    priceUSD: 28500,
    priceLabel: '$28,500 USD',
    location: 'El Coca, Orellana',
    sector: 'Barrio Central',
    province: 'Orellana',
    description: 'Camioneta en óptimas condiciones mecánicas, tracción 4x4 operativa, mantenimiento preventivo al día, cero gravámenes en la ANT y lista para transferencia notarial.',
    status: 'DISPONIBLE',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    details: { ano: '2019', kilometraje: '85,000 km' }
  },
  {
    id: 'prod_3',
    code: 'MQ-001',
    category: 'MQ',
    categoryLabel: 'Maquinaria Pesada',
    title: '🚜 Retroexcavadora Caterpillar 420F',
    priceUSD: 62000,
    priceLabel: '$62,000 USD',
    location: 'Puerto Francisco de Orellana',
    sector: 'Vía Auca Km 4',
    province: 'Orellana',
    description: 'Equipo de construcción en excelentes condiciones operativas, sistema hidráulico verificado, cabina climatizada y documentación de importación completa con factura notariada.',
    status: 'DISPONIBLE',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    details: { horasUso: '4,200 hrs', ano: '2017' }
  },
  {
    id: 'prod_4',
    code: 'AR-001',
    category: 'AR',
    categoryLabel: 'Arriendos',
    title: '🏢 Local Comercial Céntrico en El Coca',
    priceUSD: 650,
    priceLabel: '$650 USD / mes',
    location: 'El Coca, Orellana',
    sector: 'Av. 9 de Octubre',
    province: 'Orellana',
    description: 'Local comercial con amplio frente sobre vía principal, baño privado, cortina metálica y medidores independientes. Alto flujo peatonal y vehicular.',
    status: 'DISPONIBLE',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    details: { metros2: '75 m²', banos: '1' }
  },
  {
    id: 'prod_5',
    code: 'RE-002',
    category: 'RE',
    categoryLabel: 'Bienes Raíces Venta',
    title: '🌱 Finca Agrícola de 15 Hectáreas en Orellana',
    priceUSD: 38000,
    priceLabel: '$38,000 USD',
    location: 'Sacha / Joya de los Sachas',
    sector: 'Vía a San Carlos',
    province: 'Orellana',
    description: 'Terreno plano fértil con vertiente natural de agua, apto para cultivo de cacao, plátano o ganadería. Títulos de propiedad inscritos en el Registro de la Propiedad.',
    status: 'DISPONIBLE',
    isFeatured: true,
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    details: { metros2: '150,000 m²' }
  },
  {
    id: 'prod_6',
    code: 'LQ-001',
    category: 'LQ',
    categoryLabel: 'Oportunidad / Segunda Mano',
    title: '⚙️ Generador Eléctrico Diésel 25 KVA Insonorizado',
    priceUSD: 4800,
    priceLabel: '$4,800 USD',
    location: 'El Coca, Orellana',
    sector: 'Parque Industrial',
    province: 'Orellana',
    description: 'Generador trifásico industrial para campamento petrolero o finca comercial. Tanque integrado, encendido automático y mantenimiento al día.',
    status: 'VENDIDO',
    isFeatured: false,
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    details: { horasUso: '1,100 hrs', ano: '2021' }
  }
];

export default function App() {
  // Estado de usuario y autenticación
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Modal de inicio de sesión seguro
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Modal de Ficha Técnica Detallada
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Modal para Vender / Consignar Activo
  const [showConsignarModal, setShowConsignarModal] = useState<boolean>(false);
  const [consignarNombre, setConsignarNombre] = useState('');
  const [consignarTelefono, setConsignarTelefono] = useState('');
  const [consignarTipo, setConsignarTipo] = useState('Inmueble (Casa/Terreno)');
  const [consignarDetalles, setConsignarDetalles] = useState('');

  // Filtros del Marketplace
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  // Carrusel de activos destacados
  const featuredItems = useMemo(() => INITIAL_INVENTORY.filter(item => item.isFeatured), []);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Pestañas activas para el Panel de Gerencia
  const [adminTab, setAdminTab] = useState<'agentes' | 'calculadora' | 'catalogo' | 'senadi'>('agentes');

  // Registro de agentes (Solo Gerencia)
  const [nuevoAgenteNombre, setNuevoAgenteNombre] = useState('');
  const [nuevoAgenteEmail, setNuevoAgenteEmail] = useState('');
  const [nuevoAgentePassword, setNuevoAgentePassword] = useState('');
  const [nuevoAgenteTelefono, setNuevoAgenteTelefono] = useState('');
  const [creandoAgente, setCreandoAgente] = useState(false);
  const [mensajeAgente, setMensajeAgente] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Calculadora 40/60
  const [calcPrecio, setCalcPrecio] = useState<number>(45000);
  const [calcPorcentaje, setCalcPorcentaje] = useState<number>(4);

  // Rotación suave del carrusel cada 5 segundos
  useEffect(() => {
    if (featuredItems.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredItems.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Escucha de sesión Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
      if (user) {
        setShowLoginModal(false);
        setLoginError('');
      }
    });
    return () => unsubscribe();
  }, []);

  // Manejo de login seguro
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginEmail('');
      setLoginPassword('');
      setShowLoginModal(false);
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      setLoginError(parseFirebaseError(err?.code || ''));
    } finally {
      setLoginLoading(false);
    }
  };

  // Cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAdminTab('agentes');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // Crear agente seguro
  const handleCrearAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeAgente(null);

    if (!nuevoAgenteEmail || !nuevoAgentePassword) {
      setMensajeAgente({ tipo: 'error', texto: 'Complete todos los campos requeridos.' });
      return;
    }

    if (nuevoAgentePassword.length < 6) {
      setMensajeAgente({ tipo: 'error', texto: 'La clave temporal debe tener mínimo 6 caracteres.' });
      return;
    }

    setCreandoAgente(true);
    try {
      const secondaryAuth = getSecondaryAuthInstance();
      await createUserWithEmailAndPassword(secondaryAuth, nuevoAgenteEmail.trim(), nuevoAgentePassword);
      await signOut(secondaryAuth);

      setMensajeAgente({ 
        tipo: 'ok', 
        texto: `¡Agente ${nuevoAgenteNombre || nuevoAgenteEmail} creado en Firebase Auth! Ya puede acceder con estas credenciales.` 
      });

      setNuevoAgenteNombre('');
      setNuevoAgenteEmail('');
      setNuevoAgentePassword('');
      setNuevoAgenteTelefono('');
    } catch (err: any) {
      console.error('Error al crear agente:', err);
      setMensajeAgente({ tipo: 'error', texto: parseFirebaseError(err?.code || '') });
    } finally {
      setCreandoAgente(false);
    }
  };

  // Envío de consignación vía WhatsApp
  const handleEnviarConsignacion = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = `Hola Alianza Estratégica S.A.S. 👋%0A%0ADeseo consignar mi activo para venta con asesoría notarial:%0A• Nombre: ${consignarNombre}%0A• Contacto: ${consignarTelefono}%0A• Tipo de Activo: ${consignarTipo}%0A• Detalles: ${consignarDetalles}`;
    window.open(`https://wa.me/593959190794?text=${texto}`, '_blank');
    setShowConsignarModal(false);
    setConsignarNombre('');
    setConsignarTelefono('');
    setConsignarDetalles('');
  };

  // Filtrado de productos en tiempo real
  const filteredProducts = useMemo(() => {
    return INITIAL_INVENTORY.filter(item => {
      // Búsqueda por texto
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de categoría
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory || (selectedCategory === 'SOLD' && item.status === 'VENDIDO');

      // Filtro de provincia
      const matchesProv = selectedProvince === 'ALL' || item.province.toLowerCase() === selectedProvince.toLowerCase();

      return matchesSearch && matchesCat && matchesProv;
    });
  }, [searchQuery, selectedCategory, selectedProvince]);

  const comisionTotal = (calcPrecio * calcPorcentaje) / 100;
  const comisionEmpresa = comisionTotal * 0.40;
  const comisionAgente = comisionTotal * 0.60;

  const isAdmin = currentUser ? isGerenciaUser(currentUser.email) : false;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* 1. TOPBAR INSTITUCIONAL */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-sky-500 to-blue-600 p-0.5 shadow-lg shadow-sky-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white flex items-center gap-1">
                  ALIANZA ESTRATÉGICA S.A.S.
                  <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-500/30 px-2 py-0.2 rounded-full font-bold hidden sm:inline-block">Verificado</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                <span>El Coca, Orellana — Ecuador • R.U.C. 2200260962001</span>
              </p>
            </div>
          </div>

          {/* Botones de Acción de Cabecera */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConsignarModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Tag className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Vender Activo</span>
              <span className="sm:hidden">Consignar</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1.5 ${
                  isAdmin 
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                    : 'bg-sky-950 text-sky-300 border border-sky-500/40'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="hidden md:inline">{currentUser.email}</span>
                  <span className="md:hidden">{isAdmin ? 'Gerente' : 'Agente'}</span>
                </span>
                <button
                  onClick={handleLogout}
                  title="Cerrar Sesión"
                  className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/30 p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Acceso Seguro</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. SI HAY UN USUARIO AUTENTICADO: SECCIÓN DASHBOARD SUPERIOR */}
      {currentUser && (
        <section className="bg-slate-950 border-b border-slate-800 px-4 py-4">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white">
                    {isAdmin ? 'Panel Maestro de Gerencia (A.A.I.L.)' : 'Panel de Agente Comercial Autorizado'}
                  </h2>
                  <p className="text-xs text-slate-300">
                    Sesión activa protegida por Firebase Authentication.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://chat.whatsapp.com/LWnH4P4Q4LuLDnRSLNXRYn?s=cl&p=a&iam=2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Grupo WhatsApp Agentes</span>
                </a>
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setAdminTab('agentes')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    adminTab === 'agentes' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Agente (Firebase)</span>
                </button>
                <button
                  onClick={() => setAdminTab('calculadora')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    adminTab === 'calculadora' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Matriz Financiera 40/60</span>
                </button>
                <button
                  onClick={() => setAdminTab('senadi')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    adminTab === 'senadi' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Trámites SENADI</span>
                </button>
              </div>
            )}

            {/* Submódulo: Crear Agentes */}
            {isAdmin && adminTab === 'agentes' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  Registrar Cuenta Oficial para Agente Colaborador
                </h3>
                {mensajeAgente && (
                  <div className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    mensajeAgente.tipo === 'ok' ? 'bg-emerald-950 text-emerald-200 border border-emerald-500/40' : 'bg-rose-950 text-rose-200 border border-rose-500/40'
                  }`}>
                    {mensajeAgente.tipo === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{mensajeAgente.texto}</span>
                  </div>
                )}
                <form onSubmit={handleCrearAgente} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={nuevoAgenteNombre}
                    onChange={(e) => setNuevoAgenteNombre(e.target.value)}
                    placeholder="Nombre del Agente"
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="email"
                    value={nuevoAgenteEmail}
                    onChange={(e) => setNuevoAgenteEmail(e.target.value)}
                    placeholder="correo.agente@ejemplo.com"
                    required
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={nuevoAgentePassword}
                    onChange={(e) => setNuevoAgentePassword(e.target.value)}
                    placeholder="Clave provisional (mín 6 car)"
                    required
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <button
                    type="submit"
                    disabled={creandoAgente}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {creandoAgente ? 'Creando...' : '+ Crear en Firebase'}
                  </button>
                </form>
              </div>
            )}

            {/* Submódulo: Calculadora 40/60 */}
            {isAdmin && adminTab === 'calculadora' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400">Precio Activo (USD):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calcPrecio}
                      onChange={(e) => setCalcPrecio(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold w-32"
                    />
                    <span className="text-xs text-slate-400">Comisión %:</span>
                    <input
                      type="number"
                      value={calcPorcentaje}
                      onChange={(e) => setCalcPorcentaje(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold w-16"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Comisión Total:</span>
                    <span className="text-sm font-black text-amber-400">${comisionTotal.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-sky-300 block">40% Empresa:</span>
                    <span className="text-sm font-black text-sky-400">${comisionEmpresa.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-emerald-300 block">60% Agente (30% Cap + 30% Ven):</span>
                    <span className="text-sm font-black text-emerald-400">${comisionAgente.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submódulo: SENADI */}
            {isAdmin && adminTab === 'senadi' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-1">
                <p className="text-amber-400 font-bold">Trámites Oficiales de Propiedad Intelectual SENADI:</p>
                <p className="text-slate-300">• <strong>Signos Distintivos (Marca Mixta):</strong> Formulario 314215 (Clase 35 Niza - Intermediación y Marketplace). Solicitante: Adrián Arturo Íñiguez Lucio. Patrocinio: Abg. Carlos Alfredo Íñiguez Rodríguez.</p>
                <p className="text-slate-300">• <strong>Derecho de Autor:</strong> Registro de Soporte Lógico / Plataforma Web y Comercio Electrónico.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. HERO / PORTADA CORPORATIVA PÚBLICA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#080c14] to-[#080c14] border-b border-slate-800/60 px-4 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-extrabold text-amber-300 shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Marketplace Oficial de Bienes, Vehículos y Maquinaria Pesada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Comercialización Formal con <span className="bg-gradient-to-r from-sky-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">Blindaje Notarial</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Compra, vende y consigna Inmuebles, Automotores y Maquinaria Pesada en El Coca, Orellana y toda la Amazonía Ecuatoriana con saneamiento jurídico garantizado.
          </p>

          {/* Calificación y Métricas */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <Star className="w-4 h-4 fill-amber-400" />
              <span className="text-white font-bold ml-1">5.0 (Respaldo Legal)</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cero Riesgo de Fraudes
            </span>
            <span>•</span>
            <span className="text-sky-300 font-semibold">
              Patrocinio Abg. Carlos Alfredo Íñiguez Rodríguez
            </span>
          </div>
        </div>
      </section>

      {/* 4. CARRUSEL DE ACTIVOS VIP / DESTACADOS */}
      {featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto w-full px-4 pt-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                OPORTUNIDADES VIP DESTACADAS
              </span>
              <span className="text-[11px] text-sky-400 font-semibold bg-sky-950/80 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                {carouselIndex + 1} de {featuredItems.length}
              </span>
            </div>

            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
              <img
                src={featuredItems[carouselIndex].imageUrl}
                alt={featuredItems[carouselIndex].title}
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 sm:p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md shadow">
                    {featuredItems[carouselIndex].code}
                  </span>
                  <span className="text-xs font-bold bg-sky-950/90 text-sky-300 border border-sky-400/40 px-2.5 py-0.5 rounded-md">
                    {featuredItems[carouselIndex].categoryLabel}
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                  {featuredItems[carouselIndex].title}
                </h3>
                <p className="text-sm sm:text-base font-black text-amber-400 mt-1">
                  {featuredItems[carouselIndex].priceLabel} — <span className="text-slate-300 font-medium text-xs sm:text-sm">{featuredItems[carouselIndex].location}</span>
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedProduct(featuredItems[carouselIndex])}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Ver Ficha Técnica</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://wa.me/593959190794?text=Hola%20Alianza%20Estrat%C3%A9gica,%20deseo%20informaci%C3%B3n%20sobre%20el%20activo%20${featuredItems[carouselIndex].code}%20-%20${encodeURIComponent(featuredItems[carouselIndex].title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Consultar por WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Botones de navegación del carrusel */}
              <button
                onClick={() => setCarouselIndex((prev) => (prev - 1 + featuredItems.length) % featuredItems.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCarouselIndex((prev) => (prev + 1) % featuredItems.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition cursor-pointer"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. BUSCADOR & FILTROS DEL MARKETPLACE */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-8 shadow-xl">
          <div className="max-w-2xl mx-auto text-center mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-white">Catálogo de Activos y Oportunidades</h2>
            <p className="text-xs text-slate-400 mt-1">Explora propiedades, vehículos y maquinaria listos para escriturar e inspeccionar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto mb-4">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Buscar por código (ej: RE-001), título, sector o ciudad..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
            <div>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 transition cursor-pointer"
              >
                <option value="ALL">🗺️ Ubicación: Todas</option>
                <option value="Orellana">Orellana (El Coca / Sachas)</option>
                <option value="Sucumbíos">Sucumbíos (Lago Agrio)</option>
                <option value="Napo">Napo (Tena)</option>
                <option value="Pichincha">Pichincha (Quito)</option>
              </select>
            </div>
          </div>

          {/* Botones de Categorías */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'RE', label: 'Bienes Raíces (RE)' },
              { id: 'AR', label: 'Arriendos (AR)' },
              { id: 'VH', label: 'Vehículos (VH)' },
              { id: 'MQ', label: 'Maquinaria (MQ)' },
              { id: 'LQ', label: 'Segunda Mano (LQ)' },
              { id: 'SOLD', label: 'Vendidos 💸' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6. REJILLA DE TARJETAS DE PRODUCTOS */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No se encontraron activos con esos criterios</h3>
            <p className="text-xs text-slate-500 mt-1">Prueba con otra palabra o selecciona "Todos".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedProvince('ALL'); }}
              className="mt-4 bg-slate-800 text-amber-400 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md shadow">
                        {item.code}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md shadow ${
                        item.status === 'VENDIDO' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      {item.categoryLabel}
                    </span>
                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{item.location} • {item.sector}</span>
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Especificaciones Técnicas */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300 pt-1">
                      {item.details.metros2 && (
                        <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">📐 {item.details.metros2}</span>
                      )}
                      {item.details.habitaciones && (
                        <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">🛏️ {item.details.habitaciones} Hab</span>
                      )}
                      {item.details.ano && (
                        <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">📅 Año {item.details.ano}</span>
                      )}
                      {item.details.kilometraje && (
                        <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">🛣️ {item.details.kilometraje}</span>
                      )}
                      {item.details.horasUso && (
                        <span className="bg-slate-950 px-2 py-1 rounded-md border border-slate-800">⏱️ {item.details.horasUso}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Valor Negociable:</span>
                    <span className="text-lg font-black text-amber-400">{item.priceLabel}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Ficha
                    </button>
                    <a
                      href={`https://wa.me/593959190794?text=Hola%20Alianza%20Estrat%C3%A9gica,%20deseo%20m%C3%A1s%20detalles%20del%20activo%20${item.code}%20-%20${encodeURIComponent(item.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 7. MODAL DE ACCESO SEGURO (FIREBASE AUTH) */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => { setShowLoginModal(false); setLoginError(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-950 border border-sky-500/30 mb-2 shadow-lg">
                <Lock className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-xl font-black text-white">Acceso al Sistema Seguro</h3>
              <p className="text-xs text-slate-400 mt-1">Exclusivo para Gerencia y Agentes Autorizados</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Correo Autorizado</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Contraseña Registrada</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Verificando con Firebase...' : 'Ingresar al Sistema Seguro'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center space-y-1">
              <p>Seguridad Cifrada SSL / TLS 256-bit • Firebase Authentication</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL DE FICHA TÉCNICA DETALLADA */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md">
                  {selectedProduct.code}
                </span>
                <span className="text-xs font-bold text-sky-400 bg-sky-950 border border-sky-500/30 px-2.5 py-1 rounded-md">
                  {selectedProduct.categoryLabel}
                </span>
              </div>

              <h2 className="text-xl font-black text-white">{selectedProduct.title}</h2>
              <p className="text-2xl font-black text-amber-400">{selectedProduct.priceLabel}</p>

              <div className="rounded-2xl overflow-hidden h-64 bg-slate-950 border border-slate-800">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Descripción Notarial del Activo:</h4>
                <p className="text-slate-400 leading-relaxed">{selectedProduct.description}</p>
                <p className="text-slate-400"><strong>Ubicación:</strong> {selectedProduct.location} ({selectedProduct.sector})</p>
                <div className="pt-2 text-emerald-400 flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Saneamiento notarial y títulos revisados por el estudio jurídico patrocinador.</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cerrar
                </button>
                <a
                  href={`https://wa.me/593959190794?text=Estimada%20Gerencia%20de%20Alianza%20Estrat%C3%A9gica,%20solicito%20inspecci%C3%B3n%20para%20el%20activo%20${selectedProduct.code}%20-%20${encodeURIComponent(selectedProduct.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow-lg"
                >
                  <Phone className="w-4 h-4" />
                  <span>Coordinar Visita por WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL PARA CONSIGNAR ACTIVO (VENDER / ARRENDAR) */}
      {showConsignarModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowConsignarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-950/60 px-2 py-0.5 rounded">
                Consignación Formal
              </span>
              <h3 className="text-lg font-black text-white mt-1">Consignar Activo con Alianza Estratégica</h3>
              <p className="text-xs text-slate-400 mt-0.5">Vende tu casa, terreno, vehículo o maquinaria con respaldo notarial</p>
            </div>

            <form onSubmit={handleEnviarConsignacion} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nombre Completo del Propietario *</label>
                <input
                  type="text"
                  value={consignarNombre}
                  onChange={(e) => setConsignarNombre(e.target.value)}
                  placeholder="Ej: Ing. Carlos Pérez"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Número de Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  value={consignarTelefono}
                  onChange={(e) => setConsignarTelefono(e.target.value)}
                  placeholder="095 919 0794"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tipo de Activo *</label>
                <select
                  value={consignarTipo}
                  onChange={(e) => setConsignarTipo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="Inmueble (Casa/Terreno/Finca)">🏡 Inmueble (Casa / Terreno / Finca)</option>
                  <option value="Vehículo (Auto/Camioneta/Camión)">🚗 Vehículo (Camioneta / Camión / Auto)</option>
                  <option value="Maquinaria Pesada">🚜 Maquinaria Pesada (Excavadora / Retro)</option>
                  <option value="Arriendo Comercial o Residencial">🏢 Arriendo Comercial o Residencial</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Detalles del Activo y Precio Esperado *</label>
                <textarea
                  value={consignarDetalles}
                  onChange={(e) => setConsignarDetalles(e.target.value)}
                  placeholder="Describe ubicación, metros, año o valor aproximado..."
                  required
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Phone className="w-4 h-4 text-slate-950" />
                <span>Enviar Consignación por WhatsApp Oficial</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. FOOTER CORPORATIVO */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <h4 className="text-white font-black text-sm">ALIANZA ESTRATÉGICA S.A.S.</h4>
            <p className="text-[11px] text-slate-400">Sociedad por Acciones Simplificada • R.U.C. 2200260962001</p>
            <p className="text-[11px] text-slate-500">Puerto Francisco de Orellana (El Coca), Orellana, Ecuador</p>
          </div>

          <div className="space-y-1 text-[11px]">
            <h5 className="text-slate-300 font-bold uppercase tracking-wider text-[10px]">Patrocinio & Legal</h5>
            <p className="text-slate-400">Asesoría Notarial: Abg. Carlos Alfredo Íñiguez Rodríguez</p>
            <p className="text-slate-400">Matrícula Profesional: 07-2026-129</p>
            <p className="text-amber-400">Trámite SENADI Signos Distintivos Nº 314215 • Clase 35 Niza</p>
          </div>

          <div className="flex flex-col items-center md:items-end justify-center gap-2">
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso al Sistema Gerencial y Agentes</span>
            </button>
            <span className="text-[10px] text-slate-500">Autenticación Blindada Firebase Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
