import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Column {
  key: string;
  header: string;
  type?: 'image' | 'text';
  width?: string;
  render?: (value: any, item?: any) => React.ReactNode;
}

interface Action {
  icon: string;
  method: (item: any) => void;
  tooltip: string;
  visibility?: (item: any) => boolean;
}

interface TableProps {
  columns: Column[];
  data: any[];
  actions?: Action[];
  loading?: boolean;
}

const Table = ({ columns, data, actions, loading }: TableProps) => {
  const getValueByPath = (obj: any, path: string): any =>
    path.split('.').reduce((acc, part) => acc && acc[part], obj);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {actions && <th className="px-4 py-4 w-20"><Skeleton height={20} /></th>}
              {columns.map((c) => <th key={c.key} className="px-4 py-4"><Skeleton height={20} /></th>)}
            </tr>
          </thead>
          <tbody>
            {Array(5).fill(null).map((_, i) => (
              <tr key={i} className="border-t border-gray-100">
                {actions && <td className="px-4 py-3"><Skeleton height={28} width={60} /></td>}
                {columns.map((c) => <td key={c.key} className="px-4 py-3"><Skeleton height={20} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
        <i className="fa-solid fa-inbox text-4xl text-gray-300 mb-3 block"></i>
        <p className="text-gray-500">Nessun dato trovato</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-600 uppercase bg-gray-50">
            <tr>
              {actions && (
                <th className="px-4 py-4 font-semibold border-r border-gray-200">Azioni</th>
              )}
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={`px-4 py-4 font-semibold ${i < columns.length - 1 ? 'border-r border-gray-200' : ''}`}
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={idx}
                className="border-t border-gray-100 odd:bg-white even:bg-gray-50/50 hover:bg-blue-50/30 transition-colors"
              >
                {actions && (
                  <td className="px-4 py-3 border-r border-gray-200">
                    <div className="flex gap-2">
                      {actions.map((action) =>
                        action.visibility && !action.visibility(item) ? null : (
                          <button
                            type="button"
                            key={action.icon}
                            onClick={() => action.method(item)}
                            title={action.tooltip}
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-100 border border-gray-200 hover:border-blue-300 flex items-center justify-center transition-all cursor-pointer"
                          >
                            <i className={`fas ${action.icon} text-gray-600 hover:text-blue-700 text-sm`}></i>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                )}
                {columns.map((c, colIdx) => {
                  const value = getValueByPath(item, c.key);
                  return (
                    <td
                      key={c.key}
                      className={`px-4 py-3 ${colIdx < columns.length - 1 ? 'border-r border-gray-200' : ''}`}
                      style={c.width ? { width: c.width } : undefined}
                    >
                      {c.render ? c.render(value, item) : c.type === 'image' ? (
                        value ? <img src={value} alt="" className="w-10 h-10 rounded object-cover" /> : <span className="text-gray-400">-</span>
                      ) : (
                        <span>{value ?? '-'}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
