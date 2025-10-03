<<<<<<< HEAD
// src/pages/index.tsx
import PublicNavigator from "@/components/PublicNavigator";

export default function Index() {
  return <PublicNavigator />;
}
=======
import { useMemo, useState } from 'react';
import { Menu, MapPin, DoorOpen, Building2, Pencil, ParkingSquare, MapPinned, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import MapComponent, { MapClickCoords, EntranceType, LandmarkType } from '@/components/MapComponent';
import SearchPanel from '@/components/SearchPanel';
import BuildingForm from '@/components/BuildingForm';
import RoomForm from '@/components/RoomForm';
import RoomEditModal from '@/components/RoomEditModal';

type Building = {
  id: string;
  name: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  total_floors: number;
  building_code?: string | null;
};

type Room = {
  id: string;
  floor_id: string;
  room_type_id: string;
  name: string | null;
  room_number?: string | null;
  description?: string | null;
  capacity?: number | null;
  equipment?: string[] | null;
  keywords?: string[] | null;
  directions?: string | null;
  actividades?: string | null;
  // opcionalmente created_at / updated_at si los pasas desde SearchPanel
};

type SelectedLocation = MapClickCoords | Building | Room | null;

function isCoords(x: SelectedLocation): x is MapClickCoords {
  return !!x && typeof (x as any).latitude === 'number' && typeof (x as any).longitude === 'number' && !(x as any).id;
}
function isBuilding(x: SelectedLocation): x is Building {
  return !!x && typeof (x as any).id === 'string' && (x as any).latitude !== undefined && (x as any).longitude !== undefined && (x as any).total_floors !== undefined;
}
function isRoom(x: SelectedLocation): x is Room {
  return !!x && typeof (x as any).id === 'string' && (x as any).floor_id !== undefined && (x as any).room_type_id !== undefined && (x as any).total_floors === undefined;
}

type MapMode = "idle" | "footwayAB" | "entrance" | "parking" | "landmark";

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [clickedCoords, setClickedCoords] = useState<MapClickCoords | null>(null);

  // edición de room
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [showRoomEditModal, setShowRoomEditModal] = useState(false);

  const selectedBuildingId = useMemo(() => (isBuilding(selectedLocation) ? selectedLocation.id : null), [selectedLocation]);

  // controles del mapa
  const [mapMode, setMapMode] = useState<MapMode>("idle");
  const [entranceType, setEntranceType] = useState<EntranceType>("pedestrian");
  const [landmarkType] = useState<LandmarkType>("plazoleta");

  const handleLocationSelect = (location: any) => {
    // si viene un room desde SearchPanel => abre modal de edición
    if (isRoom(location)) {
      setEditingRoom(location);
      setShowRoomEditModal(true);
      if (window.innerWidth < 768) setShowSidebar(false);
      return;
    }

    // comportamiento previo para edificios/coords
    setSelectedLocation(location);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleBuildingAdded = () => setRefreshTrigger(prev => prev + 1);
  const handleRoomAdded = () => setRefreshTrigger(prev => prev + 1);
  const handleRoomUpdated = () => {
    // refresca lo que necesites (lista del SearchPanel si depende de supabase)…
    setRefreshTrigger(prev => prev + 1);
  };

  // toggle exclusivo para un solo modo activo
  const toggleMode = (next: MapMode) => {
    setMapMode((curr) => (curr === next ? "idle" : next));
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-primary text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">UNEMI Campus</h1>
              <p className="text-xs opacity-80">Universidad Estatal de Milagro</p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant={mapMode === "footwayAB" ? "default" : "secondary"}
              size="sm"
              onClick={() => { toggleMode("footwayAB"); }}
              title="Dibujar calle peatonal (A→B)"
              aria-pressed={mapMode === "footwayAB"}
            >
              <Pencil className="h-4 w-4 mr-2" /> Dibujar calle
            </Button>

            <Button
              variant={mapMode === "entrance" && entranceType === "pedestrian" ? "default" : "secondary"}
              size="sm"
              onClick={() => { setEntranceType("pedestrian"); toggleMode("entrance"); }}
              title="Marcar puerta peatonal"
              aria-pressed={mapMode === "entrance" && entranceType === "pedestrian"}
            >
              <DoorOpen className="h-4 w-4 mr-2" /> Puerta peatonal
            </Button>
            <Button
              variant={mapMode === "entrance" && entranceType === "vehicular" ? "default" : "secondary"}
              size="sm"
              onClick={() => { setEntranceType("vehicular"); toggleMode("entrance"); }}
              title="Marcar puerta vehicular"
              aria-pressed={mapMode === "entrance" && entranceType === "vehicular"}
            >
              <DoorOpen className="h-4 w-4 mr-2" /> Puerta vehicular
            </Button>
            <Button
              variant={mapMode === "entrance" && entranceType === "both" ? "default" : "secondary"}
              size="sm"
              onClick={() => { setEntranceType("both"); toggleMode("entrance"); }}
              title="Marcar puerta (ambas)"
              aria-pressed={mapMode === "entrance" && entranceType === "both"}
            >
              <DoorOpen className="h-4 w-4 mr-2" /> Puerta (ambas)
            </Button>

            <Button
              variant={mapMode === "parking" ? "default" : "secondary"}
              size="sm"
              onClick={() => { toggleMode("parking"); }}
              title="Marcar parqueadero"
              aria-pressed={mapMode === "parking"}
            >
              <ParkingSquare className="h-4 w-4 mr-2" /> Parqueadero
            </Button>

            <Button
              variant={mapMode === "landmark" ? "default" : "secondary"}
              size="sm"
              onClick={() => { toggleMode("landmark"); }}
              title="Crear punto de referencia"
              aria-pressed={mapMode === "landmark"}
            >
              <MapPinned className="h-4 w-4 mr-2" /> Referencia
            </Button>

            {/* Agregar edificio manual */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setClickedCoords(null); setShowBuildingForm(true); }}
              title="Agregar edificio"
            >
              <Plus className="h-4 w-4 mr-2" /> Agregar edificio
            </Button>

            <Button
              variant="secondary"
              size="sm"
              disabled={!selectedBuildingId}
              onClick={() => setShowRoomForm(true)}
            >
              <Building2 className="h-4 w-4 mr-2" /> Agregar Habitación
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex h-full pt-16">
        {/* Sidebar SCROLLEABLE */}
        <aside className={`absolute md:relative z-10 transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${showSidebar ? 'w-full md:w-96' : 'w-0 md:w-96'} h-full`}>
          <div className="h-full flex flex-col bg-background/95 backdrop-blur-sm border-r border-border/50">
            <div className="p-4 shrink-0 border-b border-border/50">
              {/* puedes poner filtros/buscador extra aquí si quieres */}
              <span className="text-sm text-muted-foreground">Buscar / Navegar</span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {/* Contenido scrolleable */}
              <SearchPanel onLocationSelect={handleLocationSelect} selectedLocation={selectedLocation} />
            </div>
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0">
            <MapComponent
              key={refreshTrigger}
              onLocationSelect={handleLocationSelect}
              isAdmin={true}
              externalMode={mapMode}
              entranceType={entranceType}
              landmarkType={landmarkType}
              onModeReset={() => setMapMode("idle")}
            />
          </div>

          {/* Overlay cerrar panel en móvil */}
          {showSidebar && (
            <div className="absolute inset-0 bg-black/20 md:hidden z-[5]" onClick={() => setShowSidebar(false)} />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 bg-primary text-primary-foreground">
        <div className="px-4 py-2 text-center">
          <p className="text-xs opacity-80">© 2025 Universidad Estatal de Milagro - Sistema de Navegación Campus</p>
        </div>
      </footer>

      {/* Tarjeta selección (mobile) */}
      {selectedLocation && !showSidebar && (
        <Card className="absolute bottom-16 left-4 right-4 z-20 md:hidden bg-card/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {isBuilding(selectedLocation) ? (
                  <>
                    <h3 className="font-semibold text-foreground">{selectedLocation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation.building_code ? `Código: ${selectedLocation.building_code} • ` : ''}
                      {selectedLocation.total_floors} {selectedLocation.total_floors === 1 ? 'piso' : 'pisos'}
                    </p>
                  </>
                ) : isCoords(selectedLocation) ? (
                  <>
                    <h3 className="font-semibold text-foreground">Ubicación seleccionada</h3>
                    <p className="text-sm text-muted-foreground">
                      Lat: {selectedLocation.latitude.toFixed(6)} · Lon: {selectedLocation.longitude.toFixed(6)}
                    </p>
                  </>
                ) : null}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSidebar(true)}>
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Agregar Edificio */}
      {showBuildingForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <BuildingForm
            onClose={() => setShowBuildingForm(false)}
            onBuildingAdded={handleBuildingAdded}
            initialCoords={clickedCoords}
          />
        </div>
      )}

      {/* Modal: Agregar Habitación */}
      {showRoomForm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <RoomForm
            onClose={() => setShowRoomForm(false)}
            onRoomAdded={handleRoomAdded}
            initialBuildingId={selectedBuildingId}
            initialFloorNumber={undefined}
          />
        </div>
      )}

      {/* Modal: Editar Habitación */}
      {showRoomEditModal && editingRoom && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <RoomEditModal
            room={editingRoom}
            onClose={() => { setShowRoomEditModal(false); setEditingRoom(null); }}
            onSaved={() => { setShowRoomEditModal(false); setEditingRoom(null); handleRoomUpdated(); }}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
>>>>>>> a2763d4 (Editar Room y scroll en barra)
