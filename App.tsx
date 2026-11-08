import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User 
} from 'firebase/auth';

// Configuración de Firebase de Alianza Estratégica
const firebaseConfig = {
  apiKey: "AIzaSyCLQfG1X62E5_WJ6hyCDjoDVkWbja02N3A",
  authDomain: "alianza-estrategica-coca.firebaseapp.com",
  projectId: "alianza-estrategica-coca",
  storageBucket: "alianza-estrategica-coca.firebasestorage.app",
  messagingSenderId: "1029575911279",
  appId: "1:1029575911279:web:1ceb020bb86571ced6a9a",
  measurementId: "G-TGB0CSMEKW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Formulario para registrar nuevos agentes
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
      setError('Correo o contraseña incorrectos. Verifica tus datos.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleCrearAgente = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeAgente('');
    try {
      await createUserWithEmailAndPassword(auth, nuevoAgenteEmail, nuevoAgentePassword);
      setMensajeAgente(`¡Agente ${nuevoAgenteEmail} creado con éxito!`);
      setNuevoAgenteEmail('');
      setNuevoAgentePassword('');
    } catch (err: any) {
      setMensajeAgente('Error al crear agente: ' + err.message);
    }
  };

  // VISTA 1: Formulario de Inicio de Sesión
  if (!user) {
    return (
      <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Alianza Estratégica 2026</h2>
        <p>Sistema de Ingreso para Gerencia y Agentes</p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Iniciar Sesión
          </button>
        </form>
      </div>
    );
  }

  // VISTA 2: Panel General (Detección de Rol)
  const esGerente = user.email && user.email.includes('gerencia');

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Alianza Estratégica</h1>
          <p style={{ margin: 0, color: '#666' }}>Usuario activo: <strong>{user.email}</strong></p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>

      <main style={{ marginTop: '30px' }}>
        {esGerente ? (
          <div>
            <h2 style={{ color: '#0056b3' }}>Panel del Administrador Principal (Gerencia)</h2>
            <p>Bienvenido. Desde aquí controlas el acceso a la plataforma.</p>
            
            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
              <h3>Registrar Nuevo Agente Colaborador</h3>
              <form onSubmit={handleCrearAgente}>
                <div style={{ marginBottom: '10px' }}>
                  <input 
                    type="email" 
                    placeholder="Correo del nuevo agente" 
                    value={nuevoAgenteEmail} 
                    onChange={(e) => setNuevoAgenteEmail(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <input 
                    type="password" 
                    placeholder="Contraseña temporal" 
                    value={nuevoAgentePassword} 
                    onChange={(e) => setNuevoAgentePassword(e.target.value)} 
                    required 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>
                <button type="submit" style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Crear Cuenta de Agente
                </button>
              </form>
              {mensajeAgente && <p style={{ marginTop: '10px', color: '#0056b3' }}>{mensajeAgente}</p>}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ color: '#28a745' }}>Panel del Agente Colaborador</h2>
            <p>Bienvenido al módulo de trabajo de Alianza Estratégica.</p>
            <ul>
              <li>Registrar nueva captación (Inmueble / Vehículo / Maquinaria / Subasta)</li>
              <li>Gestionar prospectos y solicitudes de visita</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
