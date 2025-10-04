import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X } from "lucide-react";

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
  actividades?: string[] | null; // <-- ARRAY en DB
};

interface Props {
  room: Room;
  onClose: () => void;
  onSaved: () => void;
}

const toCSV = (arr?: string[] | null) => (arr && arr.length ? arr.join(", ") : "");
const parseCSV = (txt: string): string[] =>
  txt
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function RoomEditModal({ room, onClose, onSaved }: Props) {
  const [name, setName] = useState<string>(room.name ?? "");
  const [roomNumber, setRoomNumber] = useState<string>(room.room_number ?? "");
  const [description, setDescription] = useState<string>(room.description ?? "");
  const [capacity, setCapacity] = useState<string>(room.capacity != null ? String(room.capacity) : "");
  const [equipmentTxt, setEquipmentTxt] = useState<string>(toCSV(room.equipment));
  const [keywordsTxt, setKeywordsTxt] = useState<string>(toCSV(room.keywords));
  const [directions, setDirections] = useState<string>(room.directions ?? "");

  // 🔧 ahora usamos un string para el input, pero guardamos como string[]
  const [actividadesTxt, setActividadesTxt] = useState<string>(toCSV(room.actividades));

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(room.name ?? "");
    setRoomNumber(room.room_number ?? "");
    setDescription(room.description ?? "");
    setCapacity(room.capacity != null ? String(room.capacity) : "");
    setEquipmentTxt(toCSV(room.equipment));
    setKeywordsTxt(toCSV(room.keywords));
    setDirections(room.directions ?? "");
    setActividadesTxt(toCSV(room.actividades));
  }, [room]);

  const validCapacity = useMemo(() => {
    if (capacity.trim() === "") return null;
    const n = Number(capacity);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }, [capacity]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const actividadesArr = parseCSV(actividadesTxt);
      const update: any = {
        name: name.trim() || null,
        room_number: roomNumber.trim() || null,
        description: description.trim() || null,
        capacity: validCapacity,
        equipment: parseCSV(equipmentTxt),
        keywords: parseCSV(keywordsTxt),
        directions: directions.trim() || null,
        // ✅ guardar como array; si no hay nada, manda null
        actividades: actividadesArr.length ? actividadesArr : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("rooms").update(update).eq("id", room.id);
      if (error) throw error;
      toast.success("Habitación actualizada");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la habitación");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-[min(92vw,640px)] bg-card text-card-foreground rounded-xl shadow-2xl border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold">Editar habitación</h3>
        <button className="p-1 rounded hover:bg-accent" onClick={onClose} aria-label="Cerrar">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 grid gap-3">
        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Nombre</label>
          <input
            className="px-3 py-2 rounded border bg-background"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Dirección de Aseguramiento de la Calidad"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Número / Código</label>
          <input
            className="px-3 py-2 rounded border bg-background"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Ej: B-203"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Descripción</label>
          <textarea
            className="px-3 py-2 rounded border bg-background min-h-[72px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción breve"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Capacidad</label>
            <input
              className="px-3 py-2 rounded border bg-background"
              inputMode="numeric"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ej: 25"
            />
            {capacity && validCapacity === null && (
              <div className="text-[11px] text-red-600">Debe ser un número ≥ 0</div>
            )}
          </div>

          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground">Direcciones (cómo llegar)</label>
            <input
              className="px-3 py-2 rounded border bg-background"
              value={directions}
              onChange={(e) => setDirections(e.target.value)}
              placeholder="Ej: Está del lado izquierdo"
            />
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Equipamiento (separado por coma)</label>
          <input
            className="px-3 py-2 rounded border bg-background"
            value={equipmentTxt}
            onChange={(e) => setEquipmentTxt(e.target.value)}
            placeholder='Ej: Mesas, Sillas, Pantalla táctil'
          />
          <div className="text-[11px] text-muted-foreground">Se guardará como arreglo (text[]).</div>
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Keywords (separado por coma)</label>
          <input
            className="px-3 py-2 rounded border bg-background"
            value={keywordsTxt}
            onChange={(e) => setKeywordsTxt(e.target.value)}
            placeholder='Ej: dirección, aseguramiento, calidad'
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-muted-foreground">Actividades (separado por coma)</label>
          <textarea
            className="px-3 py-2 rounded border bg-background min-h-[72px]"
            value={actividadesTxt}
            onChange={(e) => setActividadesTxt(e.target.value)}
            placeholder="Procesos institucionales, Levantamiento de procesos, Normativas Institucionales, Acreditación"
          />
          <div className="text-[11px] text-muted-foreground">Se guardará como arreglo (text[]).</div>
        </div>
      </div>

      <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
        <button className="px-3 py-2 rounded border" onClick={onClose} disabled={saving}>
          Cancelar
        </button>
        <button
          className="px-3 py-2 rounded bg-primary text-primary-foreground disabled:opacity-50"
          onClick={handleSave}
          disabled={saving || (capacity.length > 0 && validCapacity === null)}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
