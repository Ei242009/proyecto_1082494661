'use client';

import { useState } from 'react';

export default function AuditLogPage() {
  const [selectedMonth, setSelectedMonth] = useState('');

  // Placeholder for audit log viewer
  // In live mode, this would fetch from Vercel Blob

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Bitácora de Auditoría</h1>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Mes
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-center text-gray-500">
            <p>Bitácora de auditoría disponible en modo producción con Vercel Blob.</p>
            <p>En modo seed, los logs se muestran en la consola del servidor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}