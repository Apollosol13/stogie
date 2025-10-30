'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import AddCigarModal from '@/components/humidor/AddCigarModal';
import EditCigarModal from '@/components/humidor/EditCigarModal';
import { Search, Grid3x3, List, Package, Star } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import StarRating from '@/components/StarRating';

export default function HumidorPage() {
  return (
    <ProtectedRoute>
      <HumidorContent />
    </ProtectedRoute>
  );
}

type TabType = 'owned' | 'smoked' | 'wishlist';
type ViewMode = 'grid' | 'list';

function HumidorContent() {
  const { jwt } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('owned');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [humidorData, setHumidorData] = useState<any>({ owned: [], smoked: [], wishlist: [] });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  useEffect(() => {
    loadHumidor();
  }, []);

  const loadHumidor = async () => {
    try {
      setLoading(true);
      const data = await apiRequest('/api/humidor', { method: 'GET' }, jwt);
      console.log('[Humidor] Loaded data:', data);
      
      // Transform entries array to grouped object
      if (data.entries) {
        const grouped = {
          owned: data.entries.filter((e: any) => e.status === 'owned').map((e: any) => ({
            ...e,
            ...e.cigars,
            id: e.cigar_id,
            price_paid: e.purchase_price,
            quantity: e.quantity || 1,
            image: e.cigars?.image_url
          })),
          smoked: data.entries.filter((e: any) => e.status === 'smoked').map((e: any) => ({
            ...e,
            ...e.cigars,
            id: e.cigar_id,
            rating: e.rating,
            image: e.cigars?.image_url
          })),
          wishlist: data.entries.filter((e: any) => e.status === 'wishlist').map((e: any) => ({
            ...e,
            ...e.cigars,
            id: e.cigar_id,
            image: e.cigars?.image_url
          }))
        };
        setHumidorData(grouped);
      } else {
        setHumidorData(data);
      }
    } catch (error) {
      console.error('Failed to load humidor:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'owned' as TabType, label: 'OWNED', color: 'text-accentGreen' },
    { key: 'smoked' as TabType, label: 'LOGGED', color: 'text-accentGold' },
    { key: 'wishlist' as TabType, label: 'WISHLIST', color: 'text-accentRed' },
  ];

  const currentData = humidorData[activeTab] || [];
  const filteredData = searchQuery
    ? currentData.filter((item: any) =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentData;

  // Calculate stats
  const stats = {
    totalOwned: humidorData.owned?.reduce((sum: number, c: any) => sum + (c.quantity || 1), 0) || 0,
    totalSmoked: humidorData.smoked?.length || 0,
    avgRating: humidorData.smoked?.length > 0
      ? (humidorData.smoked.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / humidorData.smoked.length).toFixed(1)
      : 0,
  };

  const handleEditCigar = (item: any) => {
    setSelectedEntry(item);
    setShowEditModal(true);
  };

  return (
    <div className="min-h-screen bg-bgPrimary pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-bgPrimary border-b border-white/[0.08] z-40 pb-4">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-textPrimary" style={{ fontFamily: 'serif' }}>Humidor</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-surface2 text-accentGold' : 'text-textSecondary'}`}
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-surface2 text-accentGold' : 'text-textSecondary'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textTertiary" size={20} />
            <input
              type="text"
              placeholder="Search your collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface text-textPrimary pl-10 pr-4 py-3 rounded-lg border border-white/[0.08] focus:border-accentGold/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-3 text-center border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === tab.key ? 'var(--color-accentGold)' : 'transparent'
              }}
            >
              <div className={`font-semibold text-sm ${activeTab === tab.key ? tab.color : 'text-textSecondary'}`}>
                {tab.label}
              </div>
              <div className="text-textTertiary text-xs mt-1">
                {humidorData[tab.key]?.length || 0}
              </div>
            </button>
          ))}
        </div>
      </header>

      {/* Stats Widget (for owned tab) */}
      {activeTab === 'owned' && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <StatCard icon={Package} label="Cigars" value={stats.totalOwned} />
            <StatCard icon={Star} label="Logged" value={stats.totalSmoked} />
            <StatCard icon={Star} label="Avg Rating" value={stats.avgRating} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-6xl mx-auto px-6 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accentGold"></div>
          </div>
        ) : filteredData.length === 0 ? (
          <EmptyState 
            activeTab={activeTab} 
            searchQuery={searchQuery}
            onAddClick={() => setShowAddModal(true)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredData.map((item: any) => (
              <CigarCard key={item.id} item={item} viewMode="grid" onEdit={handleEditCigar} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map((item: any) => (
              <CigarCard key={item.id} item={item} viewMode="list" onEdit={handleEditCigar} />
            ))}
          </div>
        )}
      </main>

      {/* Add Cigar Modal */}
      <AddCigarModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadHumidor();
          setShowAddModal(false);
        }}
        defaultStatus={activeTab}
      />

      {/* Edit Cigar Modal */}
      <EditCigarModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEntry(null);
        }}
        onSuccess={() => {
          loadHumidor();
          setShowEditModal(false);
        }}
        onDelete={() => {
          loadHumidor();
          setShowEditModal(false);
        }}
        entry={selectedEntry}
      />

      <Navigation />
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-white/[0.08]">
      {Icon && (
        <div className="mb-2">
          <Icon size={20} className="text-accentGold" />
        </div>
      )}
      <div className="text-2xl font-bold text-textPrimary">{value}</div>
      <div className="text-textTertiary text-sm">{label}</div>
    </div>
  );
}

function CigarCard({ item, viewMode, onEdit }: { item: any; viewMode: ViewMode; onEdit: (item: any) => void }) {
  const isGrid = viewMode === 'grid';

  return (
    <div 
      onClick={() => onEdit(item)}
      className={`bg-surface rounded-xl p-4 border border-white/[0.08] cursor-pointer hover:border-accentGold/30 transition-colors ${isGrid ? '' : 'flex gap-4'}`}
    >
      {/* Image */}
      <img
        src={item.image || 'https://via.placeholder.com/150'}
        alt={item.name}
        className={`rounded-lg object-cover ${isGrid ? 'w-full h-32 mb-3' : 'w-20 h-20'}`}
      />

      <div className="flex-1">
        {/* Brand & Name */}
        <p className="text-textSecondary text-xs mb-1">{item.brand || 'Unknown Brand'}</p>
        <h3 className="text-textPrimary font-semibold mb-2 line-clamp-2">{item.name || 'Cigar'}</h3>

        {/* Rating */}
        {item.rating && (
          <div className="mb-2">
            <StarRating rating={item.rating} size={14} />
          </div>
        )}

        {/* Quantity/Price */}
        <div className="flex items-center justify-between text-xs">
          {item.quantity && (
            <span className="text-textTertiary">Qty: {item.quantity}</span>
          )}
          {item.price_paid && (
            <span className="text-accentGold">${item.price_paid}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ 
  activeTab, 
  searchQuery, 
  onAddClick 
}: { 
  activeTab: TabType; 
  searchQuery: string;
  onAddClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Package size={48} className="text-textTertiary mb-4" />
      <h3 className="text-textPrimary text-xl font-semibold mb-2">
        {searchQuery ? 'No matches found' : 'No cigars yet'}
      </h3>
      <p className="text-textSecondary text-center mb-6">
        {searchQuery
          ? 'Try adjusting your search terms'
          : activeTab === 'owned'
            ? 'Start adding cigars to your collection'
            : activeTab === 'wishlist'
              ? 'Add items you want to try someday'
              : 'No sessions recorded yet'}
      </p>
      {!searchQuery && (
        <button 
          onClick={onAddClick}
          className="bg-accentGold text-bgPrimary px-6 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-all"
        >
          Add Cigar
        </button>
      )}
    </div>
  );
}

