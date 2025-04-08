import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useMobileDetect } from '../../utils/responsiveUtils';

/**
 * Componentă reutilizabilă pentru afișarea datelor în format tabelar,
 * cu suport pentru vizualizare responsivă pe dispozitive mobile
 * 
 * @param {Object} props - Proprietăți componentă
 * @param {Array} props.columns - Configurarea coloanelor
 * @param {Array} props.data - Datele de afișat
 * @param {Function} props.onRowClick - Funcție apelată la click pe rând
 * @param {boolean} props.isLoading - Indicator de încărcare
 * @param {string} props.searchPlaceholder - Text placeholder pentru câmpul de căutare
 * @param {boolean} props.showSearch - Arată/ascunde câmpul de căutare
 * @param {string} props.emptyMessage - Mesaj afișat când nu există date
 */
const ResponsiveTable = ({
  columns = [],
  data = [],
  onRowClick,
  isLoading = false,
  searchPlaceholder = 'Căutare...',
  showSearch = true,
  emptyMessage = 'Nu există date disponibile',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const { isMobile } = useMobileDetect();

  // Funcție pentru căutare în date
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Funcție pentru sortare
  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Filtrarea datelor în funcție de termenul de căutare
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    
    // Caută în fiecare coloană care are proprietatea searchable
    return columns.some((column) => {
      if (!column.searchable) return false;
      
      const value = column.accessor ? 
        (typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor]) : 
        '';
      
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Sortarea datelor
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const column = columns.find(col => col.accessor === sortColumn || col.id === sortColumn);
    if (!column) return 0;
    
    const aValue = column.accessor ? 
      (typeof column.accessor === 'function' ? column.accessor(a) : a[column.accessor]) : 
      '';
    const bValue = column.accessor ? 
      (typeof column.accessor === 'function' ? column.accessor(b) : b[column.accessor]) : 
      '';
    
    if (aValue === bValue) return 0;
    
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    return aValue > bValue ? direction : -direction;
  });

  return (
    <div className={`w-full ${className}`}>
      {/* Căutare */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabel Desktop */}
      {!isMobile && (
        <div className="overflow-x-auto glassmorphism rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white/70">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id || column.accessor}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.id || column.accessor)}
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && sortColumn === (column.id || column.accessor) && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 whitespace-nowrap text-center text-gray-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rowIndex) => (
                  <tr
                    key={row.id || rowIndex}
                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {columns.map((column, colIndex) => (
                      <td 
                        key={`${rowIndex}-${column.id || column.accessor || colIndex}`} 
                        className={`px-6 py-4 whitespace-nowrap ${column.className || ''}`}
                      >
                        {column.cell ? (
                          column.cell(row, rowIndex)
                        ) : (
                          <div className={`text-sm ${column.textClassName || 'text-gray-900'}`}>
                            {column.accessor ? 
                              (typeof column.accessor === 'function' ? 
                                column.accessor(row) : row[column.accessor]) 
                              : ''}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Vizualizare Card pentru Mobile */}
      {isMobile && (
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="text-center py-12 text-gray-500 glassmorphism rounded-xl p-6">
              {emptyMessage}
            </div>
          ) : (
            sortedData.map((row, rowIndex) => (
              <div
                key={row.id || rowIndex}
                className={`glassmorphism rounded-lg p-3 shadow-sm ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  // Exclude coloane care nu ar trebui afișate pe mobil
                  if (column.hideOnMobile) return null;
                  
                  return (
                    <div 
                      key={`${rowIndex}-${column.id || column.accessor || colIndex}`}
                      className={`${colIndex !== 0 ? 'mt-2' : ''} ${column.mobileClassName || ''}`}
                    >
                      {/* Titlu coloană pe mobil */}
                      {column.showHeaderOnMobile !== false && (
                        <div className="text-xs text-gray-500 mb-1">
                          {column.header}
                        </div>
                      )}
                      
                      {/* Conținut celulă */}
                      <div>
                        {column.cell ? (
                          column.cell(row, rowIndex, true) // al treilea parametru indică vizualizarea mobilă
                        ) : (
                          <div className={`text-sm ${column.textClassName || 'text-gray-900'}`}>
                            {column.accessor ? 
                              (typeof column.accessor === 'function' ? 
                                column.accessor(row) : row[column.accessor]) 
                              : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;