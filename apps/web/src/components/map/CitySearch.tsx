'use client';

import { useState } from 'react';

interface CitySearchProps {
  onCitySelect: (lat: number, lng: number) => void;
}

export default function CitySearch({ onCitySelect }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Usar la API de Nominatim para geocodificación
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        onCitySelect(parseFloat(lat), parseFloat(lon));
        setSearchQuery(''); // Limpiar el campo después de buscar
      } else {
        setError('No se encontraron resultados para la búsqueda');
      }
    } catch (error) {
      console.error('Error al buscar ciudad:', error);
      setError('Ocurrió un error al buscar la ciudad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4">
      <form 
        onSubmit={handleSearch}
        className="flex w-full items-center space-x-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg"
      >
        <input
          type="text"
          placeholder="Buscar ciudad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 text-sm outline-none border border-gray-200 rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-sm bg-red-50 text-red-700 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}