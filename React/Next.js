import React, { useState, useMemo } from 'react';

export interface AssetItem {
  id: string;
  code: string;
  title: string;
  category: 'RE' | 'AR' | 'VH' | 'MQ' | 'LQ' | string;
  price?: number;
  realSalePrice?: number;
  priceStr?: string;
  location?: string;
  ciudad?: string;
  provincia?: string;
  sector?: string;
  desc?: string;
  images: string[];
  status?: 'DISPONIBLE' | 'OFERTA' | 'REMATE' | 'RESERVADO' | 'VENDIDO' | 'SOLD';
  isOffer?: boolean;
  isFeatured?: boolean;
  agentName?: string;
}

export interface MarketplaceFeedProps {
  items: AssetItem[];
  currentRole?: 'GUEST' | 'AGENT' | 'ADMIN';
  officialWhatsAppNumber?: string;
  onOpenDetail?: (item: AssetItem) => void;
  onEditItem?: (item: AssetItem) => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'Todos', icon: 'fa-shapes' },
  { id: 'RE', label: 'Bienes Raíces', icon: 'fa-house-chimney' },
  { id: 'AR', label: 'Arriendos', icon: 'fa-key' },
  { id: 'VH', label: 'Vehículos', icon: 'fa-car' },
  { id: 'MQ', label: 'Maquinaria', icon: 'fa-truck-monster' },
  { id: 'LQ', label: 'Remate / Oportunidad', icon: 'fa-tag' },
  { id: 'SOLD', label: 'Vendidos', icon: 'fa-circle-check' },
];

export const MarketplaceFeed: React.FC<MarketplaceFeedProps> = ({
  items = [],
  currentRole = 'GUEST',
  officialWhatsAppNumber = '593959190794',
  onOpenDetail,
  onEditItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isSold = item.status === 'VENDIDO' || item.status === 'SOLD';
      if (selectedCategory === 'SOLD') return isSold;
      if (isSold && selectedCategory !== 'ALL') return false;

      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      const queryClean = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryClean ||
        item.title?.toLowerCase().includes(queryClean) ||
        item.code?.toLowerCase().includes(queryClean) ||
        item.location?.toLowerCase().includes(queryClean) ||
        item.ciudad?.toLowerCase().includes(queryClean) ||
        item.desc?.toLowerCase().includes(queryClean);

      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const getStatusBadge = (status?: string, isOffer?: boolean) => {
    if (status === 'VENDIDO' || status === 'SOLD') {
      return (
        <span className="bg-rose-700 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow">
          🔴 Vendido
        </span>
      );
    }
    if (status === 'OFERTA' || isOffer) {
      return (
        <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1 animate-pulse">
          <i className="fa-solid fa-fire text-amber-200"></i> OFERTA
        </span>
      );
    }
    if (status === 'REMATE') {
      return (
        <span className="bg-purple-600 text-white font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow">
          💥 Remate
        </span>
      );
    }
    return (
      <span className="bg-emerald-600/90 text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow">
        ✅ Disponible
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* 1. BARRA SUPERIOR DE BÚSQUEDA Y FILTROS RÁPIDOS (ESTILO FACEBOOK MARKETPLACE) */}
      <div className="sticky top-2 z-20 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-xl space-y-2.5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar inmueble, vehículo, código (ej: RE-001)..."
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 sm:top-3.5 text-sky-400 text-xs sm:text-sm"></i>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              <i className="fa-solid fa-circle-xmark"></i>
            </button>
          )}
        </div>

        {/* FILTROS RÁPIDOS DESLIZABLES HORIZONTALMENTE CON EL DEDO */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth select-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <i className={`fa-solid ${cat.icon} text-[11px]`}></i>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CUADRÍCULA RESPONSIVA (GRID LAYOUT: 2 COLUMNAS EN MÓVIL, 3 EN TABLET, 4 EN PC) */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-slate-400">
          <i className="fa-solid fa-folder-open text-4xl mb-3 text-sky-400"></i>
          <p className="text-sm font-bold text-white">No se encontraron anuncios clasificados</p>
          <p className="text-xs text-slate-400 mt-1">Prueba seleccionando otra categoría o borrando tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {filteredItems.map((item) => {
            const mainImg = item.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
            const priceText = item.priceStr || ('$' + (item.realSalePrice || item.price || 0).toLocaleString() + ' USD');
            const locationText = item.ciudad || item.location || 'El Coca, Orellana';

            return (
              <div
                key={item.id}
                onClick={() => onOpenDetail?.(item)}
                className="bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-400/40 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer active:scale-[0.98]"
              >
                <div>
                  {/* IMAGEN SUPERIOR CON PROPORCIÓN DE ASPECTO 4:3 */}
                  <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
                    <img
                      src={mainImg}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* BADGE CÓDIGO */}
                    <span className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-md text-amber-400 font-mono text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-lg border border-amber-400/30 shadow">
                      {item.code}
                    </span>

                    {/* BADGES OFERTA / ESTADO */}
                    <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                      {getStatusBadge(item.status, item.isOffer)}
                      {item.isFeatured && (
                        <span className="bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                          ⭐ Top
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CONTENIDO PRINCIPAL DE LA TARJETA */}
                  <div className="p-2.5 sm:p-3.5 space-y-1">
                    {/* PRECIO DESTACADO EN PRIMER PLANO */}
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-sm sm:text-base md:text-lg font-black text-emerald-400 group-hover:text-amber-300 transition-colors leading-tight">
                        {priceText}
                      </p>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800 flex-shrink-0">
                        {item.category}
                      </span>
                    </div>

                    {/* TÍTULO DEL ANUNCIO (HASTA 2 LÍNEAS) */}
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-tight pt-0.5">
                      {item.title}
                    </h3>

                    {/* UBICACIÓN CON PIN */}
                    <div className="flex items-center text-[10px] sm:text-xs text-slate-400 pt-0.5 truncate">
                      <i className="fa-solid fa-location-dot text-rose-500 mr-1 text-[10px] flex-shrink-0"></i>
                      <span className="truncate font-medium text-slate-300">{locationText}</span>
                    </div>
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN RÁPIDA (TOUCH-FRIENDLY) */}
                <div
                  className="p-2 sm:p-3 pt-0 border-t border-slate-800/80 flex items-center justify-between gap-1.5 mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onOpenDetail?.(item)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white text-[10px] sm:text-xs font-bold py-1.5 px-2 rounded-xl transition flex-1 text-center border border-slate-700/80 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-file-lines text-sky-400"></i> Ficha
                  </button>

                  <a
                    href={`https://wa.me/${officialWhatsAppNumber}?text=${encodeURIComponent(
                      `Hola Alianza Estratégica, solicito información del activo ${item.code} (${item.title})`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] sm:text-xs font-bold py-1.5 px-2.5 rounded-xl transition shadow flex items-center justify-center gap-1 flex-shrink-0 cursor-pointer"
                    title="Consultar por WhatsApp"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                  </a>

                  {currentRole === 'ADMIN' && (
                    <button
                      onClick={() => onEditItem?.(item)}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-bold transition shadow flex-shrink-0 cursor-pointer"
                      title="Editar como Administrador"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MarketplaceFeed;
