import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User 
} from 'firebase/auth';

// Configuración segura de Firebase para Alianza Estratégica
const firebaseConfig = {
  apiKey: "AIzaSyCLQfG1X62E5_WJ6hyCDjoDVkWbja02N3A",
  authDomain: "alianza-estrategica-coca.firebaseapp.com",
  projectId: "alianza-estrategica-coca",
  storageBucket: "alianza-estrategica-coca.firebasestorage.app",
  messagingSenderId: "1029575911279",
  appId: "1:1029575911279:web:1ceb020bb86571ced6a9a",
  measurementId: "G-TGB0CSMEKW"
};

// Inicializar la aplicación principal de Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Inicialización secundaria para crear agentes sin cerrar la sesión del Gerente actual
const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [nuevoAgenteEmail, setNuevoAgenteEmail] = useState('');
  const [nuevoAgentePassword, setNuevoAgentePassword] = useState('');
  const [mensajeAgente, setMensajeAgente] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos. Si acabas de crear el usuario en Firebase, verifica que las credenciales coincidan.');
      } else {
        setError('Error al iniciar sesión: ' + err.message);
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleCrearAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeAgente('');
    try {
      // Se utiliza la auth secundaria para no cerrar la sesión del Administrador/Gerente
      await createUserWithEmailAndPassword(secondaryAuth, nuevoAgenteEmail, nuevoAgentePassword);
      setMensajeAgente(`¡Agente ${nuevoAgenteEmail} creado con éxito!`);
      setNuevoAgenteEmail('');
      setNuevoAgentePassword('');
    } catch (err: any) {
      setMensajeAgente('Error al crear agente: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', color: '#fff' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#38bdf8' }}>Alianza Estratégica</h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '30px' }}>Sistema de Autenticación de Gerencia</p>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Correo Electrónico:</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="ej. gerencia@allianceestrategica2026.com"
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Contraseña:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px' }}
              />
            </div>
            {error && <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '15px', lineHeight: '1.4' }}>{error}</p>}
            <button type="submit" style={{ width: '100%', padding: '12px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Comprobación flexible del rol de gerencia (puede evaluar si incluye 'gerencia' o tu correo corporativo)
  const esGerente = user.email && (user.email.includes('gerencia') || user.email.includes('carllos-alfredo88') || user.email.includes('admin'));

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a' }}>Alianza Estratégica</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Conectado como: <strong>{user.email}</strong></p>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        {esGerente ? (
          <div>
            <h2 style={{ color: '#0284c7' }}>Panel del Administrador Principal (Gerencia)</h2>
            <p style={{ color: '#334155' }}>Control total de accesos y colaboradores de la plataforma.</p>
            
            <div style={{ marginTop: '30px', padding: '25px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff' }}>
              <h3 style={{ marginTop: 0, color: '#0f172a' }}>Dar de alta nuevo Agente Colaborador</h3>
              <form onSubmit={handleCrearAgente}>
                <div style={{ marginBottom: '15px' }}>
                  <input 
                    type="email" 
                    placeholder="Correo institucional del agente" 
                    value={nuevoAgenteEmail} 
                    onChange={(e) => setNuevoAgenteEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <input 
                    type="password" 
                    placeholder="Contraseña temporal" 
                    value={nuevoAgentePassword} 
                    onChange={(e) => setNuevoAgentePassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Crear Cuenta de Agente
                </button>
              </form>
              {mensajeAgente && <p style={{ marginTop: '15px', color: '#16a34a', fontWeight: 'bold' }}>{mensajeAgente}</p>}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ color: '#16a34a' }}>Panel del Agente Colaborador</h2>
            <p style={{ color: '#334155' }}>Bienvenido al sistema operativo de captaciones.</p>
            <ul style={{ color: '#334155', lineHeight: '1.8' }}>
              <li>Registrar nueva captación inmobiliaria, vehicular o maquinaria.</li>
              <li>Gestionar prospectos interesados en visitas.</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
