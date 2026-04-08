import { useEffect, useState, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native'
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps'
import { supabase } from '../lib/supabase'

type Place = {
  id: string
  name: string
  description: string | null
  address: string | null
  category: string | null
  website: string | null
  latitude: number
  longitude: number
}

type PendingPin = {
  lat: number
  lng: number
}

const CATEGORY_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  bar:       { color: '#a855f7', label: 'Bars',      emoji: '🍸' },
  café:      { color: '#f59e0b', label: 'Cafés',     emoji: '☕' },
  venue:     { color: '#06b6d4', label: 'Venues',    emoji: '🎵' },
  community: { color: '#22c55e', label: 'Community', emoji: '🏛' },
  shop:      { color: '#f97316', label: 'Shops',     emoji: '🛍' },
  place:     { color: '#6366f1', label: 'Places',    emoji: '📍' },
}

function categoryColor(cat: string | null): string {
  return CATEGORY_CONFIG[cat ?? 'place']?.color ?? '#6366f1'
}

export default function MapScreen() {
  const [places, setPlaces] = useState<Place[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState<PendingPin | null>(null)
  const [selected, setSelected] = useState<Place | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const initialRegion: Region = {
    latitude: 40.7001,
    longitude: -73.9507,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  }

  useEffect(() => {
    supabase
      .from('places')
      .select('id, name, description, address, category, website, latitude, longitude')
      .then(({ data }) => { if (data) setPlaces(data) })
  }, [])

  const categories = useMemo(() => {
    const seen = new Set<string>()
    places.forEach(p => seen.add(p.category ?? 'place'))
    return Array.from(seen).sort()
  }, [places])

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const visiblePlaces = activeFilters.size === 0
    ? places
    : places.filter(p => activeFilters.has(p.category ?? 'place'))

  const handleMapPress = (e: MapPressEvent) => {
    if (!adding) return
    const { latitude, longitude } = e.nativeEvent.coordinate
    setPending({ lat: latitude, lng: longitude })
    setAdding(false)
  }

  const savePlace = async () => {
    if (!pending || !name.trim()) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('places')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        latitude: pending.lat,
        longitude: pending.lng,
        created_by: user.id,
      })
      .select('id, name, description, address, category, website, latitude, longitude')
      .single()

    if (error) {
      Alert.alert('Error', error.message)
    } else if (data) {
      setPlaces(prev => [...prev, data])
    }

    setPending(null)
    setName('')
    setDescription('')
    setSaving(false)
  }

  const cancelPending = () => {
    setPending(null)
    setName('')
    setDescription('')
  }

  const selectedColor = categoryColor(selected?.category ?? null)

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={handleMapPress}
      >
        {visiblePlaces.map(place => {
          const color = categoryColor(place.category)
          const isSelected = selected?.id === place.id
          return (
            <Marker
              key={place.id}
              coordinate={{ latitude: place.latitude, longitude: place.longitude }}
              pinColor={color}
              onPress={() => {
                setSelected(place)
                setPending(null)
                setAdding(false)
              }}
            />
          )
        })}

        {pending && (
          <Marker
            coordinate={{ latitude: pending.lat, longitude: pending.lng }}
            pinColor="#f59e0b"
          />
        )}
      </MapView>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {categories.map(cat => {
              const cfg = CATEGORY_CONFIG[cat] ?? { color: '#6366f1', label: cat, emoji: '📍' }
              const active = activeFilters.has(cat)
              const count = places.filter(p => (p.category ?? 'place') === cat).length
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleFilter(cat)}
                  style={[
                    styles.chip,
                    active && { borderColor: cfg.color, backgroundColor: `${cfg.color}18` },
                  ]}
                >
                  <Text style={styles.chipEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.chipLabel, active && { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                  <View style={[styles.chipBadge, active && { backgroundColor: cfg.color }]}>
                    <Text style={[styles.chipBadgeText, active && { color: 'white' }]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {/* Add pin button */}
      {!pending && !selected && (
        <TouchableOpacity
          style={[styles.fab, adding && styles.fabCancel]}
          onPress={() => setAdding(v => !v)}
        >
          <Text style={styles.fabText}>
            {adding ? 'Tap the map to drop a pin' : '+ Pin a place'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Place detail panel */}
      {selected && !pending && (
        <View style={[styles.panel, { borderTopColor: selectedColor }]}>
          <View style={styles.panelHeader}>
            <View style={{ flex: 1 }}>
              {selected.category && (
                <Text style={[styles.panelCategory, { color: selectedColor }]}>
                  {CATEGORY_CONFIG[selected.category]?.emoji} {selected.category.toUpperCase()}
                </Text>
              )}
              <Text style={styles.panelTitle}>{selected.name}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>
          {selected.address ? (
            <Text style={styles.panelAddress}>{selected.address}</Text>
          ) : null}
          {selected.description ? (
            <Text style={styles.panelDescription}>{selected.description}</Text>
          ) : null}
          {selected.website ? (
            <Text style={[styles.panelWebsite, { color: selectedColor }]}>
              {selected.website} →
            </Text>
          ) : null}
        </View>
      )}

      {/* Name form modal */}
      <Modal visible={!!pending} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name this place</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Best coffee in the neighborhood"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Description (optional)"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={cancelPending}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
                onPress={savePlace}
                disabled={!name.trim() || saving}
              >
                <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save place'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  filtersWrapper: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  chipBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  chipBadgeText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  fab: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabCancel: { backgroundColor: '#ef4444' },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  panel: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  panelCategory: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  panelTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeButton: { fontSize: 22, color: '#9ca3af', lineHeight: 24 },
  panelAddress: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
  panelDescription: { fontSize: 14, color: '#6b7280', lineHeight: 20, marginTop: 8 },
  panelWebsite: { fontSize: 13, marginTop: 10 },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  modalTextarea: { minHeight: 72, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, color: '#374151' },
  saveButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: '#e5e7eb' },
  saveButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
})
