import React, { useState, useEffect } from 'react';
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
  DollarSign,
  ChevronRight,
  Sparkles
} from 'lucide-react';

/**
 * CONFIGURACIÓN OFICIAL DE CLIENTE PARA FIREBASE
 * Proyecto: alianza-estrategica-coca
 * Los identificadores públicos de Firebase son seguros para el cliente web.
 * La seguridad y los roles se validan en Firebase Auth y Security Rules.
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

// Inicialización de la app principal de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Instancia secundaria aislada para crear agentes desde el panel de Gerencia
 * sin cerrar la sesión del Administrador Principal.
 */
const getSecondaryAuthInstance = () => {
  const secondaryAppName = 'SecondaryAgentCreationApp';
  const existingApp = getApps().find(a => a.name === secondaryAppName);
  const secondaryApp = existingApp || initializeApp(firebaseConfig, secondaryAppName);
  return getAuth(secondaryApp);
};

// Lista blanca verificada para Gerencia General (Control Total)
const GERENCIA_WHITELIST = [
  'gerencia@alianzaestrategica2026.com',
  'gerencia@alianzaestrategica.com',
  'adriano.aii85@gmail.com',
  'alianzaestrategica2026@gmail.com'
];

export const isGerenciaUser = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return GERENCIA_WHITELIST.includes(cleanEmail) || cleanEmail.startsWith('gerencia@');
};

// Traductor de respuestas de Firebase a mensajes legibles
const parseFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Credenciales incorrectas. Verifique el correo y la contraseña registrados en Firebase.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico ingresado no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada por la administración.';
    case 'auth/too-many-requests':
      return 'Acceso temporalmente bloqueado por demasiados intentos fallidos. Intente nuevamente en unos minutos.';
    case 'auth/email-already-in-use':
      return 'Este correo ya se encuentra registrado en Firebase Auth.';
    case 'auth/weak-password':
      return 'La contraseña debe contener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Error de red o conexión. Verifique su acceso a internet.';
    default:
      return 'Ocurrió un error al procesar la solicitud de autenticación.';
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Formulario de login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Navegación cuando no está logueado
  const [activeView, setActiveView] = useState<'portal' | 'login'>('login');

  // Pestañas activas para el Panel de Gerencia
  const [adminTab, setAdminTab] = useState<'agentes' | 'calculadora' | 'catalogo' | 'senadi'>('agentes');

  // Registro de agentes (Solo Gerencia)
  const [nuevoAgenteNombre, setNuevoAgenteNombre] = useState('');
  const [nuevoAgenteEmail, setNuevoAgenteEmail] = useState('');
  const [nuevoAgentePassword, setNuevoAgentePassword] = useState('');
  const [nuevoAgenteTelefono, setNuevoAgenteTelefono] = useState('');
  const [creandoAgente, setCreandoAgente] = useState(false);
  const [mensajeAgente, setMensajeAgente] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Matriz de comisiones 50/50
  const [calcPrecio, setCalcPrecio] = useState<number>(45000);
  const [calcPorcentaje, setCalcPorcentaje] = useState<number>(4);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
      if (user) {
        setLoginError('');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setLoginEmail('');
      setLoginPassword('');
    } catch (err: any) {
      console.error('Error de autenticación:', err);
      setLoginError(parseFirebaseError(err?.code || ''));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveView('login');
      setMensajeAgente(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const handleCrearAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeAgente(null);

    if (!nuevoAgenteEmail || !nuevoAgentePassword) {
      setMensajeAgente({ tipo: 'error', texto: 'Por favor complete todos los campos requeridos.' });
      return;
    }

    if (nuevoAgentePassword.length < 6) {
      setMensajeAgente({ tipo: 'error', texto: 'La contraseña provisional debe tener al menos 6 caracteres.' });
      return;
    }

    setCreandoAgente(true);
    try {
      const secondaryAuth = getSecondaryAuthInstance();
      await createUserWithEmailAndPassword(secondaryAuth, nuevoAgenteEmail.trim(), nuevoAgentePassword);
      await signOut(secondaryAuth);

      setMensajeAgente({ 
        tipo: 'ok', 
        texto: `¡Agente ${nuevoAgenteNombre || nuevoAgenteEmail} registrado con éxito en Firebase Auth! Ya puede acceder con estas credenciales.` 
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

  const comisionTotal = (calcPrecio * calcPorcentaje) / 100;
  const comisionEmpresa = comisionTotal * 0.50;
  const comisionAgente = comisionTotal * 0.50;

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center text-white px-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-amber-500 p-0.5 animate-pulse mb-4 shadow-[0_0_30px_rgba(56,189,248,0.4)]">
          <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">Alianza Estratégica S.A.S.</h2>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
          Validando credenciales de seguridad con Firebase Auth...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-sky-500 to-blue-600 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  ALIANZA ESTRATÉGICA S.A.S.
                  <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">Oficial</span>
                </h1>
                <p className="text-[11px] text-slate-400">El Coca, Orellana — Ecuador • RUC: 2200260962001</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView(activeView === 'login' ? 'portal' : 'login')}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'login'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-600/20'
                }`}
              >
                {activeView === 'login' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ver Información Institucional</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Acceso al Sistema</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {activeView === 'login' ? (
          <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-950 border border-sky-500/30 mb-3 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                  <Lock className="w-6 h-6 text-sky-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Acceso Corporativo Seguro</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Autenticación exclusiva para Gerencia y Agentes Comerciales
                </p>
                <div className="inline-flex items-center gap-1.5 bg-sky-950/80 border border-sky-500/30 text-sky-300 text-[11px] px-3 py-1 rounded-full font-semibold mt-3">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Módulo Oficial Firebase Authentication
                </div>
              </div>

              {loginError && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Error de autenticación</span>
                    <span className="text-rose-200/90">{loginError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Correo Institucional</span>
                    <span className="text-[10px] text-slate-400">Firebase Auth</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="gerencia@alianzaestrategica2026.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Contraseña Registrada</span>
                    <span className="text-[10px] text-slate-400">Cifrado de extremo a extremo</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
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
                  className="w-full mt-2 bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-xl shadow-sky-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>Ingresar al Sistema Seguro</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Seguridad y Cero Exposición de Contraseñas</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Cero credenciales en texto plano. Todo usuario debe estar creado directamente en la consola de Firebase Authentication del proyecto <span className="text-sky-300 font-mono">alianza-estrategica-coca</span>.
                </p>
                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>SSL / TLS 256-bit</span>
                  <span>ID: 1029575911279</span>
                </div>
              </div>
            </div>
          </main>
        ) : (
          <main className="flex-1 max-w-6xl mx-auto w-full p-4 py-8 space-y-8">
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden">
              <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/50 border border-amber-500/30 px-3.5 py-1 rounded-full inline-block mb-3">
                Sociedad por Acciones Simplificada • R.U.C. 2200260962001
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
                Comercialización Formal de Activos con Blindaje Notarial
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mt-3">
                Intermediación transparente de Bienes Raíces, Vehículos y Maquinaria Pesada en El Coca y toda la Amazonía Ecuatoriana.
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveView('login')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-xl transition flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <Lock className="w-4 h-4 text-slate-950" />
                  <span>Acceso de Gerencia y Agentes</span>
                </button>
                <a
                  href="https://wa.me/593959190794?text=Hola%20Alianza%20Estrat%C3%A9gica,%20deseo%20m%C3%A1s%20informaci%C3%B3n"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Oficial (095 919 0794)</span>
                </a>
              </div>
            </section>
          </main>
        )}

        <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-6 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <p className="text-slate-300 font-bold">ALIANZA ESTRATÉGICA S.A.S. — Todos los derechos reservados © 2026</p>
              <p className="text-[11px] text-slate-500">Puerto Francisco de Orellana (El Coca), Orellana, Ecuador</p>
            </div>
            <div className="text-[11px] text-slate-400">
              <span>Trámite SENADI Signos Distintivos Nº 314215 • Clase 35 Niza</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Si está autenticado
  const isAdmin = isGerenciaUser(currentUser.email);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">ALIANZA ESTRATÉGICA S.A.S.</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isAdmin 
                    ? 'bg-amber-950 text-amber-300 border border-amber-500/40' 
                    : 'bg-sky-950 text-sky-300 border border-sky-500/40'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isAdmin ? 'Gerencia General (Control Total)' : 'Agente Comercial Autorizado'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-sky-400" />
                <span className="font-mono text-slate-300">{currentUser.email}</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Firebase Auth Validado</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {isAdmin ? (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
          <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-sky-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Panel Maestro de Administración
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Bienvenido, Gerente General
              </h2>
              <p className="text-xs text-slate-300">
                Sesión iniciada con Firebase Auth. Gestión de agentes colaboradores, comisiones 50/50 y blindaje legal.
              </p>
            </div>

            <a
              href="https://chat.whatsapp.com/LWnH4P4Q4LuLDnRSLNXRYn?s=cl&p=a&iam=2"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Grupo Oficial WA Agentes</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </section>

          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setAdminTab('agentes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'agentes'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Gestión de Agentes (Firebase)</span>
            </button>
            <button
              onClick={() => setAdminTab('calculadora')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'calculadora'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Matriz Financiera 50/50</span>
            </button>
            <button
              onClick={() => setAdminTab('catalogo')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'catalogo'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Activos y Captaciones</span>
            </button>
            <button
              onClick={() => setAdminTab('senadi')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                adminTab === 'senadi'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Registro Legal & SENADI</span>
            </button>
          </div>

          {adminTab === 'agentes' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Registrar Nuevo Agente Comercial</h3>
                    <p className="text-[11px] text-slate-400">Crea credenciales oficiales directas en Firebase Authentication</p>
                  </div>
                </div>

                {mensajeAgente && (
                  <div className={`mb-4 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                    mensajeAgente.tipo === 'ok' 
                      ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-200' 
                      : 'bg-rose-950/70 border border-rose-500/40 text-rose-200'
                  }`}>
                    {mensajeAgente.tipo === 'ok' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{mensajeAgente.texto}</span>
                  </div>
                )}

                <form onSubmit={handleCrearAgente} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Nombre Completo del Agente</label>
                    <input
                      type="text"
                      value={nuevoAgenteNombre}
                      onChange={(e) => setNuevoAgenteNombre(e.target.value)}
                      placeholder="Ej: Ing. Carlos Mendoza"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Correo Electrónico (Credencial de Acceso) *
                    </label>
                    <input
                      type="email"
                      value={nuevoAgenteEmail}
                      onChange={(e) => setNuevoAgenteEmail(e.target.value)}
                      placeholder="agente.ventas@alianzaestrategica2026.com"
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Contraseña Temporal / Asignada (Mínimo 6 caracteres) *
                    </label>
                    <input
                      type="text"
                      value={nuevoAgentePassword}
                      onChange={(e) => setNuevoAgentePassword(e.target.value)}
                      placeholder="AlianzaAgente2026*"
                      required
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Número de WhatsApp del Agente</label>
                    <input
                      type="tel"
                      value={nuevoAgenteTelefono}
                      onChange={(e) => setNuevoAgenteTelefono(e.target.value)}
                      placeholder="098 123 4567"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creandoAgente}
                    className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {creandoAgente ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin"></div>
                        <span>Registrando en Firebase Auth...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-slate-950" />
                        <span>Crear Cuenta de Agente en Firebase</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                    Arquitectura Segura Multisesión:
                  </p>
                  <p>
                    La creación de agentes se ejecuta en un contexto de Firebase aislado, lo que garantiza que tu sesión como Administrador Principal nunca se cierre al dar de alta nuevos colaboradores.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    Plantilla de Notificación para el Agente
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Copia y envía este mensaje por WhatsApp o correo una vez registrado el agente:
                  </p>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line select-all">
                    {`¡Hola! Bienvenido al equipo comercial de ALIANZA ESTRATÉGICA S.A.S. 🏢🤝

Tus credenciales oficiales de acceso han sido dadas de alta:
• Portal Web: https://alianzaestrategica2026.com
• Correo: ${nuevoAgenteEmail || '[Correo del agente]'}
• Clave provisional: ${nuevoAgentePassword || '[Contraseña asignada]'}

Comisión: 50% de la comisión total pactada por cada captación o cierre.
Únete al grupo de coordinación en WhatsApp:
https://chat.whatsapp.com/LWnH4P4Q4LuLDnRSLNXRYn`}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Bienvenido a ALIANZA ESTRATÉGICA S.A.S. Tus credenciales han sido generadas. Acceso: https://alianzaestrategica2026.com con el correo: ${nuevoAgenteEmail}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Compartir por WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Políticas de Agentes Oficiales</h4>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>Los agentes autorizados pueden registrar visitas y postular captaciones en el catálogo.</li>
                    <li>Ningún agente está autorizado a recibir dinero en efectivo de clientes. Toda reserva se efectúa a la cuenta bancaria de la empresa.</li>
                    <li>La formalización y contratos de compraventa se firman bajo la supervisión de Gerencia y patrocinio jurídico notarial.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'calculadora' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Matriz de Distribución de Comisiones 50% / 50%</h3>
                  <p className="text-xs text-slate-400">Cálculo transparente de ingresos brutos por cada cierre de venta</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Precio de Venta del Activo (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="number"
                        value={calcPrecio}
                        onChange={(e) => setCalcPrecio(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Porcentaje de Comisión Pactada (%)
                    </label>
                    <div className="flex items-center gap-2">
                      {[3, 4, 5, 6].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCalcPorcentaje(pct)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                            calcPorcentaje === pct
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Comisión Bruta Total</span>
                    <span className="text-2xl font-black text-amber-400 mt-2">
                      ${comisionTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1">100% de la intermediación</span>
                  </div>

                  <div className="bg-sky-950/40 p-4 rounded-2xl border border-sky-500/30 flex flex-col justify-between">
                    <span className="text-[11px] font-bold text-sky-300 uppercase">50% Alianza Estratégica</span>
                    <span className="text-2xl font-black text-sky-400 mt-2">
                      ${comisionEmpresa.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-sky-300/70 mt-1">Ingreso empresa / soporte legal</span>
                  </div>

                  <div className="bg-emerald-950/40 sm:col-span-2 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-300 uppercase block">50% Agente Captador / Cerrador</span>
                      <span className="text-xs text-slate-300">Pago inmediato tras liquidación notarial</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400">
                      ${comisionAgente.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'catalogo' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Catálogo de Activos & Oportunidades</h3>
                    <p className="text-xs text-slate-400">Monitoreo de bienes consignados con saneamiento en El Coca y Orellana</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">RE-001 • Bien Raíz</span>
                  <h4 className="text-sm font-bold text-white mt-2">Casa y Terreno en El Coca</h4>
                  <p className="text-xs text-slate-400 mt-1">Sector 6 de Diciembre. Escrituras al día.</p>
                  <p className="text-sm font-black text-amber-400 mt-2">$45,000 USD</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded">VH-002 • Automotor</span>
                  <h4 className="text-sm font-bold text-white mt-2">Camioneta Toyota Hilux 4x4</h4>
                  <p className="text-xs text-slate-400 mt-1">Diésel, único dueño, matrícula al día.</p>
                  <p className="text-sm font-black text-sky-400 mt-2">$28,500 USD</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">MQ-003 • Maquinaria</span>
                  <h4 className="text-sm font-bold text-white mt-2">Retroexcavadora Caterpillar 420F</h4>
                  <p className="text-xs text-slate-400 mt-1">Horómetro verificado, lista para operar.</p>
                  <p className="text-sm font-black text-emerald-400 mt-2">$62,000 USD</p>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'senadi' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Estado de Trámites Oficiales SENADI</h3>
                  <p className="text-xs text-slate-400">Protección de Propiedad Intelectual en Ecuador</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Signos Distintivos (Marca Mixta)</span>
                    <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">
                      Formulario 314215
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Denominación:</strong> ALIANZA ESTRATÉGICA (Clase 35 Niza - Intermediación Comercial, Publicidad y Marketplace).
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Solicitante:</strong> Adrián Arturo Íñiguez Lucio (RUC 2200260962001).
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Abogado Patrocinador:</strong> Abg. Carlos Alfredo Íñiguez Rodríguez (Matrícula 07-2026-129).
                  </p>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Expediente completo y listo para pago oficial de tasa ($208 USD).
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400">Derecho de Autor (Software)</span>
                    <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-mono">
                      Programas de Ordenador
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Obra:</strong> Plataforma Web y Sistema de Comercio Electrónico Alianza Estratégica.
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Autor y Titular:</strong> Adrián Arturo Íñiguez Lucio.
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>Depósito Técnico:</strong> Código fuente TypeScript/React, arquitectura Firebase y manual descriptivo.
                  </p>
                  <div className="text-[11px] text-sky-400 flex items-center gap-1 font-semibold pt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    En proceso de depósito de soporte lógico en plataforma SENADI.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      ) : (
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
          <section className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-sky-300 text-xs font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>PANEL DE AGENTE COMERCIAL AUTORIZADO</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              Bienvenido, {currentUser.email}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Tienes acceso a la red comercial de Alianza Estratégica S.A.S. para postular captaciones y coordinar visitas con acompañamiento notarial.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://chat.whatsapp.com/LWnH4P4Q4LuLDnRSLNXRYn?s=cl&p=a&iam=2"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Unirse al Grupo Oficial de Agentes en WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Registrar Nueva Captación</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ¿Tienes un inmueble, vehículo o maquinaria para consignar? Envía los datos directamente a Gerencia para revisión de gravámenes y publicación.
              </p>
              <a
                href="https://wa.me/593959190794?text=Estimada%20Gerencia,%20soy%20agente%20autorizado%20y%20tengo%20una%20nueva%20captaci%C3%B3n%20para%20consignar."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <span>Enviar datos de captación a Gerencia</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Estructura de Comisión 50% / 50%</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Por cada negocio formalizado, recibes el 50% de la comisión total acordada con el cliente vendedor. Pago directo vía transferencia bancaria tras la firma de escrituras o traspaso.
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Garantía de liquidación notarial formal</span>
              </div>
            </div>
          </div>
        </main>
      )}

      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-500 text-[11px] py-4 px-4 text-center mt-auto">
        <p>ALIANZA ESTRATÉGICA S.A.S. • Sistema de Autenticación Firebase Auth • Francisco de Orellana (El Coca), Ecuador</p>
      </footer>
    </div>
  );
}
