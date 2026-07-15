import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  ShieldAlert, 
  Navigation, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  CheckSquare, 
  Phone, 
  Shield, 
  Sliders, 
  LogOut, 
  Compass, 
  Smartphone,
  Database,
  Lock,
  Mail,
  Trash2,
  Plus
} from 'lucide-react';
import { supabase } from './supabaseClient';
import './App.css';

// --- DATA SEED BAWAAN / FALLBACK (MOCK DATA) ---
const INITIAL_EVENT = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Bandung Rideout: KumpulRoda Klub Motor',
  event_date: '2026-07-18T06:00:00+07:00',
  time_label: '06.00 WIB - Selesai',
  meeting_point: 'SPBU Pertamina Pasti Pas, MT Haryono Jakarta',
  road_captain: 'Roni (Honda ADV 160)',
  sweeper: 'Dani (Vespa Sprint 150)',
  rules_text: [
    'Wajib menggunakan helm Fullface/Halfface ber-SNI.',
    'Dilarang mendahului Road Captain (RC) dalam kondisi apa pun.',
    'Menjaga jarak aman minimal 3-5 meter dengan motor di depan.',
    'Nyalakan lampu utama (headlight) sepanjang jalan untuk keselamatan.',
    'Gunakan isyarat tangan (hand signal) standar kelompok konvoi.',
    'Jika terjadi kendala darurat, segera tepikan motor dan tekan tombol SOS.'
  ],
  map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1014169.6468798369!2d107.03975765!3d-6.818361099999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e63982460773%3A0x146ad5022e43965!2sGedung%20Sate!5e0!3m2!1sid!2sid!4v1720970000000!5m2!1sid!2sid',
  map_destination_lat: -6.902481,
  map_destination_lng: 107.618784,
  contacts: {
    mekanik: { name: 'Pak Eko (Mekanik)', whatsapp: '6281234567890' },
    sweeper: { name: 'Dani (Sweeper)', whatsapp: '6281298765432' }
  }
};

const INITIAL_PARTICIPANTS = [
  { id: 'p1', name: 'Budi Hartono', whatsapp: '628111111111', motor_type: 'Honda ADV 160', ride_status: 'solo', bike_ready: true, check_ins: { 'cp-1': '2026-07-18T08:12:00Z' } },
  { id: 'p2', name: 'Sari Wulandari', whatsapp: '628122222222', motor_type: 'Yamaha Xabre', ride_status: 'boncengan', bike_ready: false, check_ins: {} },
  { id: 'p3', name: 'Rian Hidayat', whatsapp: '628133333333', motor_type: 'Kawasaki Ninja 250', ride_status: 'solo', bike_ready: true, check_ins: { 'cp-1': '2026-07-18T08:05:00Z' } },
  { id: 'p4', name: 'Agus Setiawan', whatsapp: '628144444444', motor_type: 'Yamaha NMax', ride_status: 'boncengan', bike_ready: true, check_ins: {} },
  { id: 'p5', name: 'Denny Pratama', whatsapp: '628155555555', motor_type: 'Honda PCX 160', ride_status: 'solo', bike_ready: false, check_ins: {} }
];

const INITIAL_CHECKPOINTS = [
  { id: 'cp-1', name: 'Checkpoint 1: Rest Area KM 57 Cikampek', latitude: -6.377668, longitude: 107.299596, radius_m: 200 },
  { id: 'cp-2', name: 'Checkpoint 2: Kopi Nurul Padalarang', latitude: -6.840248, longitude: 107.472132, radius_m: 200 }
];

const INITIAL_RUNDOWN = [
  { id: 'rd-1', time: '06.00', title: 'Kumpul & Briefing', desc: 'SPBU Pertamina Pasti Pas, MT Haryono Jakarta' },
  { id: 'rd-2', time: '06.30', title: 'Keberangkatan (Departure)', desc: 'Konvoi dipimpin oleh Road Captain menuju KM 57' },
  { id: 'rd-3', time: '08.00', title: 'Checkpoint 1 (Rest Area KM 57)', desc: 'Istirahat, isi bahan bakar, dan verifikasi check-in' },
  { id: 'rd-4', time: '08.30', title: 'Perjalanan Sesi 2', desc: 'Melanjutkan perjalanan via Purwakarta ke Padalarang' },
  { id: 'rd-5', time: '10.30', title: 'Checkpoint 2 (Kopi Nurul Padalarang)', desc: 'Coffee break & regroup barisan konvoi' },
  { id: 'rd-6', time: '12.00', title: 'Finish & Lunch (Gedung Sate)', desc: 'Tiba di destinasi Bandung, foto bersama, & makan siang' }
];

// --- RUMUS HAVERSINE (GEO-FENCING) ---
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // meter
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function App() {
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_ANON_KEY !== 'your-anonymous-anon-key-here';

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // SOS State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sosContact, setSosContact] = useState('mekanik');
  
  // Geolocation & Mock GPS States
  const [gpsCoords, setGpsCoords] = useState({ lat: -6.2425, lng: 106.8622 });
  const [isMockGps, setIsMockGps] = useState(true); 
  const [gpsStatusText, setGpsStatusText] = useState('Simulasi Aktif');
  
  // Admin Navigation / Views
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState('manifest'); // 'manifest' | 'settings'
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Event Details, Checkpoints & Rundown States
  const [eventDetails, setEventDetails] = useState(INITIAL_EVENT);
  const [checkpointsList, setCheckpointsList] = useState(INITIAL_CHECKPOINTS);
  const [rundownList, setRundownList] = useState(INITIAL_RUNDOWN);

  // Global Sync States
  const [participants, setParticipants] = useState([]);
  const [myRsvp, setMyRsvp] = useState(null);
  const [myChecklist, setMyChecklist] = useState({
    tires_ok: false,
    brakes_ok: false,
    lights_ok: false,
    fluids_ok: false,
    documents_ok: false
  });
  const [myCheckIns, setMyCheckIns] = useState({});

  // RSVP Form States
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpWa, setRsvpWa] = useState('');
  const [rsvpMotor, setRsvpMotor] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState('solo');
  const [formError, setFormError] = useState('');

  // --- GMAPS INPUT PARSER FUNCTION ---
  const parseGmapsInput = (input) => {
    if (!input) return null;
    const cleanInput = input.trim();

    // Pola A: Raw koordinat "lat, lng" (misal: -6.902481, 107.618784)
    const rawCoordsPattern = /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/;
    const rawMatch = cleanInput.match(rawCoordsPattern);
    if (rawMatch) {
      return {
        lat: parseFloat(rawMatch[1]),
        lng: parseFloat(rawMatch[2])
      };
    }

    // Pola B: URL Google Maps (cek !3d...!4d koordinat pin dulu baru fallback ke viewport @lat,lng)
    const patternPin = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
    const patternQuery = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const patternViewport = /@(-?\d+\.\d+),(-?\d+\.\d+)/;

    const urlMatch = cleanInput.match(patternPin) || cleanInput.match(patternQuery) || cleanInput.match(patternViewport);
    if (urlMatch) {
      return {
        lat: parseFloat(urlMatch[1]),
        lng: parseFloat(urlMatch[2])
      };
    }

    return null;
  };

  // --- EDIT EVENT & CHECKPOINT FIELDS (ADMIN) ---
  const [editEventName, setEditEventName] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editMeetingPoint, setEditMeetingPoint] = useState('');
  const [editRoadCaptain, setEditRoadCaptain] = useState('');
  const [editSweeper, setEditSweeper] = useState('');
  const [editMapUrl, setEditMapUrl] = useState('');
  
  const [editMekanikName, setEditMekanikName] = useState('');
  const [editMekanikWa, setEditMekanikWa] = useState('');
  const [editSweeperName, setEditSweeperName] = useState('');
  const [editSweeperWa, setEditSweeperWa] = useState('');
  
  // Single text inputs for Google Maps URL or raw coordinates
  const [editDestGmapsInput, setEditDestGmapsInput] = useState('');
  const [parsedDestCoords, setParsedDestCoords] = useState(null);
  const [isUnshorteningDest, setIsUnshorteningDest] = useState(false);

  const [newCpName, setNewCpName] = useState('');
  const [newCpGmapsInput, setNewCpGmapsInput] = useState('');
  const [parsedCpCoords, setParsedCpCoords] = useState(null);
  const [isUnshorteningCp, setIsUnshorteningCp] = useState(false);
  
  const [newCpRadius, setNewCpRadius] = useState('200');
  const [settingsError, setSettingsError] = useState('');
  const [checkpointError, setCheckpointError] = useState('');

  // Rundown Form States
  const [newRdTime, setNewRdTime] = useState('');
  const [newRdTitle, setNewRdTitle] = useState('');
  const [newRdDesc, setNewRdDesc] = useState('');
  const [rundownError, setRundownError] = useState('');

  // Editing state for rundown
  const [editingRdId, setEditingRdId] = useState(null);
  const [editRdTime, setEditRdTime] = useState('');
  const [editRdTitle, setEditRdTitle] = useState('');
  const [editRdDesc, setEditRdDesc] = useState('');

  // Resolves short maps.app.goo.gl redirects
  const resolveShortUrl = async (shortUrl, type) => {
    const setUnshortening = type === 'event' ? setIsUnshorteningDest : setIsUnshorteningCp;
    const setCoords = type === 'event' ? setParsedDestCoords : setParsedCpCoords;
    const setError = type === 'event' ? setSettingsError : setCheckpointError;

    setUnshortening(true);
    setError('');

    try {
      const response = await fetch(`https://unshorten.me/json/${encodeURIComponent(shortUrl)}`);
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();

      if (data.success && data.resolved_url) {
        const coords = parseGmapsInput(data.resolved_url);
        if (coords) {
          setCoords(coords);
          setError('');
          setUnshortening(false);
          return;
        }
      }
      throw new Error('Unresolved');
    } catch (err) {
      console.warn('Gagal mengurai link singkat:', err);
      setError('Gagal mengurai link singkat Google Maps secara otomatis. Silakan gunakan link panjang dari browser (google.com/maps/place/...) atau koordinat manual.');
      setCoords(null);
    } finally {
      setUnshortening(false);
    }
  };

  // Automatically update parsed destination coordinates on input change
  const handleDestGmapsChange = async (val) => {
    setEditDestGmapsInput(val);
    if (val.includes('maps.app.goo.gl')) {
      await resolveShortUrl(val, 'event');
    } else {
      setParsedDestCoords(parseGmapsInput(val));
    }
  };

  // Automatically update parsed checkpoint coordinates on input change
  const handleCpGmapsChange = async (val) => {
    setNewCpGmapsInput(val);
    if (val.includes('maps.app.goo.gl')) {
      await resolveShortUrl(val, 'checkpoint');
    } else {
      setParsedCpCoords(parseGmapsInput(val));
    }
  };

  // Sync edit forms fields when eventDetails is loaded
  useEffect(() => {
    if (eventDetails) {
      setEditEventName(eventDetails.name || '');
      // Format ISO string to display in datetime-local if necessary, or keep as string
      setEditEventDate(eventDetails.event_date ? eventDetails.event_date.substring(0, 16) : '');
      setEditEventTime(eventDetails.time_label || '');
      setEditMeetingPoint(eventDetails.meeting_point || '');
      setEditRoadCaptain(eventDetails.road_captain || '');
      setEditSweeper(eventDetails.sweeper || '');
      setEditMapUrl(eventDetails.map_embed_url || '');
      
      const c = eventDetails.contacts || INITIAL_EVENT.contacts;
      setEditMekanikName(c?.mekanik?.name || '');
      setEditMekanikWa(c?.mekanik?.whatsapp || '');
      setEditSweeperName(c?.sweeper?.name || '');
      setEditSweeperWa(c?.sweeper?.whatsapp || '');
      
      const lat = eventDetails.map_destination_lat;
      const lng = eventDetails.map_destination_lng;
      if (lat && lng) {
        setEditDestGmapsInput(`${lat}, ${lng}`);
        setParsedDestCoords({ lat, lng });
      } else {
        setEditDestGmapsInput('');
        setParsedDestCoords(null);
      }
    }
  }, [eventDetails]);

  // --- INITIAL DATA FETCH & SUPABASE AUTH SESSION ---
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAdminLoggedIn(!!session);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdminLoggedIn(!!session);
      });

      fetchDataFromSupabase();
    } else {
      loadFromLocalStorage();
    }
  }, [isSupabaseConfigured]);

  // --- REAL-TIME DATABASE LISTENERS ---
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const realtimeChannel = supabase
      .channel('kumpulroda-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => fetchDataFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bike_checklists' }, () => fetchDataFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins' }, () => fetchDataFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchDataFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkpoints' }, () => fetchDataFromSupabase())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rundown_items' }, () => fetchDataFromSupabase())
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [isSupabaseConfigured]);

  // --- GEOLOCATION WATCHER FOR REAL GPS ---
  useEffect(() => {
    if (isMockGps) {
      setGpsStatusText('Simulasi Aktif (Mock GPS)');
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatusText('GPS tidak didukung oleh browser ini');
      return;
    }

    setGpsStatusText('Mencari sinyal GPS...');

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        setGpsStatusText('GPS Aktif (Real-time)');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsStatusText('Akses GPS Ditolak');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsStatusText('Lokasi tidak tersedia');
            break;
          case error.TIMEOUT:
            setGpsStatusText('Waktu permintaan habis');
            break;
          default:
            setGpsStatusText('GPS Error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isMockGps]);

  // Fetch all state from Supabase
  const fetchDataFromSupabase = async () => {
    try {
      // 1. Fetch Event Details (first event in table, fallback to initial ID if empty)
      let currentEvent = null;
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .limit(1);

      if (eventError) {
        console.warn('Gagal memuat event dari DB:', eventError.message);
      } else if (eventData && eventData.length > 0) {
        currentEvent = eventData[0];
        setEventDetails(currentEvent);
      } else {
        // If empty, insert the initial event row so the database has it!
        const cleanInitialEvent = {
          id: INITIAL_EVENT.id,
          name: INITIAL_EVENT.name,
          event_date: INITIAL_EVENT.event_date,
          meeting_point: INITIAL_EVENT.meeting_point,
          road_captain: INITIAL_EVENT.road_captain,
          sweeper: INITIAL_EVENT.sweeper,
          rules_text: INITIAL_EVENT.rules_text,
          map_embed_url: INITIAL_EVENT.map_embed_url,
          map_destination_lat: INITIAL_EVENT.map_destination_lat,
          map_destination_lng: INITIAL_EVENT.map_destination_lng
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('events')
          .insert([cleanInitialEvent])
          .select();
        
        if (!insertError && insertedData && insertedData.length > 0) {
          currentEvent = insertedData[0];
          setEventDetails(currentEvent);
        } else {
          console.error('Gagal memasukkan seed event ke DB:', insertError);
        }
      }

      const activeEventId = currentEvent ? currentEvent.id : INITIAL_EVENT.id;

      // 2. Fetch Checkpoints
      const { data: cpData, error: cpError } = await supabase
        .from('checkpoints')
        .select('*')
        .eq('event_id', activeEventId)
        .order('sort_order', { ascending: true });

      if (cpError) {
        console.warn('Gagal memuat checkpoints:', cpError.message);
      } else if (cpData) {
        setCheckpointsList(cpData);
      }

      // 3. Fetch Rundown Items
      const { data: rdData, error: rdError } = await supabase
        .from('rundown_items')
        .select('*')
        .eq('event_id', activeEventId)
        .order('sort_order', { ascending: true });

      if (rdError) {
        console.warn('Gagal memuat rundown items:', rdError.message);
      } else if (rdData && rdData.length > 0) {
        setRundownList(rdData.map(item => ({
          id: item.id,
          time: item.time_label,
          title: item.title,
          desc: item.description
        })));
      } else {
        // Auto-seed rundown items if empty
        const cleanInitialRundown = INITIAL_RUNDOWN.map((item, idx) => ({
          event_id: activeEventId,
          time_label: item.time,
          title: item.title,
          description: item.desc,
          sort_order: idx + 1
        }));
        const { data: insertedRd, error: rdInsertError } = await supabase
          .from('rundown_items')
          .insert(cleanInitialRundown)
          .select();
        if (!rdInsertError && insertedRd) {
          setRundownList(insertedRd.map(item => ({
            id: item.id,
            time: item.time_label,
            title: item.title,
            desc: item.description
          })));
        }
      }

      // 4. Fetch Participants with checklists
      const { data: participantsData, error: pError } = await supabase
        .from('participants')
        .select(`
          *,
          bike_checklists (
            tires_ok, brakes_ok, lights_ok, fluids_ok, documents_ok
          )
        `)
        .eq('event_id', activeEventId)
        .order('created_at', { ascending: true });

      if (pError) throw pError;

      // 5. Fetch Check-ins
      const { data: checkinsData, error: cError } = await supabase
        .from('check_ins')
        .select('*');

      if (cError) throw cError;

      // 6. Map check-ins to participants in-memory
      const mappedParticipants = participantsData.map(p => {
        const pCheckins = {};
        checkinsData
          .filter(ci => ci.participant_id === p.id)
          .forEach(ci => {
            pCheckins[ci.checkpoint_id] = ci.checked_in_at;
          });

        return {
          id: p.id,
          name: p.name,
          whatsapp: p.whatsapp,
          motor_type: p.motor_type,
          ride_status: p.ride_status,
          bike_ready: p.bike_ready,
          check_ins: pCheckins
        };
      });

      setParticipants(mappedParticipants);

      // 7. Find current user's RSVP from LocalStorage ID
      const storedRsvpId = localStorage.getItem('kr_my_rsvp_id');
      if (storedRsvpId) {
        const foundUser = mappedParticipants.find(p => p.id === storedRsvpId);
        if (foundUser) {
          setMyRsvp({
            id: foundUser.id,
            name: foundUser.name,
            whatsapp: foundUser.whatsapp,
            motor_type: foundUser.motor_type,
            ride_status: foundUser.ride_status,
            bike_ready: foundUser.bike_ready
          });

          const rawChecklist = participantsData.find(p => p.id === storedRsvpId)?.bike_checklists;
          if (rawChecklist) {
            const checklistObj = Array.isArray(rawChecklist) ? rawChecklist[0] : rawChecklist;
            if (checklistObj) {
              setMyChecklist({
                tires_ok: checklistObj.tires_ok,
                brakes_ok: checklistObj.brakes_ok,
                lights_ok: checklistObj.lights_ok,
                fluids_ok: checklistObj.fluids_ok,
                documents_ok: checklistObj.documents_ok
              });
            }
          }
          setMyCheckIns(foundUser.check_ins || {});
        } else {
          localStorage.removeItem('kr_my_rsvp_id');
          setMyRsvp(null);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dari Supabase:', err);
    }
  };

  // LocalStorage Fallback loader
  const loadFromLocalStorage = () => {
    // Event Details
    const storedEvent = localStorage.getItem('kr_eventDetails');
    if (storedEvent) {
      setEventDetails(JSON.parse(storedEvent));
    } else {
      localStorage.setItem('kr_eventDetails', JSON.stringify(INITIAL_EVENT));
      setEventDetails(INITIAL_EVENT);
    }

    // Checkpoints
    const storedCps = localStorage.getItem('kr_checkpointsList');
    if (storedCps) {
      const parsed = JSON.parse(storedCps);
      const sanitized = parsed.map((item, idx) => ({
        ...item,
        id: item.id || `cp-${idx + 1}`
      }));
      setCheckpointsList(sanitized);
    } else {
      localStorage.setItem('kr_checkpointsList', JSON.stringify(INITIAL_CHECKPOINTS));
      setCheckpointsList(INITIAL_CHECKPOINTS);
    }

    // Rundown
    const storedRundown = localStorage.getItem('kr_rundownList');
    if (storedRundown) {
      const parsed = JSON.parse(storedRundown);
      const sanitized = parsed.map((item, idx) => ({
        ...item,
        id: item.id || `rd-${idx + 1}`
      }));
      setRundownList(sanitized);
    } else {
      localStorage.setItem('kr_rundownList', JSON.stringify(INITIAL_RUNDOWN));
      setRundownList(INITIAL_RUNDOWN);
    }

    // Participants
    const storedParticipants = localStorage.getItem('kr_participants');
    if (storedParticipants) {
      setParticipants(JSON.parse(storedParticipants));
    } else {
      localStorage.setItem('kr_participants', JSON.stringify(INITIAL_PARTICIPANTS));
      setParticipants(INITIAL_PARTICIPANTS);
    }

    const storedMyRsvp = localStorage.getItem('kr_my_rsvp');
    if (storedMyRsvp) {
      const parsedRsvp = JSON.parse(storedMyRsvp);
      setMyRsvp(parsedRsvp);
      setRsvpName(parsedRsvp.name);
      setRsvpWa(parsedRsvp.whatsapp);
      setRsvpMotor(parsedRsvp.motor_type);
      setRsvpStatus(parsedRsvp.ride_status);
    }

    const storedMyChecklist = localStorage.getItem('kr_my_checklist');
    if (storedMyChecklist) {
      setMyChecklist(JSON.parse(storedMyChecklist));
    }

    const storedMyCheckIns = localStorage.getItem('kr_my_checkins');
    if (storedMyCheckIns) {
      setMyCheckIns(JSON.parse(storedMyCheckIns));
    }
  };

  // Aggregated Counters
  const totalMotor = participants.length;
  const totalRider = totalMotor; // 1 rider per motor
  const totalBoncenger = participants.filter(p => p.ride_status === 'boncengan').length;
  const totalKepala = totalRider + totalBoncenger;

  // Get Map Embed URL (automatically generates a directions route passing through checkpoints in order to the destination coordinates if default or empty)
  const getMapEmbedUrl = () => {
    const embedUrl = eventDetails.map_embed_url;
    const isDefaultOrEmpty = 
      !embedUrl || 
      embedUrl.trim() === '' || 
      embedUrl.trim() === '/' ||
      !embedUrl.trim().startsWith('http') ||
      embedUrl.trim() === 'https://www.google.com/maps/embed?pb=...' ||
      embedUrl.includes('Gedung%20Sate') ||
      embedUrl.includes('Gedung Sate');
    
    if (isDefaultOrEmpty) {
      let daddr = '';
      if (checkpointsList && checkpointsList.length > 0) {
        const cpRoute = checkpointsList.map(cp => `${cp.latitude},${cp.longitude}`).join('+to:');
        daddr = `${cpRoute}+to:${eventDetails.map_destination_lat},${eventDetails.map_destination_lng}`;
      } else {
        daddr = `${eventDetails.map_destination_lat},${eventDetails.map_destination_lng}`;
      }
      return `https://maps.google.com/maps?saddr=${encodeURIComponent(eventDetails.meeting_point || '')}&daddr=${daddr}&output=embed`;
    }
    return embedUrl;
  };

  // Get dynamic Google Maps navigation URL with all active checkpoints as waypoints
  const getNavigationUrl = () => {
    const base = "https://www.google.com/maps/dir/?api=1";
    const origin = "origin=My+Location";
    const dest = `destination=${eventDetails.map_destination_lat},${eventDetails.map_destination_lng}`;
    
    if (checkpointsList && checkpointsList.length > 0) {
      const waypointsVal = checkpointsList
        .map(cp => `${cp.latitude},${cp.longitude}`)
        .join('|');
      return `${base}&${origin}&${dest}&waypoints=${encodeURIComponent(waypointsVal)}`;
    }
    
    return `${base}&${origin}&${dest}`;
  };

  // --- ACTIONS ---

  // Handle RSVP Submit
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    if (!rsvpName.trim() || !rsvpWa.trim() || !rsvpMotor.trim()) {
      setFormError('Semua kolom wajib diisi.');
      setLoading(false);
      return;
    }

    const cleanWa = rsvpWa.replace(/\D/g, '');
    if (cleanWa.length < 9) {
      setFormError('Nomor WhatsApp tidak valid.');
      setLoading(false);
      return;
    }

    let formattedWa = cleanWa;
    if (formattedWa.startsWith('0')) {
      formattedWa = '62' + formattedWa.substring(1);
    } else if (!formattedWa.startsWith('62')) {
      formattedWa = '62' + formattedWa;
    }

    if (isSupabaseConfigured) {
      try {
        if (myRsvp) {
          // UPDATE
          const { error } = await supabase
            .from('participants')
            .update({
              name: rsvpName.trim(),
              whatsapp: formattedWa,
              motor_type: rsvpMotor.trim(),
              ride_status: rsvpStatus
            })
            .eq('id', myRsvp.id);

          if (error) throw error;
        } else {
          // INSERT
          const { data, error } = await supabase
            .from('participants')
            .insert([{
              event_id: eventDetails.id,
              name: rsvpName.trim(),
              whatsapp: formattedWa,
              motor_type: rsvpMotor.trim(),
              ride_status: rsvpStatus
            }])
            .select();

          if (error) throw error;
          
          if (data && data[0]) {
            localStorage.setItem('kr_my_rsvp_id', data[0].id);
          }
        }
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        setFormError('Gagal menyambung ke server database.');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      const updatedRsvp = {
        id: myRsvp?.id || 'user-' + Date.now(),
        name: rsvpName.trim(),
        whatsapp: formattedWa,
        motor_type: rsvpMotor.trim(),
        ride_status: rsvpStatus,
        bike_ready: myRsvp ? myRsvp.bike_ready : false
      };

      localStorage.setItem('kr_my_rsvp', JSON.stringify(updatedRsvp));
      setMyRsvp(updatedRsvp);

      let updatedList = [];
      if (myRsvp) {
        updatedList = participants.map(p => p.id === myRsvp.id ? { ...p, ...updatedRsvp } : p);
      } else {
        updatedList = [...participants, updatedRsvp];
      }
      localStorage.setItem('kr_participants', JSON.stringify(updatedList));
      setParticipants(updatedList);
      setLoading(false);
    }
  };

  // Cancel RSVP
  const handleRsvpCancel = async () => {
    if (!myRsvp) return;

    const confirmCancel = window.confirm('Apakah Anda yakin ingin membatalkan RSVP?');
    if (!confirmCancel) return;

    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('participants')
          .delete()
          .eq('id', myRsvp.id);

        if (error) throw error;

        localStorage.removeItem('kr_my_rsvp_id');
        setMyRsvp(null);
        setMyChecklist({
          tires_ok: false,
          brakes_ok: false,
          lights_ok: false,
          fluids_ok: false,
          documents_ok: false
        });
        setMyCheckIns({});
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        alert('Gagal membatalkan pendaftaran.');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      const updatedList = participants.filter(p => p.id !== myRsvp.id);
      localStorage.setItem('kr_participants', JSON.stringify(updatedList));
      setParticipants(updatedList);

      localStorage.removeItem('kr_my_rsvp');
      localStorage.removeItem('kr_my_checklist');
      localStorage.removeItem('kr_my_checkins');
      
      setMyRsvp(null);
      setMyChecklist({
        tires_ok: false,
        brakes_ok: false,
        lights_ok: false,
        fluids_ok: false,
        documents_ok: false
      });
      setMyCheckIns({});
      setLoading(false);
    }

    setRsvpName('');
    setRsvpWa('');
    setRsvpMotor('');
    setRsvpStatus('solo');
  };

  // Toggle Checklist
  const handleChecklistToggle = async (item) => {
    if (!myRsvp) return;

    const updatedChecklist = {
      ...myChecklist,
      [item]: !myChecklist[item]
    };
    
    setMyChecklist(updatedChecklist);

    const allChecked = Object.values(updatedChecklist).every(val => val === true);

    if (isSupabaseConfigured) {
      try {
        const { error: checkError } = await supabase
          .from('bike_checklists')
          .update({
            [item]: updatedChecklist[item],
            updated_at: new Date().toISOString()
          })
          .eq('participant_id', myRsvp.id);

        if (checkError) throw checkError;

        const { error: partError } = await supabase
          .from('participants')
          .update({ bike_ready: allChecked })
          .eq('id', myRsvp.id);

        if (partError) throw partError;

        await fetchDataFromSupabase();
      } catch (err) {
        console.error('Gagal memperbarui checklist di Supabase:', err);
      }
    } else {
      // Fallback
      localStorage.setItem('kr_my_checklist', JSON.stringify(updatedChecklist));
      const updatedRsvp = { ...myRsvp, bike_ready: allChecked };
      setMyRsvp(updatedRsvp);
      localStorage.setItem('kr_my_rsvp', JSON.stringify(updatedRsvp));

      const updatedList = participants.map(p => p.id === myRsvp.id ? { ...p, bike_ready: allChecked } : p);
      setParticipants(updatedList);
      localStorage.setItem('kr_participants', JSON.stringify(updatedList));
    }
  };

  // Handle Check-in Action
  const handleCheckIn = async (checkpointId) => {
    if (!myRsvp) return;

    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('check_ins')
          .insert([{
            participant_id: myRsvp.id,
            checkpoint_id: checkpointId,
            latitude: gpsCoords.lat,
            longitude: gpsCoords.lng
          }]);

        if (error) {
          if (error.code === '23505') {
            alert('Anda sudah melakukan check-in di checkpoint ini!');
          } else {
            throw error;
          }
        } else {
          alert('Check-in Berhasil!');
        }
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        alert('Gagal mengirim check-in. Pastikan koneksi internet stabil.');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      const updatedCheckIns = { ...myCheckIns, [checkpointId]: timestamp };
      setMyCheckIns(updatedCheckIns);
      localStorage.setItem('kr_my_checkins', JSON.stringify(updatedCheckIns));

      const updatedList = participants.map(p => {
        if (p.id === myRsvp.id) {
          return {
            ...p,
            check_ins: { ...(p.check_ins || {}), [checkpointId]: timestamp }
          };
        }
        return p;
      });
      setParticipants(updatedList);
      localStorage.setItem('kr_participants', JSON.stringify(updatedList));
      alert('Check-in Berhasil!');
    }
  };

  // SOS Redirection
  const triggerSos = () => {
    setIsSosOpen(false);
    const targetContact = eventDetails.contacts ? eventDetails.contacts[sosContact] : INITIAL_EVENT.contacts[sosContact];
    const mapsLink = `https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`;
    
    let textMessage = `[SOS KumpulRoda] Butuh bantuan darurat!\nNama: ${myRsvp ? myRsvp.name : 'Anggota Anonim'}\nMotor: ${myRsvp ? myRsvp.motor_type : 'Tidak Diketahui'}\nLokasi saya: ${mapsLink}`;
    
    if (isMockGps) {
      textMessage += `\n*(Catatan: Lokasi dikirim via simulasi GPS)`;
    }

    const encodedText = encodeURIComponent(textMessage);
    const waUrl = `https://wa.me/${targetContact.whatsapp}?text=${encodedText}`;
    
    window.open(waUrl, '_blank');
  };

  // --- SAVE EVENT DETAILS (ADMIN ACTION) ---
  // --- SAVE EVENT DETAILS (ADMIN ACTION) ---
  const handleSaveEventDetails = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setLoading(true);

    if (!editEventName.trim() || !editMeetingPoint.trim() || !editRoadCaptain.trim() || !editSweeper.trim() || !editDestGmapsInput.trim()) {
      setSettingsError('Semua kolom wajib diisi.');
      setLoading(false);
      return;
    }

    if (!parsedDestCoords) {
      setSettingsError('Lokasi Google Maps / Koordinat Tujuan tidak valid.');
      setLoading(false);
      return;
    }

    const { lat, lng } = parsedDestCoords;

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('events')
          .update({
            name: editEventName.trim(),
            event_date: new Date(editEventDate).toISOString(),
            meeting_point: editMeetingPoint.trim(),
            road_captain: editRoadCaptain.trim(),
            sweeper: editSweeper.trim(),
            map_embed_url: editMapUrl.trim(),
            map_destination_lat: lat,
            map_destination_lng: lng,
            contacts: {
              mekanik: { name: editMekanikName.trim(), whatsapp: editMekanikWa.trim() },
              sweeper: { name: editSweeperName.trim(), whatsapp: editSweeperWa.trim() }
            }
          })
          .eq('id', eventDetails.id);

        if (error) throw error;
        alert('Detail Acara berhasil diperbarui!');
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        setSettingsError(`Gagal memperbarui detail acara ke database: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      const updatedEvent = {
        ...eventDetails,
        name: editEventName.trim(),
        event_date: editEventDate,
        meeting_point: editMeetingPoint.trim(),
        road_captain: editRoadCaptain.trim(),
        sweeper: editSweeper.trim(),
        map_embed_url: editMapUrl.trim(),
        map_destination_lat: lat,
        map_destination_lng: lng
      };
      setEventDetails(updatedEvent);
      localStorage.setItem('kr_eventDetails', JSON.stringify(updatedEvent));
      alert('Detail Acara berhasil diperbarui (Simulasi Lokal)!');
      setLoading(false);
    }
  };

  // --- ADD CHECKPOINT (ADMIN ACTION) ---
  const handleAddCheckpoint = async (e) => {
    e.preventDefault();
    setCheckpointError('');

    if (!newCpName.trim() || !newCpGmapsInput.trim()) {
      setCheckpointError('Semua kolom checkpoint wajib diisi.');
      return;
    }

    if (!parsedCpCoords) {
      setCheckpointError('Lokasi Google Maps / Koordinat Checkpoint tidak valid.');
      return;
    }

    const { lat, lng } = parsedCpCoords;
    const radius = parseInt(newCpRadius) || 200;

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('checkpoints')
          .insert([{
            event_id: eventDetails.id,
            name: newCpName.trim(),
            latitude: lat,
            longitude: lng,
            radius_m: radius,
            sort_order: checkpointsList.length + 1
          }]);

        if (error) throw error;
        
        // Reset Inputs
        setNewCpName('');
        setNewCpGmapsInput('');
        setParsedCpCoords(null);
        setNewCpRadius('200');
        alert('Checkpoint berhasil ditambahkan!');
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        setCheckpointError(`Gagal menambahkan checkpoint ke database: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      const newCpObj = {
        id: 'cp-' + Date.now(),
        name: newCpName.trim(),
        latitude: lat,
        longitude: lng,
        radius_m: radius
      };
      const updatedCps = [...checkpointsList, newCpObj];
      setCheckpointsList(updatedCps);
      localStorage.setItem('kr_checkpointsList', JSON.stringify(updatedCps));
      
      setNewCpName('');
      setNewCpGmapsInput('');
      setParsedCpCoords(null);
      setNewCpRadius('200');
      alert('Checkpoint berhasil ditambahkan (Simulasi Lokal)!');
    }
  };

  // --- DELETE CHECKPOINT (ADMIN ACTION) ---
  const handleDeleteCheckpoint = async (id) => {
    const confirmDel = window.confirm('Apakah Anda yakin ingin menghapus checkpoint ini?');
    if (!confirmDel) return;

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('checkpoints')
          .delete()
          .eq('id', id);

        if (error) throw error;
        alert('Checkpoint berhasil dihapus!');
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus checkpoint.');
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback
      const updatedCps = checkpointsList.filter(cp => cp.id !== id);
      setCheckpointsList(updatedCps);
      localStorage.setItem('kr_checkpointsList', JSON.stringify(updatedCps));
      alert('Checkpoint berhasil dihapus (Simulasi Lokal)!');
    }
  };

  // --- ADD RUNDOWN (ADMIN ACTION) ---
  const handleAddRundown = async (e) => {
    e.preventDefault();
    setRundownError('');

    if (!newRdTime.trim() || !newRdTitle.trim() || !newRdDesc.trim()) {
      setRundownError('Semua kolom rundown wajib diisi.');
      return;
    }

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('rundown_items')
          .insert([{
            event_id: eventDetails.id,
            time_label: newRdTime.trim(),
            title: newRdTitle.trim(),
            description: newRdDesc.trim(),
            sort_order: rundownList.length + 1
          }]);

        if (error) throw error;

        setNewRdTime('');
        setNewRdTitle('');
        setNewRdDesc('');
        alert('Item rundown berhasil ditambahkan!');
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        setRundownError(`Gagal menambahkan item rundown: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      const newRdObj = {
        id: 'rd-' + Date.now(),
        time: newRdTime.trim(),
        title: newRdTitle.trim(),
        desc: newRdDesc.trim()
      };
      const updatedRd = [...rundownList, newRdObj];
      setRundownList(updatedRd);
      localStorage.setItem('kr_rundownList', JSON.stringify(updatedRd));
      
      setNewRdTime('');
      setNewRdTitle('');
      setNewRdDesc('');
      alert('Item rundown berhasil ditambahkan (Simulasi Lokal)!');
    }
  };

  // --- DELETE RUNDOWN (ADMIN ACTION) ---
  const handleDeleteRundown = async (id) => {
    const confirmDel = window.confirm('Apakah Anda yakin ingin menghapus item rundown ini?');
    if (!confirmDel) return;

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('rundown_items')
          .delete()
          .eq('id', id);

        if (error) throw error;
        alert('Item rundown berhasil dihapus!');
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus item rundown.');
      } finally {
        setLoading(false);
      }
    } else {
      const updatedRd = rundownList.filter(item => item.id !== id);
      setRundownList(updatedRd);
      localStorage.setItem('kr_rundownList', JSON.stringify(updatedRd));
      alert('Item rundown berhasil dihapus (Simulasi Lokal)!');
    }
  };

  // --- START EDIT RUNDOWN ---
  const handleStartEditRundown = (item) => {
    setEditingRdId(item.id);
    setEditRdTime(item.time);
    setEditRdTitle(item.title);
    setEditRdDesc(item.desc);
  };

  // --- SAVE EDIT RUNDOWN (ADMIN ACTION) ---
  const handleSaveEditRundown = async (e) => {
    e.preventDefault();
    setRundownError('');

    if (!editRdTime.trim() || !editRdTitle.trim() || !editRdDesc.trim()) {
      setRundownError('Semua kolom rundown wajib diisi untuk mengubah.');
      return;
    }

    if (isSupabaseConfigured) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('rundown_items')
          .update({
            time_label: editRdTime.trim(),
            title: editRdTitle.trim(),
            description: editRdDesc.trim()
          })
          .eq('id', editingRdId);

        if (error) throw error;
        
        setEditingRdId(null);
        alert('Item rundown berhasil diperbarui!');
        await fetchDataFromSupabase();
      } catch (err) {
        console.error(err);
        setRundownError(`Gagal memperbarui item rundown: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    } else {
      const updatedRd = rundownList.map(item => {
        if (item.id === editingRdId) {
          return {
            ...item,
            time: editRdTime.trim(),
            title: editRdTitle.trim(),
            desc: editRdDesc.trim()
          };
        }
        return item;
      });
      setRundownList(updatedRd);
      localStorage.setItem('kr_rundownList', JSON.stringify(updatedRd));
      
      setEditingRdId(null);
      alert('Item rundown berhasil diperbarui (Simulasi Lokal)!');
    }
  };

  // Admin Logins
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError('');
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: adminEmail.trim(),
          password: adminPassword
        });

        if (error) {
          setAdminLoginError('Login gagal: Sandi/Email salah atau akun admin belum dibuat.');
        } else {
          setIsAdminLoggedIn(true);
          setAdminPassword('');
        }
      } catch (err) {
        console.error(err);
        setAdminLoginError('Gangguan jaringan atau sistem.');
      } finally {
        setLoading(false);
      }
    } else {
      if (adminPassword === '1234' || adminPassword.toLowerCase() === 'admin') {
        setIsAdminLoggedIn(true);
        setAdminPassword('');
      } else {
        setAdminLoginError('Sandi Admin salah. Coba: 1234');
      }
      setLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setIsAdminLoggedIn(false);
    setAdminSubTab('manifest');
  };

  const handleResetData = async () => {
    const confirmReset = window.confirm('Apakah Anda yakin ingin menyetel ulang semua data?');
    if (!confirmReset) return;

    if (isSupabaseConfigured) {
      alert('Reset data dinonaktifkan di server produksi untuk melindungi integritas data. Anda dapat menghapus data manual di database console.');
    } else {
      localStorage.removeItem('kr_my_rsvp');
      localStorage.removeItem('kr_my_checklist');
      localStorage.removeItem('kr_my_checkins');
      
      localStorage.setItem('kr_eventDetails', JSON.stringify(INITIAL_EVENT));
      localStorage.setItem('kr_checkpointsList', JSON.stringify(INITIAL_CHECKPOINTS));
      localStorage.setItem('kr_rundownList', JSON.stringify(INITIAL_RUNDOWN));
      localStorage.setItem('kr_participants', JSON.stringify(INITIAL_PARTICIPANTS));

      setEventDetails(INITIAL_EVENT);
      setCheckpointsList(INITIAL_CHECKPOINTS);
      setRundownList(INITIAL_RUNDOWN);
      setParticipants(INITIAL_PARTICIPANTS);

      setMyRsvp(null);
      setMyChecklist({
        tires_ok: false,
        brakes_ok: false,
        lights_ok: false,
        fluids_ok: false,
        documents_ok: false
      });
      setMyCheckIns({});
      setIsAdminLoggedIn(false);
      setActiveTab('dashboard');
      alert('Semua data berhasil disetel ulang ke kondisi awal.');
    }
  };

  const setMockLocation = (lat, lng, name) => {
    setGpsCoords({ lat, lng });
    alert(`Lokasi simulasi diset ke: ${name}`);
  };

  return (
    <div className="app-container">
      {/* Database Mode Indicator */}
      {isAdmin && (
        <div 
          style={{ 
            fontSize: '0.75rem', 
            padding: '4px 8px', 
            backgroundColor: isSupabaseConfigured ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
            borderBottom: `1px solid ${isSupabaseConfigured ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
            borderRadius: '4px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Database style={{ width: '12px', color: isSupabaseConfigured ? 'var(--success)' : 'var(--warning)' }} />
          <span>
            Mode: <strong>{isSupabaseConfigured ? 'Supabase Online (Database Aktif)' : 'Local Offline (Demo/Fallback)'}</strong>
          </span>
        </div>
      )}

      {/* Header Banner */}
      <header className="card card-primary" style={{ padding: '16px', marginBottom: '16px', borderTop: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Pusat Komando MVP</span>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800' }}>KumpulRoda</h1>
          </div>
          {myRsvp ? (
            <div style={{ textAlign: 'right' }}>
              <div className="text-muted-desc">Status Anda</div>
              <span className={`badge ${myRsvp.bike_ready ? 'badge-success' : 'badge-warning'}`}>
                {myRsvp.bike_ready ? 'Ready to Ride' : 'Belum Siap'}
              </span>
            </div>
          ) : (
            <button className="badge badge-danger" onClick={() => setActiveTab('rsvp')} style={{ border: '1px solid var(--danger)', cursor: 'pointer' }}>
              Belum RSVP
            </button>
          )}
        </div>
      </header>

      {/* Main Panel Content */}
      <main>
        
        {/* --- TAB 1: INFO HUB (DASHBOARD) --- */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Event Info Card */}
            <div className="card">
              <h2 className="card-title" style={{ color: 'var(--primary)' }}>
                <Compass style={{ color: 'var(--primary)' }} /> Detail Acara
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Smartphone style={{ width: '18px', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>{eventDetails.name}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Calendar style={{ width: '18px', color: 'var(--text-secondary)' }} />
                  <div>
                    {isNaN(Date.parse(eventDetails.event_date)) 
                      ? eventDetails.event_date 
                      : new Date(eventDetails.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Clock style={{ width: '18px', color: 'var(--text-secondary)' }} />
                  <div>{eventDetails.time_label}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <MapPin style={{ width: '18px', color: 'var(--text-secondary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Titik Kumpul:</strong>
                    <div className="text-muted-desc" style={{ marginTop: '2px' }}>{eventDetails.meeting_point}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pengurus Konvoi Card */}
            <div className="card">
              <h2 className="card-title">
                <Users style={{ color: 'var(--primary)' }} /> Pengurus Konvoi
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'left' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span className="text-muted-desc" style={{ fontWeight: '600' }}>Road Captain</span>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', margin: '4px 0 8px 0' }}>{eventDetails.road_captain}</div>
                  <a href={`https://wa.me/6281234567890`} target="_blank" className="btn btn-secondary" style={{ minHeight: '36px', height: '36px', padding: '0 8px', fontSize: '0.8rem', width: 'auto', display: 'flex' }}>
                    <Phone style={{ width: '12px' }} /> Hubungi
                  </a>
                </div>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <span className="text-muted-desc" style={{ fontWeight: '600' }}>Sweeper Utama</span>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', margin: '4px 0 8px 0' }}>{eventDetails.sweeper}</div>
                  <a href={`https://wa.me/6281298765432`} target="_blank" className="btn btn-secondary" style={{ minHeight: '36px', height: '36px', padding: '0 8px', fontSize: '0.8rem', width: 'auto', display: 'flex' }}>
                    <Phone style={{ width: '12px' }} /> Hubungi
                  </a>
                </div>
              </div>
            </div>

            {/* Rundown Timeline Card */}
            <div className="card">
              <h2 className="card-title">
                <Clock style={{ color: 'var(--primary)' }} /> Rundown Acara
              </h2>
              <div className="timeline">
                {rundownList.map((item, index) => (
                  <div className={`timeline-item ${index === 0 ? 'active' : ''}`} key={index}>
                    <div className="timeline-node"></div>
                    <div className="timeline-content">
                      <div className="timeline-time">{item.time}</div>
                      <div className="timeline-item-title">{item.title}</div>
                      <div className="timeline-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rules Card */}
            <div className="card">
              <h2 className="card-title">
                <Shield style={{ color: 'var(--primary)' }} /> Tata Tertib Konvoi
              </h2>
              <ul className="rules-list">
                {eventDetails.rules_text ? eventDetails.rules_text.map((rule, index) => (
                  <li key={index}>{rule}</li>
                )) : INITIAL_EVENT.rules_text.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ul>
            </div>

            {/* Bottom Call to Actions */}
            {!myRsvp ? (
              <button className="btn btn-primary" onClick={() => setActiveTab('rsvp')} style={{ marginBottom: '16px' }}>
                Daftar RSVP Sekarang
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!myRsvp.bike_ready && (
                  <button className="btn btn-primary" onClick={() => setActiveTab('checklist')} style={{ background: 'linear-gradient(135deg, var(--warning) 0%, #d97706 100%)', boxShadow: 'none' }}>
                    Selesaikan Cek Kesiapan Motor
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setActiveTab('checkpoint')}>
                  Buka Absensi Checkpoint
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: INTERACTIVE ROUTE --- */}
        {activeTab === 'route' && (
          <div className="card">
            <h2 className="card-title" style={{ color: 'var(--primary)' }}>
              <Navigation style={{ color: 'var(--primary)' }} /> Rute Resmi Touring
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textAlign: 'left' }}>
              Berikut adalah peta rute resmi touring. Silakan tinjau rute di bawah atau langsung buka navigasi di HP Anda.
            </p>

            {/* Google Maps Embed iframe (Dynamic or Custom My Maps) */}
            <div className="map-wrapper">
              <iframe 
                src={getMapEmbedUrl()} 
                title="Peta Rute KumpulRoda"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '4px' }}>Info Navigasi:</h4>
              <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Tujuan Akhir: <strong>{eventDetails.name}</strong></li>
                <li>Koordinat Tujuan GPS: <code>{eventDetails.map_destination_lat}, {eventDetails.map_destination_lng}</code></li>
                <li>Jumlah Checkpoint Aktif: {checkpointsList.length} titik</li>
              </ul>
            </div>

            {/* Deep link button to native Google Maps app */}
            <a 
              href={getNavigationUrl()}
              target="_blank" 
              rel="noreferrer"
              className="btn btn-primary"
            >
              <Navigation /> MULAI NAVIGASI GOOGLE MAPS
            </a>
          </div>
        )}

        {/* --- TAB 3: QUICK RSVP & LIVE COUNTER --- */}
        {activeTab === 'rsvp' && (
          <div>
            <div className="card">
              <h2 className="card-title">
                <Users style={{ color: 'var(--primary)' }} /> Kehadiran Peserta
              </h2>
              
              <div className="counters-grid">
                <div className="counter-box">
                  <div className="counter-value">{totalMotor}</div>
                  <div className="counter-label">Motor</div>
                </div>
                <div className="counter-box">
                  <div className="counter-value">{totalRider}</div>
                  <div className="counter-label">Rider</div>
                </div>
                <div className="counter-box">
                  <div className="counter-value">{totalBoncenger}</div>
                  <div className="counter-label">Boncenger</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', fontSize: '0.85rem' }}>
                <span className="badge badge-primary">Total: {totalKepala} Kepala</span>
                <span className="badge badge-success">
                  {participants.filter(p => p.bike_ready).length} Motor Siap
                </span>
              </div>
            </div>

            {/* RSVP Form / User Card */}
            {!myRsvp ? (
              <div className="card">
                <h2 className="card-title" style={{ color: 'var(--primary)' }}>
                  Pendaftaran RSVP
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left' }}>
                  Isi data singkat berikut untuk mendaftar. Tanpa buat akun, instan, langsung terdaftar di sistem.
                </p>

                {formError && (
                  <div className="badge badge-danger" style={{ display: 'flex', width: '100%', padding: '10px', marginBottom: '16px', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}>
                    <AlertTriangle style={{ width: '16px', marginRight: '6px', flexShrink: 0 }} /> {formError}
                  </div>
                )}

                <form onSubmit={handleRsvpSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: Budi Prasetyo" 
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      placeholder="Contoh: 081234567890" 
                      value={rsvpWa}
                      onChange={(e) => setRsvpWa(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipe/Merek Motor</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Contoh: Yamaha ADV 160, Xabre, dll" 
                      value={rsvpMotor}
                      onChange={(e) => setRsvpMotor(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status Berkendara</label>
                    <div className="radio-group">
                      <div 
                        className={`radio-card ${rsvpStatus === 'solo' ? 'selected' : ''}`}
                        onClick={() => !loading && setRsvpStatus('solo')}
                      >
                        <User style={{ width: '18px' }} />
                        <span>Solo Rider</span>
                      </div>
                      <div 
                        className={`radio-card ${rsvpStatus === 'boncengan' ? 'selected' : ''}`}
                        onClick={() => !loading && setRsvpStatus('boncengan')}
                      >
                        <Users style={{ width: '18px' }} />
                        <span>Berboncengan</span>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }} disabled={loading}>
                    {loading ? 'MEMPROSES...' : 'DAFTAR SEKARANG'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 className="card-title" style={{ color: 'var(--success)', margin: 0 }}>
                    <CheckCircle2 style={{ color: 'var(--success)' }} /> RSVP Anda Aktif
                  </h2>
                  <span className="badge badge-success">Terdaftar</span>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '8px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Nama:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{myRsvp.name}</strong>
                    
                    <span style={{ color: 'var(--text-secondary)' }}>WhatsApp:</span>
                    <span style={{ color: 'var(--text-primary)' }}>+{myRsvp.whatsapp}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>Motor:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{myRsvp.motor_type}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                    <span style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{myRsvp.ride_status}</span>

                    <span style={{ color: 'var(--text-secondary)' }}>Kelayakan:</span>
                    <span className={`badge ${myRsvp.bike_ready ? 'badge-success' : 'badge-warning'}`} style={{ width: 'fit-content', padding: '2px 8px', fontSize: '0.7rem' }}>
                      {myRsvp.bike_ready ? 'Ready to Ride' : 'Belum Siap'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {!myRsvp.bike_ready ? (
                    <button className="btn btn-primary" onClick={() => setActiveTab('checklist')}>
                      Lanjut Cek Kelayakan Motor
                    </button>
                  ) : (
                    <button className="btn btn-success" onClick={() => setActiveTab('checkpoint')}>
                      Menuju Check-in Checkpoint
                    </button>
                  )}
                  
                  <button className="btn btn-secondary" onClick={handleRsvpCancel} disabled={loading} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    {loading ? 'MEMBATALKAN...' : 'Batalkan Pendaftaran (RSVP)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: PRE-RIDE BIKE CHECKLIST --- */}
        {activeTab === 'checklist' && (
          <div className="card">
            <h2 className="card-title" style={{ color: 'var(--primary)' }}>
              <CheckSquare style={{ color: 'var(--primary)' }} /> Cek Mandiri Kelayakan Motor
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left' }}>
              Demi keselamatan bersama dalam konvoi, wajib periksa 5 aspek fisik motor Anda di bawah sebelum berangkat. Centang jika dalam kondisi baik.
            </p>

            {!myRsvp ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="badge badge-warning" style={{ marginBottom: '16px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle style={{ width: '16px' }} /> Anda belum mengisi RSVP pendaftaran.
                </div>
                <button className="btn btn-primary" onClick={() => setActiveTab('rsvp')}>
                  Isi RSVP Terlebih Dahulu
                </button>
              </div>
            ) : (
              <div>
                <div className="checklist-container">
                  <div 
                    className={`checklist-item ${myChecklist.tires_ok ? 'checked' : ''}`}
                    onClick={() => handleChecklistToggle('tires_ok')}
                  >
                    <div className="checkbox-custom">
                      {myChecklist.tires_ok && <CheckCircle2 style={{ width: '18px', fill: 'white', color: 'var(--success)' }} />}
                    </div>
                    <div>
                      <span className="checklist-item-text">1. Ban Depan & Belakang</span>
                      <span className="checklist-item-desc">Tekanan angin sesuai standar, kondisi ulir tebal & tidak gundul.</span>
                    </div>
                  </div>

                  <div 
                    className={`checklist-item ${myChecklist.brakes_ok ? 'checked' : ''}`}
                    onClick={() => handleChecklistToggle('brakes_ok')}
                  >
                    <div className="checkbox-custom">
                      {myChecklist.brakes_ok && <CheckCircle2 style={{ width: '18px', fill: 'white', color: 'var(--success)' }} />}
                    </div>
                    <div>
                      <span className="checklist-item-text">2. Fungsi Pengereman</span>
                      <span className="checklist-item-desc">Kampas rem tebal, fungsi rem depan & belakang pakem, minyak rem cukup.</span>
                    </div>
                  </div>

                  <div 
                    className={`checklist-item ${myChecklist.lights_ok ? 'checked' : ''}`}
                    onClick={() => handleChecklistToggle('lights_ok')}
                  >
                    <div className="checkbox-custom">
                      {myChecklist.lights_ok && <CheckCircle2 style={{ width: '18px', fill: 'white', color: 'var(--success)' }} />}
                    </div>
                    <div>
                      <span className="checklist-item-text">3. Lampu & Kelistrikan</span>
                      <span className="checklist-item-desc">Lampu utama dekat/jauh, lampu rem, lampu sein kiri/kanan menyala semua.</span>
                    </div>
                  </div>

                  <div 
                    className={`checklist-item ${myChecklist.fluids_ok ? 'checked' : ''}`}
                    onClick={() => handleChecklistToggle('fluids_ok')}
                  >
                    <div className="checkbox-custom">
                      {myChecklist.fluids_ok && <CheckCircle2 style={{ width: '18px', fill: 'white', color: 'var(--success)' }} />}
                    </div>
                    <div>
                      <span className="checklist-item-text">4. Cairan (Oli & Pendingin)</span>
                      <span className="checklist-item-desc">Volume oli mesin mencukupi, air radiator (coolant) terisi aman, tidak ada kebocoran.</span>
                    </div>
                  </div>

                  <div 
                    className={`checklist-item ${myChecklist.documents_ok ? 'checked' : ''}`}
                    onClick={() => handleChecklistToggle('documents_ok')}
                  >
                    <div className="checkbox-custom">
                      {myChecklist.documents_ok && <CheckCircle2 style={{ width: '18px', fill: 'white', color: 'var(--success)' }} />}
                    </div>
                    <div>
                      <span className="checklist-item-text">5. Surat & Legalitas</span>
                      <span className="checklist-item-desc">Membawa SIM C aktif dan STNK motor asli yang pajaknya berlaku.</span>
                    </div>
                  </div>
                </div>

                {/* Status Box */}
                <div 
                  className="status-box" 
                  style={{
                    backgroundColor: myRsvp.bike_ready ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${myRsvp.bike_ready ? 'var(--success)' : 'var(--warning)'}`,
                    color: myRsvp.bike_ready ? 'var(--success)' : 'var(--warning)',
                    marginBottom: '16px'
                  }}
                >
                  {myRsvp.bike_ready ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <CheckCircle2 /> MOTOR LAYAK JALAN (READY TO RIDE)
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <AlertTriangle /> MOTOR BELUM LAYAK JALAN
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: CHECK-IN CHECKPOINT (GEOLOCATION + MOCK GPS) --- */}
        {activeTab === 'checkpoint' && (
          <div className="card">
            <h2 className="card-title" style={{ color: 'var(--primary)' }}>
              <MapPin style={{ color: 'var(--primary)' }} /> Absensi Checkpoint (Geo-fencing)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left' }}>
              Absensi checkpoint menggunakan sensor GPS HP Anda. Anda hanya dapat menekan tombol check-in jika berada dalam <strong>radius maksimal 200 meter</strong> dari lokasi checkpoint resmi.
            </p>

            {!myRsvp ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="badge badge-warning" style={{ marginBottom: '16px', textTransform: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle style={{ width: '16px' }} /> Anda belum mengisi RSVP pendaftaran.
                </div>
                <button className="btn btn-primary" onClick={() => setActiveTab('rsvp')}>
                  Isi RSVP Terlebih Dahulu
                </button>
              </div>
            ) : (
              <div>
                {/* Simulated GPS Debug Control Panel */}
                <div className="debug-panel">
                  <div className="debug-title">
                    <Sliders style={{ width: '16px' }} /> Panel Simulasi GPS (Mock GPS)
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Gunakan panel ini untuk mensimulasikan posisi Anda agar dapat menguji kelayakan tombol Check-in di rest area.
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <input 
                      type="checkbox" 
                      id="toggle-mock"
                      checked={isMockGps}
                      onChange={(e) => setIsMockGps(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="toggle-mock" style={{ fontWeight: '600', cursor: 'pointer' }}>
                      Aktifkan Simulasi GPS
                    </label>
                  </div>

                  {isMockGps && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <span className="form-label" style={{ fontSize: '0.7rem' }}>Lintang (Lat)</span>
                          <input 
                            type="number" 
                            step="0.000001" 
                            className="form-input" 
                            style={{ minHeight: '32px', height: '32px', padding: '4px 8px', fontSize: '0.8rem' }}
                            value={gpsCoords.lat}
                            onChange={(e) => setGpsCoords({ ...gpsCoords, lat: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <span className="form-label" style={{ fontSize: '0.7rem' }}>Bujur (Lng)</span>
                          <input 
                            type="number" 
                            step="0.000001" 
                            className="form-input" 
                            style={{ minHeight: '32px', height: '32px', padding: '4px 8px', fontSize: '0.8rem' }}
                            value={gpsCoords.lng}
                            onChange={(e) => setGpsCoords({ ...gpsCoords, lng: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ minHeight: '32px', height: '32px', padding: '0 8px', fontSize: '0.7rem', width: 'auto' }}
                          onClick={() => setMockLocation(-6.2425, 106.8622, 'SPBU MT Haryono (Titik Kumpul)')}
                        >
                          Di Titik Kumpul (Jakarta)
                        </button>
                        {checkpointsList.map((cp, i) => (
                          <button 
                            key={cp.id}
                            className="btn btn-secondary" 
                            style={{ minHeight: '32px', height: '32px', padding: '0 8px', fontSize: '0.7rem', width: 'auto' }}
                            onClick={() => setMockLocation(cp.latitude, cp.longitude, `${cp.name} (Radius Valid)`)}
                          >
                            Di CP {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* GPS Status Indicator */}
                <div className="gps-info">
                  <div className="gps-indicator">
                    <div className={`gps-dot ${gpsStatusText.includes('Aktif') || gpsStatusText.includes('Simulasi') ? 'active' : ''}`}></div>
                    <span style={{ fontWeight: '600' }}>Status Sensor: {gpsStatusText}</span>
                  </div>
                  <div className="gps-row">
                    <span className="gps-label">Koordinat Anda:</span>
                    <span className="gps-value">{gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}</span>
                  </div>
                </div>

                {/* Checkpoint Status Loop */}
                {checkpointsList.map((checkpoint) => {
                  const distanceMeters = haversineMeters(
                    gpsCoords.lat,
                    gpsCoords.lng,
                    checkpoint.latitude,
                    checkpoint.longitude
                  );
                  const inRadius = distanceMeters <= checkpoint.radius_m;
                  const isCheckedIn = !!myCheckIns[checkpoint.id];

                  return (
                    <div 
                      key={checkpoint.id} 
                      className="card" 
                      style={{ 
                        background: 'var(--bg-surface-elevated)', 
                        borderColor: isCheckedIn ? 'var(--success)' : (inRadius ? 'var(--primary)' : 'var(--border-color)')
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin style={{ width: '16px', color: isCheckedIn ? 'var(--success)' : 'var(--primary)' }} />
                          {checkpoint.name}
                        </h3>
                        {isCheckedIn ? (
                          <span className="badge badge-success">Telah Check-in</span>
                        ) : (
                          <span className={`badge ${inRadius ? 'badge-primary' : 'badge-secondary'}`} style={{ border: 'none', background: inRadius ? 'rgba(255,123,0,0.15)' : 'rgba(255,255,255,0.05)' }}>
                            {inRadius ? 'Siap Check-in' : 'Belum Check-in'}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span>Jarak ke checkpoint:</span>
                          <strong>
                            {distanceMeters > 1000 
                              ? `${(distanceMeters / 1000).toFixed(2)} km` 
                              : `${Math.round(distanceMeters)} meter`}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Radius maksimal sah:</span>
                          <span>{checkpoint.radius_m} meter</span>
                        </div>
                        {isCheckedIn && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: 'var(--success)', fontWeight: '600' }}>
                            <span>Waktu check-in:</span>
                            <span>{new Date(myCheckIns[checkpoint.id]).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                          </div>
                        )}
                      </div>

                      {!isCheckedIn && (
                        <button 
                          className={`btn ${inRadius ? 'btn-primary' : 'btn-secondary'}`}
                          disabled={!inRadius || loading}
                          onClick={() => handleCheckIn(checkpoint.id)}
                        >
                          {loading ? 'MEMPROSES CHECK-IN...' : (inRadius ? 'CHECK-IN DI SINI' : 'CHECK-IN (TIDAK AKTIF)')}
                        </button>
                      )}
                      
                      {!isCheckedIn && !inRadius && (
                        <p className="text-muted-desc" style={{ marginTop: '8px', textAlign: 'center', color: 'var(--danger)' }}>
                          *Anda harus berada kurang dari {checkpoint.radius_m}m dari titik checkpoint.
                        </p>
                      )}
                    </div>
                  );
                })}

                {checkpointsList.length === 0 && (
                  <div className="card flex-center" style={{ borderStyle: 'dashed', padding: '30px', color: 'var(--text-muted)' }}>
                    Belum ada checkpoint yang dibuat oleh panitia.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 6: LIVE MONITOR & SETTINGS ADMIN DASHBOARD --- */}
        {activeTab === 'admin' && (
          <div>
            {!isAdminLoggedIn ? (
              // Admin Login Screen
              <div className="card admin-login-card">
                <h2 className="card-title" style={{ justifyContent: 'center' }}>
                  <Shield style={{ color: 'var(--primary)' }} /> Login Panitia
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Halaman ini dibatasi hanya untuk panitia (Road Captain / Sweeper).
                </p>

                {adminLoginError && (
                  <div className="badge badge-danger" style={{ display: 'block', width: '100%', padding: '8px', marginBottom: '12px', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}>
                    {adminLoginError}
                  </div>
                )}

                <form onSubmit={handleAdminLogin}>
                  {isSupabaseConfigured && (
                    <div className="form-group">
                      <label className="form-label">Email Admin</label>
                      <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '14px', top: '15px', width: '18px', color: 'var(--text-muted)' }} />
                        <input 
                          type="email" 
                          className="form-input" 
                          style={{ paddingLeft: '44px' }}
                          placeholder="admin@kumpulroda.com" 
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">{isSupabaseConfigured ? 'Password' : 'Sandi Demo'}</label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '14px', top: '15px', width: '18px', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        className="form-input" 
                        style={{ paddingLeft: '44px' }}
                        placeholder="••••••••" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'MEMASUKI...' : 'MASUK DASHBOARD'}
                  </button>
                </form>
                
                <p className="text-muted-desc" style={{ marginTop: '12px' }}>
                  {isSupabaseConfigured 
                    ? '*Login via Supabase Auth. Daftarkan email & password admin di dashboard authentication Supabase Anda.' 
                    : '*Sandi demo default: 1234 atau admin'}
                </p>
              </div>
            ) : (
              // Admin Panel Dashboard (Authenticated)
              <div>
                {/* Stats Summary Widget & Header */}
                <div className="card">
                  <div className="flex-between" style={{ marginBottom: '16px' }}>
                    <h2 className="card-title" style={{ margin: 0 }}>
                      <Sliders style={{ color: 'var(--primary)' }} /> Panel Kontrol Admin
                    </h2>
                    <button className="badge badge-danger" onClick={handleAdminLogout} style={{ border: 'none', cursor: 'pointer', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <LogOut style={{ width: '12px' }} /> Keluar
                    </button>
                  </div>

                  {/* Sub navigasi Admin */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                    <button 
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        minHeight: '36px', 
                        height: '36px', 
                        fontSize: '0.85rem', 
                        padding: 0,
                        background: adminSubTab === 'manifest' ? 'var(--primary)' : 'transparent',
                        color: adminSubTab === 'manifest' ? '#fff' : 'var(--text-secondary)',
                        boxShadow: 'none'
                      }}
                      onClick={() => setAdminSubTab('manifest')}
                    >
                      Manifes Peserta
                    </button>
                    <button 
                      className="btn" 
                      style={{ 
                        flex: 1, 
                        minHeight: '36px', 
                        height: '36px', 
                        fontSize: '0.85rem', 
                        padding: 0,
                        background: adminSubTab === 'settings' ? 'var(--primary)' : 'transparent',
                        color: adminSubTab === 'settings' ? '#fff' : 'var(--text-secondary)',
                        boxShadow: 'none'
                      }}
                      onClick={() => setAdminSubTab('settings')}
                    >
                      Pengaturan Acara
                    </button>
                  </div>

                  {adminSubTab === 'manifest' && (
                    <div className="counters-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: 0 }}>
                      <div className="counter-box" style={{ padding: '8px 4px' }}>
                        <div className="counter-value" style={{ fontSize: '1.25rem' }}>{totalMotor}</div>
                        <div className="counter-label" style={{ fontSize: '0.6rem' }}>Motor</div>
                      </div>
                      <div className="counter-box" style={{ padding: '8px 4px' }}>
                        <div className="counter-value" style={{ fontSize: '1.25rem' }}>{totalKepala}</div>
                        <div className="counter-label" style={{ fontSize: '0.6rem' }}>Kepala</div>
                      </div>
                      <div className="counter-box" style={{ padding: '8px 4px' }}>
                        <div className="counter-value" style={{ fontSize: '1.25rem', color: 'var(--success)' }}>
                          {participants.filter(p => p.bike_ready).length}
                        </div>
                        <div className="counter-label" style={{ fontSize: '0.6rem' }}>Lolos Cek</div>
                      </div>
                      <div className="counter-box" style={{ padding: '8px 4px' }}>
                        <div className="counter-value" style={{ fontSize: '1.25rem', color: 'var(--info)' }}>
                          {participants.filter(p => p.check_ins && Object.keys(p.check_ins).length > 0).length}
                        </div>
                        <div className="counter-label" style={{ fontSize: '0.6rem' }}>Check-in</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub Tab A: MANIFES PESERTA */}
                {adminSubTab === 'manifest' && (
                  <div className="card" style={{ padding: '16px 12px' }}>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', textAlign: 'left' }}>Manifes & Kelayakan Peserta</h3>
                    
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nama</th>
                            <th>Motor</th>
                            <th>Kelayakan</th>
                            {checkpointsList.map((cp, idx) => (
                              <th key={cp.id}>Check-in CP {idx + 1}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: myRsvp && p.id === myRsvp.id ? 'rgba(255,123,0,0.05)' : 'transparent' }}>
                              <td style={{ fontWeight: '600' }}>
                                {p.name}
                                {myRsvp && p.id === myRsvp.id && <span style={{ color: 'var(--primary)', fontSize: '0.7rem', marginLeft: '4px' }}>(Anda)</span>}
                              </td>
                              <td>{p.motor_type} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>({p.ride_status})</span></td>
                              <td>
                                <span className={`badge ${p.bike_ready ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'none', padding: '2px 6px', fontSize: '0.7rem' }}>
                                  {p.bike_ready ? '✔ Ready to Ride' : '✘ Belum Siap'}
                                </span>
                              </td>
                              {checkpointsList.map((cp) => {
                                const checkinTime = p.check_ins && p.check_ins[cp.id];
                                return (
                                  <td key={cp.id}>
                                    {checkinTime ? (
                                      <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                                        ✔ {new Date(checkinTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                      <button className="btn btn-secondary" onClick={handleResetData} style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        Setel Ulang Semua Data (Hanya Mode Demo)
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub Tab B: PENGATURAN ACARA (EVENT & CHECKPOINT EDITOR) */}
                {adminSubTab === 'settings' && (
                  <div>
                    {/* Event Settings Form */}
                    <div className="card">
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', textAlign: 'left', color: 'var(--primary)' }}>Detail & Informasi Acara</h3>
                      
                      {settingsError && (
                        <div className="badge badge-danger" style={{ display: 'flex', width: '100%', padding: '8px', marginBottom: '16px', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <AlertTriangle style={{ width: '16px', marginRight: '6px' }} /> {settingsError}
                        </div>
                      )}

                      <form onSubmit={handleSaveEventDetails}>
                        <div className="form-group">
                          <label className="form-label">Nama Kegiatan Touring</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editEventName}
                            onChange={(e) => setEditEventName(e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Waktu Mulai Acara</label>
                            <input 
                              type="datetime-local" 
                              className="form-input" 
                              value={editEventDate}
                              onChange={(e) => setEditEventDate(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Teks Jam (Rundown)</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="06.00 WIB - Selesai"
                              value={editEventTime}
                              onChange={(e) => setEditEventTime(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Titik Kumpul Keberangkatan</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={editMeetingPoint}
                            onChange={(e) => setEditMeetingPoint(e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Nama Road Captain</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={editRoadCaptain}
                              onChange={(e) => setEditRoadCaptain(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Nama Sweeper Utama</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              value={editSweeper}
                              onChange={(e) => setEditSweeper(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Responden Darurat (Mekanik)</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Nama"
                              value={editMekanikName}
                              onChange={(e) => setEditMekanikName(e.target.value)}
                              disabled={loading}
                              style={{ marginBottom: '8px' }}
                            />
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="WhatsApp (ex: 62812...)"
                              value={editMekanikWa}
                              onChange={(e) => setEditMekanikWa(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Responden Darurat (Sweeper)</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Nama"
                              value={editSweeperName}
                              onChange={(e) => setEditSweeperName(e.target.value)}
                              disabled={loading}
                              style={{ marginBottom: '8px' }}
                            />
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="WhatsApp (ex: 62812...)"
                              value={editSweeperWa}
                              onChange={(e) => setEditSweeperWa(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Google My Maps Embed URL (Iframe src)</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            value={editMapUrl}
                            onChange={(e) => setEditMapUrl(e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Link Google Maps / Koordinat Tujuan</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Tempel link Google Maps atau koordinat -6.902481, 107.618784"
                            value={editDestGmapsInput}
                            onChange={(e) => handleDestGmapsChange(e.target.value)}
                            disabled={loading}
                          />
                          <div style={{ marginTop: '6px', fontSize: '0.75rem', textAlign: 'left' }}>
                            {isUnshorteningDest ? (
                              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                                ⏳ Mengurai link singkat Google Maps...
                              </span>
                            ) : parsedDestCoords ? (
                              <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                                ✔ Lokasi terdeteksi: {parsedDestCoords.lat.toFixed(6)}, {parsedDestCoords.lng.toFixed(6)}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--warning)' }}>
                                ⚠ Masukkan link Google Maps address bar atau koordinat Lat, Lng yang valid.
                              </span>
                            )}
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
                          {loading ? 'MENYIMPAN...' : 'SIMPAN DETAIL ACARA'}
                        </button>
                      </form>
                    </div>

                    {/* Checkpoints Manager Form */}
                    <div className="card">
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', textAlign: 'left', color: 'var(--primary)' }}>Kelola Pos / Checkpoints</h3>
                      
                      {/* Checkpoint Table/List */}
                      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {checkpointsList.map((cp, idx) => (
                          <div 
                            key={cp.id}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '12px 14px',
                              textAlign: 'left'
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                                {idx + 1}. {cp.name}
                              </div>
                              <div className="text-muted-desc" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                GPS: {cp.latitude.toFixed(5)}, {cp.longitude.toFixed(5)} | Radius: {cp.radius_m}m
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDeleteCheckpoint(cp.id)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: 'var(--danger)', 
                                cursor: 'pointer',
                                padding: '6px'
                              }}
                              disabled={loading}
                            >
                              <Trash2 style={{ width: '18px' }} />
                            </button>
                          </div>
                        ))}

                        {checkpointsList.length === 0 && (
                          <div className="text-muted-desc" style={{ padding: '16px 0', textAlign: 'center' }}>
                            Belum ada checkpoint dibuat. Silakan tambahkan di bawah.
                          </div>
                        )}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

                      {/* Add Checkpoint Form */}
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', textAlign: 'left' }}>Tambah Checkpoint Baru</h4>
                      
                      {checkpointError && (
                        <div className="badge badge-danger" style={{ display: 'flex', width: '100%', padding: '8px', marginBottom: '12px', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <AlertTriangle style={{ width: '16px', marginRight: '6px' }} /> {checkpointError}
                        </div>
                      )}

                      <form onSubmit={handleAddCheckpoint}>
                        <div className="form-group">
                          <label className="form-label">Nama Checkpoint / Tempat Istirahat</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Contoh: Rest Area KM 72"
                            value={newCpName}
                            onChange={(e) => setNewCpName(e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Link Google Maps / Koordinat Checkpoint</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Tempel link Google Maps atau koordinat"
                              value={newCpGmapsInput}
                              onChange={(e) => handleCpGmapsChange(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Radius (m)</label>
                            <input 
                              type="number" 
                              className="form-input" 
                              placeholder="200"
                              value={newCpRadius}
                              onChange={(e) => setNewCpRadius(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: '6px', marginBottom: '16px', fontSize: '0.75rem', textAlign: 'left' }}>
                          {isUnshorteningCp ? (
                            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                              ⏳ Mengurai link singkat Google Maps...
                            </span>
                          ) : parsedCpCoords ? (
                            <span style={{ color: 'var(--success)', fontWeight: '600' }}>
                              ✔ Lokasi terdeteksi: {parsedCpCoords.lat.toFixed(6)}, {parsedCpCoords.lng.toFixed(6)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--warning)' }}>
                              ⚠ Masukkan link Google Maps atau koordinat Lat, Lng yang valid.
                            </span>
                          )}
                        </div>

                        <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '6px', justifyContent: 'center' }} disabled={loading}>
                          <Plus style={{ width: '16px' }} /> Tambah Checkpoint
                        </button>
                      </form>
                    </div>

                    {/* Rundown Manager Card */}
                    <div className="card">
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '16px', textAlign: 'left', color: 'var(--primary)' }}>Kelola Rundown Acara</h3>
                      
                      {/* Rundown List */}
                      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {rundownList.map((item, idx) => (
                          <div 
                            key={item.id}
                            style={{ 
                              background: 'var(--bg-surface-elevated)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: '12px 14px',
                              textAlign: 'left'
                            }}
                          >
                            {editingRdId === item.id ? (
                              // Edit Form
                              <form onSubmit={handleSaveEditRundown} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Jam (cth: 06.00)" 
                                    value={editRdTime}
                                    onChange={(e) => setEditRdTime(e.target.value)}
                                    disabled={loading}
                                    style={{ padding: '8px' }}
                                  />
                                  <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Judul Agenda" 
                                    value={editRdTitle}
                                    onChange={(e) => setEditRdTitle(e.target.value)}
                                    disabled={loading}
                                    style={{ padding: '8px' }}
                                  />
                                </div>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  placeholder="Keterangan Agenda" 
                                  value={editRdDesc}
                                  onChange={(e) => setEditRdDesc(e.target.value)}
                                  disabled={loading}
                                  style={{ padding: '8px' }}
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                  <button type="button" className="btn btn-secondary" onClick={() => setEditingRdId(null)} disabled={loading} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                    Batal
                                  </button>
                                  <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                    Simpan
                                  </button>
                                </div>
                              </form>
                            ) : (
                              // Display Item
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <span className="badge badge-primary" style={{ padding: '2px 6px', fontSize: '0.75rem', textTransform: 'none' }}>
                                      {item.time}
                                    </span>
                                    <strong style={{ fontSize: '0.9rem' }}>{item.title}</strong>
                                  </div>
                                  <div className="text-muted-desc" style={{ fontSize: '0.8rem', marginTop: '4px', paddingLeft: '2px' }}>
                                    {item.desc}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button 
                                    onClick={() => handleStartEditRundown(item)}
                                    className="btn btn-secondary"
                                    style={{ padding: '6px', minWidth: 'auto', border: 'none', background: 'none', color: 'var(--text-secondary)' }}
                                    disabled={loading}
                                  >
                                    Edit
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteRundown(item.id)}
                                    style={{ 
                                      background: 'none', 
                                      border: 'none', 
                                      color: 'var(--danger)', 
                                      cursor: 'pointer',
                                      padding: '6px'
                                    }}
                                    disabled={loading}
                                  >
                                    <Trash2 style={{ width: '18px' }} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {rundownList.length === 0 && (
                          <div className="text-muted-desc" style={{ padding: '16px 0', textAlign: 'center' }}>
                            Belum ada agenda rundown. Silakan tambahkan di bawah.
                          </div>
                        )}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

                      {/* Add Rundown Form */}
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', textAlign: 'left' }}>Tambah Agenda Rundown Baru</h4>
                      
                      {rundownError && (
                        <div className="badge badge-danger" style={{ display: 'flex', width: '100%', padding: '8px', marginBottom: '12px', textTransform: 'none', borderRadius: 'var(--radius-sm)' }}>
                          <AlertTriangle style={{ width: '16px', marginRight: '6px' }} /> {rundownError}
                        </div>
                      )}

                      <form onSubmit={handleAddRundown}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                          <div className="form-group">
                            <label className="form-label">Waktu (cth: 06.00)</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="06.00"
                              value={newRdTime}
                              onChange={(e) => setNewRdTime(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Nama Agenda / Kegiatan</label>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Kumpul & Briefing"
                              value={newRdTitle}
                              onChange={(e) => setNewRdTitle(e.target.value)}
                              disabled={loading}
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Keterangan / Lokasi Agenda</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="SPBU Pertamina Pasti Pas, MT Haryono Jakarta"
                            value={newRdDesc}
                            onChange={(e) => setNewRdDesc(e.target.value)}
                            disabled={loading}
                          />
                        </div>

                        <button type="submit" className="btn btn-secondary" style={{ display: 'flex', gap: '6px', justifyContent: 'center', width: '100%' }} disabled={loading}>
                          <Plus style={{ width: '16px' }} /> Tambah Agenda Rundown
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating SOS Button */}
      <div className="sos-fab-container">
        <button className="sos-fab" onClick={() => setIsSosOpen(true)}>
          <div className="sos-ripple"></div>
          <ShieldAlert style={{ width: '28px', height: '28px' }} />
        </button>
      </div>

      {/* SOS Modal Dialog */}
      {isSosOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <ShieldAlert /> DARURAT (SOS)
            </h3>
            <p className="modal-desc">
              Kirimkan koordinat lokasi GPS Anda secara instan ke kontak panitia melalui WhatsApp.
            </p>

            <div className="form-group">
              <label className="form-label">Pilih Responden Darurat:</label>
              <div className="radio-group">
                <div 
                  className={`radio-card ${sosContact === 'mekanik' ? 'selected' : ''}`}
                  onClick={() => setSosContact('mekanik')}
                  style={{ padding: '8px' }}
                >
                  <strong>{eventDetails?.contacts?.mekanik?.name || INITIAL_EVENT.contacts.mekanik.name}</strong>
                  <span style={{ fontSize: '0.7rem' }}>WA: {eventDetails?.contacts?.mekanik?.whatsapp || INITIAL_EVENT.contacts.mekanik.whatsapp}</span>
                </div>
                <div 
                  className={`radio-card ${sosContact === 'sweeper' ? 'selected' : ''}`}
                  onClick={() => setSosContact('sweeper')}
                  style={{ padding: '8px' }}
                >
                  <strong>{eventDetails?.contacts?.sweeper?.name || INITIAL_EVENT.contacts.sweeper.name}</strong>
                  <span style={{ fontSize: '0.7rem' }}>WA: {eventDetails?.contacts?.sweeper?.whatsapp || INITIAL_EVENT.contacts.sweeper.whatsapp}</span>
                </div>
              </div>
            </div>

            <div className="gps-info" style={{ marginBottom: '20px', padding: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Koordinat akan dikirim:</div>
              <strong style={{ fontSize: '0.85rem' }}>{gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}</strong>
              {isMockGps && <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '4px' }}>*Menggunakan lokasi simulasi</div>}
            </div>

            <div className="modal-actions">
              <button className="btn btn-danger" onClick={triggerSos}>
                KIRIM PESAN LOKASI (WA)
              </button>
              <button className="btn btn-secondary" onClick={() => setIsSosOpen(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Tab Bar */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Compass />
          <span>Dashboard</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'route' ? 'active' : ''}`}
          onClick={() => setActiveTab('route')}
        >
          <Navigation />
          <span>Rute</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'rsvp' ? 'active' : ''}`}
          onClick={() => setActiveTab('rsvp')}
        >
          <Users />
          <span>RSVP</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          <CheckSquare />
          <span>Checklist</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'checkpoint' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkpoint')}
        >
          <MapPin />
          <span>Check-in</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <Shield />
          <span>Admin</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
