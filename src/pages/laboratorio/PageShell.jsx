import { Search } from 'lucide-react';

export default function PageShell({ title, subtitle, children, showSearch = true }) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 bg-green-500 rounded"></div>
              <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>
            {/* Search removed for laboratorio pages per request */}
          </div>

          {subtitle ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">{subtitle}</h2>
              <p className="text-gray-400 text-sm">Empresas/clientes que completaron correctamente el proceso de cotización</p>
            </>
          ) : null}
        </div>

        {/* Page content */}
        {children}
      </div>
    </div>
  );
}
