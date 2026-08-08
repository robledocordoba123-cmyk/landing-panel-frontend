import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

function LandingPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const respuesta = await fetch('http://localhost:3001/api/mensajes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!respuesta.ok) {
        throw new Error('Algo salió mal al enviar el mensaje');
      }

      setEnviado(true);
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
    } catch (err) {
      setError('No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-purple-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Tu negocio, un paso adelante
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Ayudamos a negocios como el tuyo a crecer con soluciones digitales a tu medida.
        </p>
      </section>

      {/* Servicios */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Qué ofrecemos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Diseño Web</h3>
            <p className="text-gray-600">Sitios modernos y responsive.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Desarrollo a medida</h3>
            <p className="text-gray-600">Soluciones adaptadas a tus necesidades.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2">Soporte continuo</h3>
            <p className="text-gray-600">Te acompañamos después de la entrega.</p>
          </div>
        </div>
      </section>

      {/* Formulario de contacto */}
      <section className="py-16 px-6 max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Contáctanos</h2>

        {enviado ? (
          <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
            ¡Gracias! Tu mensaje fue enviado correctamente.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono (opcional)"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <textarea
              name="mensaje"
              placeholder="Tu mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              required
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition"
            >
              Enviar mensaje
            </button>
          </form>
        )}
      </section>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;