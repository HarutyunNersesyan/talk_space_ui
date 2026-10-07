// src/components/LocationPicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import './LocationPicker.css';

declare global {
    interface Window {
        google: any;
    }
}

interface LocationPickerProps {
    userName: string;
    onLocationSelect?: (location: {
        country: string;
        region: string;
        city: string;
        village: string;
        placeId: string;
        formattedAddress: string;
        lat: number;
        lng: number;
    }) => void;
    initialLocation?: {
        country: string;
        region: string;
        city: string;
        village: string;
        formattedAddress: string;
        lat?: number;
        lng?: number;
    };
}

const LocationPicker: React.FC<LocationPickerProps> = ({
                                                           userName,
                                                           onLocationSelect,
                                                           initialLocation
                                                       }) => {
    const [location, setLocation] = useState({
        country: initialLocation?.country || '',
        region: initialLocation?.region || '',
        city: initialLocation?.city || '',
        village: initialLocation?.village || '',
        formattedAddress: initialLocation?.formattedAddress || '',
        lat: initialLocation?.lat || 40.1792,
        lng: initialLocation?.lng || 44.4991,
        placeId: '',
    });

    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const autocompleteRef = useRef<any>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const isInitializedRef = useRef(false);

    // Google Maps-ի բեռնում
    useEffect(() => {
        const checkGoogleMaps = () => {
            if (window.google && window.google.maps && window.google.maps.places) {
                console.log('✅ Google Maps loaded successfully!');
                setIsGoogleLoaded(true);
                setError(null);
                return true;
            }
            return false;
        };

        if (checkGoogleMaps()) return;

        const interval = setInterval(() => {
            if (checkGoogleMaps()) {
                clearInterval(interval);
            }
        }, 500);

        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (!isGoogleLoaded) {
                setError('Google Maps failed to load. Please refresh the page.');
                console.error('❌ Google Maps load timeout');
            }
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    // Initialize map and autocomplete
    useEffect(() => {
        if (!isGoogleLoaded || !isEditing || isInitializedRef.current) return;

        console.log('🗺️ Initializing map and autocomplete...');

        const initMap = () => {
            try {
                if (!mapRef.current) {
                    console.error('❌ Map container not found');
                    return;
                }

                const defaultCenter = {
                    lat: location.lat || 40.1792,
                    lng: location.lng || 44.4991
                };

                const map = new window.google.maps.Map(mapRef.current, {
                    center: defaultCenter,
                    zoom: 12,
                    mapTypeId: 'roadmap',
                    gestureHandling: 'greedy',
                    zoomControl: true,
                    streetViewControl: true,
                    mapTypeControl: true,
                });

                const marker = new window.google.maps.Marker({
                    position: defaultCenter,
                    map: map,
                    draggable: true,
                    animation: window.google.maps.Animation.DROP,
                });

                marker.addListener('dragend', () => {
                    const position = marker.getPosition();
                    const lat = position.lat();
                    const lng = position.lng();

                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
                        if (status === 'OK' && results && results[0]) {
                            const place = results[0];
                            const addressComponents = place.address_components || [];
                            let country = '';
                            let region = '';
                            let city = '';
                            let village = '';

                            for (const component of addressComponents) {
                                const types = component.types;
                                if (types.includes('country')) country = component.long_name;
                                if (types.includes('administrative_area_level_1')) region = component.long_name;
                                if (types.includes('locality')) city = component.long_name;
                                if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                                    village = component.long_name;
                                }
                            }

                            const newLocation = {
                                country,
                                region,
                                city,
                                village,
                                formattedAddress: place.formatted_address || '',
                                lat,
                                lng,
                                placeId: place.place_id || '',
                            };

                            setLocation(newLocation);
                            setMapError(null);
                            if (inputRef.current) {
                                inputRef.current.value = place.formatted_address || '';
                            }
                            if (onLocationSelect) {
                                onLocationSelect(newLocation);
                            }
                        }
                    });
                });

                mapInstanceRef.current = map;
                markerRef.current = marker;

                setTimeout(() => {
                    window.google.maps.event.trigger(map, 'resize');
                    map.setCenter(defaultCenter);
                }, 200);

                console.log('✅ Map initialized!');

            } catch (err) {
                console.error('❌ Error initializing map:', err);
                setMapError('Failed to initialize map');
            }
        };

        const initAutocomplete = () => {
            try {
                if (!inputRef.current) {
                    console.error('❌ Input element not found');
                    return;
                }

                console.log('🔍 Initializing Autocomplete with Places API (New)...');

                const autocomplete = new window.google.maps.places.Autocomplete(
                    inputRef.current,
                    {
                        types: ['(regions)'],
                        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
                    }
                );

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    console.log('📍 Place selected:', place);

                    if (!place || !place.geometry) {
                        setMapError('Please select a valid place from the dropdown');
                        return;
                    }

                    const addressComponents = place.address_components || [];
                    let country = '';
                    let region = '';
                    let city = '';
                    let village = '';

                    for (const component of addressComponents) {
                        const types = component.types;
                        if (types.includes('country')) country = component.long_name;
                        if (types.includes('administrative_area_level_1')) region = component.long_name;
                        if (types.includes('locality')) city = component.long_name;
                        if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                            village = component.long_name;
                        }
                    }

                    const newLocation = {
                        country,
                        region,
                        city,
                        village,
                        formattedAddress: place.formatted_address || '',
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        placeId: place.place_id || '',
                    };

                    console.log('✅ Location parsed:', newLocation);
                    setLocation(newLocation);
                    setMapError(null);

                    if (mapInstanceRef.current && markerRef.current) {
                        const position = { lat: newLocation.lat, lng: newLocation.lng };
                        mapInstanceRef.current.setCenter(position);
                        markerRef.current.setPosition(position);
                        mapInstanceRef.current.setZoom(14);
                    }

                    if (onLocationSelect) {
                        onLocationSelect(newLocation);
                    }
                });

                autocompleteRef.current = autocomplete;
                console.log('✅ Autocomplete initialized with Places API (New)!');

            } catch (err) {
                console.error('❌ Error initializing autocomplete:', err);
                setMapError('Failed to initialize search');
            }
        };

        setTimeout(() => {
            initMap();
            initAutocomplete();
            isInitializedRef.current = true;
        }, 300);

        return () => {
            isInitializedRef.current = false;
        };
    }, [isGoogleLoaded, isEditing, location.lat, location.lng, onLocationSelect]);

    useEffect(() => {
        if (isEditing) {
            isInitializedRef.current = false;
        }
    }, [isEditing]);

    useEffect(() => {
        if (initialLocation) {
            setLocation({
                country: initialLocation.country || '',
                region: initialLocation.region || '',
                city: initialLocation.city || '',
                village: initialLocation.village || '',
                formattedAddress: initialLocation.formattedAddress || '',
                lat: initialLocation.lat || 40.1792,
                lng: initialLocation.lng || 44.4991,
                placeId: '',
            });
        }
    }, [initialLocation]);

    const formatLocationDisplay = () => {
        const parts = [];
        if (location.country) parts.push(location.country);
        if (location.region) parts.push(location.region);
        if (location.city) parts.push(location.city);
        if (location.village) parts.push(location.village);
        return parts.join(', ') || 'No location set';
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMapError(null);
        isInitializedRef.current = false;
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
    };

    const handleSave = async () => {
        if (!location.country || !location.region) {
            setMapError('Country and Region are required');
            return;
        }

        setIsSaving(true);
        try {
            if (onLocationSelect) {
                await onLocationSelect(location);
            }
            setIsEditing(false);
            setMapError(null);
        } catch (err) {
            setMapError('Failed to save location');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setMapError(null);
        if (initialLocation) {
            setLocation({
                country: initialLocation.country || '',
                region: initialLocation.region || '',
                city: initialLocation.city || '',
                village: initialLocation.village || '',
                formattedAddress: initialLocation.formattedAddress || '',
                lat: initialLocation.lat || 40.1792,
                lng: initialLocation.lng || 44.4991,
                placeId: '',
            });
        }
    };

    if (error) {
        return (
            <div className="location-picker-error">
                <p>⚠️ {error}</p>
                <button onClick={() => window.location.reload()}>🔄 Refresh Page</button>
            </div>
        );
    }

    return (
        <div className="location-picker">
            {!isEditing ? (
                <div className="location-view">
                    <div className="location-display">
                        <span className="location-label">📍 Location:</span>
                        <span className="location-value">{formatLocationDisplay()}</span>
                    </div>
                    <button className="location-edit-btn" onClick={handleEdit}>
                        {location.country ? '✏️ Edit Location' : '➕ Add Location'}
                    </button>
                </div>
            ) : (
                <div className="location-edit">
                    <div className="search-container">
                        <label className="search-label">Search for a place:</label>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a city, region, or address..."
                            className="location-search-input"
                            defaultValue={location.formattedAddress}
                            onFocus={() => setMapError(null)}
                        />
                        {mapError && <div className="map-error">{mapError}</div>}
                        <div
                            className="map-container"
                            ref={mapRef}
                            id="location-map"
                            style={{
                                width: '100%',
                                height: '300px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                minHeight: '300px'
                            }}
                        >
                            {!isGoogleLoaded && (
                                <div className="map-loading">
                                    <div>Loading map...</div>
                                    <div style={{ fontSize: '12px', marginTop: '8px', color: '#94a3b8' }}>
                                        Please wait...
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="location-details">
                            <div className="detail-row">
                                <span className="detail-label">🌍 Country:</span>
                                <span className="detail-value">{location.country || '—'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">📍 Region:</span>
                                <span className="detail-value">{location.region || '—'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">🏙️ City:</span>
                                <span className="detail-value">{location.city || '—'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">🏡 Village:</span>
                                <span className="detail-value">{location.village || '—'}</span>
                            </div>
                            <div className="detail-row full-width">
                                <span className="detail-label">📫 Address:</span>
                                <span className="detail-value">{location.formattedAddress || '—'}</span>
                            </div>
                            <div className="detail-row full-width">
                                <span className="detail-label">📍 Coordinates:</span>
                                <span className="detail-value">
                  {location.lat && location.lng ?
                      `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` :
                      '—'}
                </span>
                            </div>
                        </div>
                    </div>
                    <div className="location-actions">
                        <button
                            className="location-save-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? '💾 Saving...' : '💾 Save Location'}
                        </button>
                        <button className="location-cancel-btn" onClick={handleCancel}>
                            ❌ Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;