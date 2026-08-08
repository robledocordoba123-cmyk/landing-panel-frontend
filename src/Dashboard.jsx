import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [mensajes, setMensajes] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cargarMensajes = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const respuesta = await fetch('http://localhost:3001/api/mensajes', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!respuesta.ok) {
          throw new Error('No se pudieron cargar los mensajes');
        }

        const datos = await respuesta.json();
        setMensajes(datos);
      } catch (err) {
        setError(err.message);
      }
    };

    cargarMensajes();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Mensajes recibidos</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Cerrar sesión
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="space-y-4">
          {mensajes.length === 0 ? (
            <p className="text-gray-500 text-center">No hay mensajes todavía.</p>
          ) : (
            mensajes.map((msg) => (
              <div key={msg.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{msg.nombre}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(msg.creadoEn).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{msg.email}</p>
                {msg.telefono && (
                  <p className="text-sm text-gray-600 mb-1">Tel: {msg.telefono}</p>
                )}
                <p className="text-gray-800 mt-2">{msg.mensaje}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;