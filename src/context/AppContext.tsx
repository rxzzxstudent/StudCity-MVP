'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, UserProfile, Category, VenueOffer, StudentCode, RedemptionLog, B2BMetrics, StudentTab, MapSpot, MapSpotCategory } from '@/types';
import { INITIAL_MAP_SPOTS } from '@/components/map/spotsData';
import { trackEvent, trackRedemption, trackUserSpot } from '@/lib/analytics';

export type SortOption = 'popular' | 'discount' | 'distance' | 'expiring';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  role: Role;
  setRole: (role: Role) => void;
  studentTab: StudentTab;
  setStudentTab: (tab: StudentTab) => void;
  viewMode: 'mobile-frame' | 'responsive';
  setViewMode: (mode: 'mobile-frame' | 'responsive') => void;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  selectedCluster: string;
  setSelectedCluster: (cluster: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  offers: VenueOffer[];
  updateVenueOffer: (offerId: string, partial: Partial<VenueOffer>) => void;
  mapSpots: MapSpot[];
  addMapSpot: (spot: Omit<MapSpot, 'id'>) => void;
  deleteMapSpot: (id: string) => void;
  activeMapFilters: MapSpotCategory[];
  toggleMapFilter: (cat: MapSpotCategory) => void;
  setAllMapFilters: (cats: MapSpotCategory[]) => void;
  selectedMapSpot: MapSpot | null;
  setSelectedMapSpot: (spot: MapSpot | null) => void;
  activeStudentCode: StudentCode | null;
  activeOfferForQr: VenueOffer | null;
  openQrModal: (offer: VenueOffer) => void;
  closeQrModal: () => void;
  generateNewCode: () => void;
  codeTimeRemaining: number;
  urboHappyHoursActive: boolean;
  setUrboHappyHoursActive: (active: boolean) => void;
  toggleUrboHappyHours: () => void;
  b2bMetrics: B2BMetrics;
  redemptionLogs: RedemptionLog[];
  validateCode: (codeToValidate: string, targetVenueId?: string) => { success: boolean; message: string; codeData?: StudentCode };
  lastValidatedCode: { success: boolean; message: string; codeData?: StudentCode } | null;
  clearLastValidation: () => void;
  resetDemoData: () => void;
}

const INITIAL_OFFERS: VenueOffer[] = [
  {
    id: 'taza-doner-combo',
    name: 'Taza Doner & Grill',
    category: 'food',
    categoryLabel: 'Обед и гриль',
    address: 'ул. Байтурсынова, 126 (возле Polytech / МУИТ)',
    distance: '80 м от кампуса',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Сытный комбо-обед (Донер + фри + напиток) за 1 200 ₸',
    description: 'Горячий фирменный донер с курицей или говядиной, хрустящий картофель фри и фирменный айран/кола строго в тихие часы с 14:00 до 16:30.',
    originalPrice: 1900,
    discountedPrice: 1200,
    discountPercent: 37,
    happyHoursActive: true,
    happyHoursEnd: '16:30',
    quietHoursWindow: '14:00 – 16:30',
    remainingSeconds: 6120,
    slotsRemaining: 8,
    totalSlots: 15,
    groupDiscountText: 'Вдвоем еще дешевле: по 1 000 ₸ с человека',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80',
    iconName: 'Utensils',
    isControlledByCashier: true,
    phone: '+7 701 555 3421',
    badge: '14:00–16:30 • Спец-ланч',
  },
  {
    id: 'iron-gym-almaty',
    name: 'Iron Fitness & Cross Club',
    category: 'fitness',
    categoryLabel: 'Спорт и фитнес',
    address: 'ул. Сатпаева, 90/2 (Кластер кампусов)',
    distance: '250 м от Polytech / КазНУ',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Разовый дневной проход в тренажерный зал за 1 500 ₸',
    description: 'Полный безлимитный доступ ко всем силовым и кардио-зонам, душевым и сауне в непиковое окно зала с 11:00 до 16:00.',
    originalPrice: 3000,
    discountedPrice: 1500,
    discountPercent: 50,
    happyHoursActive: true,
    happyHoursEnd: '16:00',
    quietHoursWindow: '11:00 – 16:00',
    remainingSeconds: 8400,
    slotsRemaining: 5,
    totalSlots: 10,
    groupDiscountText: 'Приходи с напарником — по 1 300 ₸ за каждого',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    iconName: 'Sparkles',
    isControlledByCashier: false,
    phone: '+7 777 888 4411',
    badge: 'Дневной непик • 1 500 ₸',
  },
  {
    id: 'coffeemoon-cafe',
    name: 'Coffee Moon — Cafe & Wine',
    category: 'coffee',
    categoryLabel: 'Кафе и бар',
    address: 'ул. Манаса, 51',
    distance: '150 м от МУИТ / Polytech',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Любой лимонад/айс ти в подарок к любому блюду',
    description: 'Coffee Moon Cafe & Wine на Манаса 51 — партнер Nooki! Подарок для гостей: любой авторский лимонад или освежающий айс ти к любому блюду из меню.',
    originalPrice: 2800,
    discountedPrice: 1600,
    discountPercent: 40,
    happyHoursActive: true,
    happyHoursEnd: '21:00',
    quietHoursWindow: '14:00 – 21:00',
    remainingSeconds: 16800,
    slotsRemaining: 12,
    totalSlots: 20,
    groupDiscountText: 'Компаниям от 2-х человек — десерт в подарок',
    image: '/partners/coffeemoon.webp',
    iconName: 'Coffee',
    isControlledByCashier: true,
    phone: '+7 708 180 2182',
    badge: 'Манаса, 51 • Подарок к блюду',
  },
  {
    id: 'smart-service',
    name: 'Smart Service',
    category: 'service',
    categoryLabel: 'Ремонт и сервис',
    address: 'проспект Абая, 52В, офис 320 (БЦ Bayzak, 3 этаж)',
    distance: '200 м от Polytech / МУИТ',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Скидка 10-20% на ремонт ноутбуков, чистку и сервис ПК',
    description: 'Smart Service — продажа, ремонт и обслуживание ноутбуков и компьютеров в Алматы. Скидка 10-20% на услуги сервис-центра для пользователей Nooki.',
    originalPrice: 6000,
    discountedPrice: 4800,
    discountPercent: 20,
    happyHoursActive: true,
    happyHoursEnd: '19:00',
    quietHoursWindow: '10:00 – 19:00',
    remainingSeconds: 13500,
    slotsRemaining: 6,
    totalSlots: 8,
    image: '/partners/smartservice.webp',
    iconName: 'Laptop',
    isControlledByCashier: false,
    website: 'https://smartservice.kz',
    mapUrl: 'https://yandex.kz/maps/ru/-/CHb34OK1',
    phone: '+7 (707) 320-52-00',
    badge: 'SMARTSERVICE.KZ',
  },
  {
    id: 'de-tulp-pancakes',
    name: 'De Tulp Dutch Pancake House',
    category: 'dessert',
    categoryLabel: 'Кафе и десерты',
    address: 'ул. Жибек Жолы, 53 (Зеленый Базар)',
    distance: '350 м от КБТУ (Арбат)',
    cluster: 'Кластер Толе би — Абылай хана (КБТУ/КазНАУ)',
    title: 'Скидка 10% на все традиционные голландские панкейки',
    description: 'Traditional Dutch Pancake House в историческом центре Алматы. Аутентичные голландские панкейки, кофе и десерты со скидкой 10% для гостей Nooki.',
    originalPrice: 2800,
    discountedPrice: 2520,
    discountPercent: 10,
    happyHoursActive: true,
    happyHoursEnd: '18:00',
    quietHoursWindow: '12:00 – 18:00',
    remainingSeconds: 9600,
    slotsRemaining: 9,
    totalSlots: 15,
    groupDiscountText: 'Вдвоем чайник чая в подарок к комбо',
    image: '/partners/de-tulp.webp',
    iconName: 'Utensils',
    isControlledByCashier: false,
    instagram: 'https://instagram.com/de_tulp_kazakhstan',
    phone: '+7 707 730 0810',
    badge: '@de_tulp_kazakhstan',
  },
  {
    id: 'sandi-cakes',
    name: 'Sandi Cakes',
    category: 'dessert',
    categoryLabel: 'Кондитерская / Бенто',
    address: 'ул. Сатпаева / район студенческих кампусов',
    distance: '120 м от кампуса',
    cluster: 'Кластер Сатпаева — Байтурсынова',
    title: 'Комбо «Кофе + пирожное за 1 800 ₸» или -10% на бенто-торты',
    description: 'Любимые бенто-торты на праздники и дни рождения. Специальное комбо «Кофе + пирожное» с 12:00 до 16:00 со скидкой!',
    originalPrice: 2500,
    discountedPrice: 1800,
    discountPercent: 28,
    happyHoursActive: true,
    happyHoursEnd: '16:00',
    quietHoursWindow: '12:00 – 16:00',
    remainingSeconds: 2700,
    slotsRemaining: 4,
    totalSlots: 10,
    image: '/partners/sandi-cakes.webp',
    iconName: 'Coffee',
    isControlledByCashier: false,
    phone: '+7 777 555 1234',
    badge: 'С 12:00 до 16:00',
  },
  {
    id: 'torte-studio-atakent',
    name: 'Torte Studio (Атакент)',
    category: 'dessert',
    categoryLabel: 'Торты и сладости',
    address: 'Район Атакент / ул. Тимирязева, 42',
    distance: '200 м от кампуса КазНУ',
    cluster: 'Кампус КазНУ (ГУК)',
    title: 'Скидка 10% на авторские торты и клубнику в шоколаде',
    description: 'Свадебные и тематические торты с индивидуальным дизайном, свежая клубника в шоколаде @leila_strawberry со скидкой 10%.',
    originalPrice: 5000,
    discountedPrice: 4500,
    discountPercent: 10,
    happyHoursActive: true,
    happyHoursEnd: '20:00',
    quietHoursWindow: '10:00 – 20:00',
    remainingSeconds: 15400,
    slotsRemaining: 7,
    totalSlots: 12,
    image: '/partners/torte-studio.webp',
    iconName: 'Sparkles',
    isControlledByCashier: false,
    instagram: 'https://instagram.com/aigerim_saduakasovna',
    phone: '+7 776 712 1998',
    badge: '@aigerim_saduakasovna',
  },
  {
    id: 'spirit-coffee',
    name: 'Spirit coffee',
    category: 'coffee',
    categoryLabel: 'Кофе и напитки',
    address: 'ул. Жарокова, 289',
    distance: 'Бостандыкский р-н (Жарокова)',
    cluster: 'Кампус КазНУ (ГУК)',
    title: 'Скидка 15% на все напитки',
    description: 'Spirit coffee на Жарокова 289 — уютная кофейня со свежеобжаренным спешелти кофе. Скидка 15% на все кофейные, сезонные и авторские напитки по QR-купону Nooki.',
    originalPrice: 1600,
    discountedPrice: 1360,
    discountPercent: 15,
    happyHoursActive: true,
    happyHoursEnd: '22:00',
    quietHoursWindow: '08:00 – 22:00',
    remainingSeconds: 21600,
    slotsRemaining: 14,
    totalSlots: 20,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    iconName: 'Coffee',
    isControlledByCashier: false,
    badge: 'Жарокова, 289 • Скидка 15%',
  },
];

const INITIAL_LOGS: RedemptionLog[] = [
  {
    id: 'log-1',
    code: 'ST-3190',
    venueName: 'Coffee Moon — Cafe & Wine',
    studentUni: 'КазНУ им. аль-Фараби',
    amount: 1600,
    savedAmount: 1200,
    timestamp: '14:48',
  },
  {
    id: 'log-2',
    code: 'ST-8812',
    venueName: 'Coffee Moon — Cafe & Wine',
    studentUni: 'Satbayev University',
    amount: 1600,
    savedAmount: 1200,
    timestamp: '14:25',
  },
  {
    id: 'log-3',
    code: 'ST-5044',
    venueName: 'Smart Service',
    studentUni: 'МУИТ (IITU)',
    amount: 4800,
    savedAmount: 1200,
    timestamp: '13:50',
  },
];

const INITIAL_METRICS: B2BMetrics = {
  studentsToday: 14,
  additionalRevenue: 18200,
  repeatConversionPercent: 28,
  currentCapacity: 22,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [pendingOfferToClaim, setPendingOfferToClaim] = useState<VenueOffer | null>(null);
  const [role, setRole] = useState<Role>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('offers');
  const [viewMode, setViewMode] = useState<'mobile-frame' | 'responsive'>('responsive');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedCluster, setSelectedCluster] = useState<string>('Кластер Сатпаева — Байтурсынова');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Map state
  const [mapSpots, setMapSpots] = useState<MapSpot[]>(INITIAL_MAP_SPOTS);
  const [activeMapFilters, setActiveMapFilters] = useState<MapSpotCategory[]>([
    'toilet',
    'wifi',
    'outlet',
    'deal',
    'print',
  ]);
  const [selectedMapSpot, setSelectedMapSpot] = useState<MapSpot | null>(null);

  // Load user spots and auth from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAuth = localStorage.getItem('nooki_auth_user');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed && typeof parsed === 'object') {
            const sanitizedUser: UserProfile = {
              id: parsed.id || `usr_${Date.now()}`,
              email: parsed.email || parsed.displayName || 'user',
              displayName: parsed.displayName || parsed.email || 'Пользователь',
              role: parsed.role === 'cashier' ? 'cashier' : 'student',
              venueName: parsed.venueName,
            };
            setCurrentUser(sanitizedUser);
            setRole(sanitizedUser.role);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const handleSetCurrentUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('nooki_auth_user', JSON.stringify(user));
        setRole(user.role);
        if (pendingOfferToClaim) {
          const offerToClaim = pendingOfferToClaim;
          setPendingOfferToClaim(null);
          setTimeout(() => {
            openQrModal(offerToClaim);
          }, 300);
        }
      } else {
        localStorage.removeItem('nooki_auth_user');
        setRole('student');
      }
    }
  };

  const logout = () => {
    handleSetCurrentUser(null);
  };

  // Load user spots from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nooki_user_spots') || localStorage.getItem('studcity_user_spots');
        if (saved) {
          const parsed: MapSpot[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMapSpots([...INITIAL_MAP_SPOTS, ...parsed]);
          }
        }
      } catch {
        // ignore JSON parse error
      }
    }
  }, []);

  const addMapSpot = (spotData: Omit<MapSpot, 'id'>) => {
    const newSpot: MapSpot = {
      ...spotData,
      id: `user-spot-${Date.now()}`,
      isUserAdded: true,
    };
    setMapSpots((prev) => {
      const updated = [newSpot, ...prev];
      if (typeof window !== 'undefined') {
        try {
          const userAddedOnly = updated.filter((s) => s.isUserAdded);
          localStorage.setItem('nooki_user_spots', JSON.stringify(userAddedOnly));
        } catch (err) {
          console.warn('[LocalStorage Warning] Quota exceeded or error saving spots:', err);
        }
      }
      return updated;
    });

    // Sync spot to server/Google Sheets for crowd-sourced map
    trackUserSpot({
      title: spotData.title,
      category: spotData.category,
      address: spotData.address,
      isFree: spotData.isFree,
      priceInfo: spotData.priceInfo,
      lat: spotData.lat,
      lng: spotData.lng,
    });
  };

  const deleteMapSpot = (id: string) => {
    setMapSpots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined') {
        try {
          const userAddedOnly = updated.filter((s) => s.isUserAdded);
          localStorage.setItem('nooki_user_spots', JSON.stringify(userAddedOnly));
        } catch (err) {
          console.warn('[LocalStorage Warning]:', err);
        }
      }
      return updated;
    });
    if (selectedMapSpot?.id === id) {
      setSelectedMapSpot(null);
    }
  };

  const toggleMapFilter = (category: MapSpotCategory) => {
    setActiveMapFilters((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const setAllMapFilters = (categories: MapSpotCategory[]) => {
    setActiveMapFilters(categories);
  };

  const [urboHappyHoursActive, setUrboHappyHoursActive] = useState<boolean>(true);
  const [offers, setOffers] = useState<VenueOffer[]>(INITIAL_OFFERS);

  const [activeOfferForQr, setActiveOfferForQr] = useState<VenueOffer | null>(null);
  const [activeStudentCode, setActiveStudentCode] = useState<StudentCode | null>(null);
  const [codeTimeRemaining, setCodeTimeRemaining] = useState<number>(30);

  const [b2bMetrics, setB2bMetrics] = useState<B2BMetrics>(INITIAL_METRICS);
  const [redemptionLogs, setRedemptionLogs] = useState<RedemptionLog[]>(INITIAL_LOGS);
  const [lastValidatedCode, setLastValidatedCode] = useState<{
    success: boolean;
    message: string;
    codeData?: StudentCode;
  } | null>(null);

  // Sync Cashier Happy hours toggle for Coffee Moon
  useEffect(() => {
    setOffers((prevOffers) =>
      prevOffers.map((off) =>
        off.id === 'coffeemoon-cafe'
          ? { ...off, happyHoursActive: urboHappyHoursActive }
          : off
      )
    );
  }, [urboHappyHoursActive]);

  // Global Happy Hours countdown ticker for offers
  useEffect(() => {
    const timer = setInterval(() => {
      setOffers((prev) =>
        prev.map((off) => {
          const nextSec = Math.max(0, off.remainingSeconds - 1);
          const isSlotActive = nextSec > 0 && (off.id === 'coffeemoon-cafe' ? urboHappyHoursActive : off.happyHoursActive);
          return {
            ...off,
            remainingSeconds: nextSec,
            happyHoursActive: isSlotActive,
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [urboHappyHoursActive]);

  // 300s (5-min) countdown for active student PIN/QR code
  useEffect(() => {
    let qrTimer: NodeJS.Timeout;
    if (activeStudentCode && codeTimeRemaining > 0) {
      qrTimer = setInterval(() => {
        setCodeTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (qrTimer) clearInterval(qrTimer);
    };
  }, [activeStudentCode, codeTimeRemaining]);

  // 3. PIN Registry to ensure only real, non-expired, non-redeemed PINs can be redeemed
  const [issuedPins, setIssuedPins] = useState<Array<{
    code: string;
    venueId: string;
    venueName: string;
    discountPercent: number;
    finalPrice: number;
    originalPrice: number;
    expiresAt: number;
    isRedeemed: boolean;
  }>>([
    {
      code: '7492',
      venueId: 'coffeemoon-cafe',
      venueName: 'Coffee Moon — Cafe & Wine',
      discountPercent: 40,
      finalPrice: 1600,
      originalPrice: 2800,
      expiresAt: Date.now() + 86400 * 1000,
      isRedeemed: false,
    },
    {
      code: '4821',
      venueId: 'taza-doner-combo',
      venueName: 'Taza Doner & Grill',
      discountPercent: 37,
      finalPrice: 1200,
      originalPrice: 1900,
      expiresAt: Date.now() + 86400 * 1000,
      isRedeemed: false,
    },
    {
      code: '5044',
      venueId: 'smart-service',
      venueName: 'Smart Service',
      discountPercent: 20,
      finalPrice: 4800,
      originalPrice: 6000,
      expiresAt: Date.now() + 86400 * 1000,
      isRedeemed: false,
    },
  ]);

  // Load issued pins from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nooki_issued_pins');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setIssuedPins((prev) => [...parsed, ...prev.filter((p) => !parsed.some((x: any) => x.code === p.code))]);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveIssuedPin = (record: {
    code: string;
    venueId: string;
    venueName: string;
    discountPercent: number;
    finalPrice: number;
    originalPrice: number;
    expiresAt: number;
    isRedeemed: boolean;
  }) => {
    setIssuedPins((prev) => {
      const updated = [record, ...prev.filter((p) => p.code !== record.code)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nooki_issued_pins', JSON.stringify(updated.slice(0, 50)));
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const generateRandomCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${num}`;
  };

  const openQrModal = (offer: VenueOffer) => {
    if (!currentUser) {
      setPendingOfferToClaim(offer);
      setAuthModalOpen(true);
      return;
    }

    setActiveOfferForQr(offer);
    const codeStr = generateRandomCode();
    const newCode: StudentCode = {
      code: codeStr,
      venueId: offer.id,
      venueName: offer.name,
      discountPercent: offer.discountPercent,
      finalPrice: offer.discountedPrice,
      originalPrice: offer.originalPrice,
      createdAt: Date.now(),
      expiresInSeconds: 300,
      studentName: currentUser.displayName || 'Пользователь Nooki',
      studentUni: currentUser.role === 'cashier' ? 'Бизнес партнер' : 'Пользователь Nooki',
      isValid: true,
    };
    setActiveStudentCode(newCode);
    setCodeTimeRemaining(300);

    // Register PIN in the verified active registry
    saveIssuedPin({
      code: codeStr,
      venueId: offer.id,
      venueName: offer.name,
      discountPercent: offer.discountPercent,
      finalPrice: offer.discountedPrice,
      originalPrice: offer.originalPrice,
      expiresAt: Date.now() + 300 * 1000,
      isRedeemed: false,
    });

    trackEvent('pin_generated', {
      venueId: offer.id,
      offerId: offer.id,
      amount: offer.discountedPrice,
      metadata: { venueName: offer.name, discountPercent: offer.discountPercent, pin: newCode.code },
    });
  };

  const closeQrModal = () => {
    setActiveOfferForQr(null);
  };

  const generateNewCode = () => {
    if (!activeOfferForQr) return;
    const codeStr = generateRandomCode();
    const newCode: StudentCode = {
      code: codeStr,
      venueId: activeOfferForQr.id,
      venueName: activeOfferForQr.name,
      discountPercent: activeOfferForQr.discountPercent,
      finalPrice: activeOfferForQr.discountedPrice,
      originalPrice: activeOfferForQr.originalPrice,
      createdAt: Date.now(),
      expiresInSeconds: 300,
      studentName: 'Алихан Сейткали',
      studentUni: 'КазНУ им. аль-Фараби',
      isValid: true,
    };
    setActiveStudentCode(newCode);
    setCodeTimeRemaining(300);

    saveIssuedPin({
      code: codeStr,
      venueId: activeOfferForQr.id,
      venueName: activeOfferForQr.name,
      discountPercent: activeOfferForQr.discountPercent,
      finalPrice: activeOfferForQr.discountedPrice,
      originalPrice: activeOfferForQr.originalPrice,
      expiresAt: Date.now() + 300 * 1000,
      isRedeemed: false,
    });
  };

  const toggleUrboHappyHours = () => {
    setUrboHappyHoursActive((prev) => !prev);
  };

  const validateCode = (codeToValidate: string, targetVenueId?: string) => {
    const raw = codeToValidate.trim().toUpperCase();
    const cleanDigits = raw.replace(/[^0-9]/g, '');
    if (!raw || cleanDigits.length < 4) {
      const res = { success: false, message: 'Пожалуйста, введите 4-значный PIN код (например, 7492)' };
      setLastValidatedCode(res);
      return res;
    }

    const pinInput = cleanDigits.slice(0, 4);
    const targetOffer = offers.find((o) => o.id === (targetVenueId || 'coffeemoon-cafe')) || offers[0];

    // Look up PIN in authentic registry
    const registeredPin =
      issuedPins.find((p) => p.code === pinInput) ||
      (activeStudentCode && activeStudentCode.code === pinInput
        ? {
            code: activeStudentCode.code,
            venueId: activeStudentCode.venueId,
            venueName: activeStudentCode.venueName,
            discountPercent: activeStudentCode.discountPercent,
            finalPrice: activeStudentCode.finalPrice,
            originalPrice: activeStudentCode.originalPrice,
            expiresAt: activeStudentCode.createdAt + 300 * 1000,
            isRedeemed: false,
          }
        : null);

    // 1. PIN NOT FOUND (e.g. user typed random numbers 0000, 1234, 9999)
    if (!registeredPin) {
      const res = {
        success: false,
        message: `PIN-код «${pinInput}» не найден в системе Nooki. Убедитесь, что гость сгенерировал его на сайте или в Telegram-боте.`,
      };
      setLastValidatedCode(res);
      return res;
    }

    // 2. PIN ALREADY REDEEMED (Prevent double spending)
    if (registeredPin.isRedeemed) {
      const res = {
        success: false,
        message: `PIN-код «${pinInput}» уже был погашен на кассе ранее и больше недействителен!`,
      };
      setLastValidatedCode(res);
      return res;
    }

    // 3. PIN EXPIRED (5-min window)
    if (Date.now() > registeredPin.expiresAt) {
      const res = {
        success: false,
        message: `Срок действия PIN-кода «${pinInput}» (5 минут) истек. Попросите гостя выпустить новый код.`,
      };
      setLastValidatedCode(res);
      return res;
    }

    // 4. VENUE MISMATCH
    if (targetVenueId && registeredPin.venueId !== targetVenueId) {
      const res = {
        success: false,
        message: `Этот PIN выпущен для заведения «${registeredPin.venueName}», а не для кассы «${targetOffer.name}»!`,
      };
      setLastValidatedCode(res);
      return res;
    }

    // Mark as redeemed in registry
    setIssuedPins((prev) => {
      const updated = prev.map((p) => (p.code === pinInput ? { ...p, isRedeemed: true } : p));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nooki_issued_pins', JSON.stringify(updated.slice(0, 50)));
        } catch {
          // ignore
        }
      }
      return updated;
    });

    if (activeStudentCode && activeStudentCode.code === pinInput) {
      setActiveStudentCode(null);
    }

    const matchedCodeData: StudentCode = {
      code: registeredPin.code,
      venueId: registeredPin.venueId,
      venueName: registeredPin.venueName,
      discountPercent: registeredPin.discountPercent,
      finalPrice: registeredPin.finalPrice,
      originalPrice: registeredPin.originalPrice,
      createdAt: Date.now(),
      expiresInSeconds: 300,
      studentName: 'Горожанин Nooki',
      studentUni: 'Студент / Горожанин',
      isValid: true,
    };

    // Decrement slots remaining on the offer
    setOffers((prev) =>
      prev.map((off) =>
        off.id === matchedCodeData.venueId && typeof off.slotsRemaining === 'number'
          ? { ...off, slotsRemaining: Math.max(0, off.slotsRemaining - 1) }
          : off
      )
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newLog: RedemptionLog = {
      id: `log-${Date.now()}`,
      code: matchedCodeData.code,
      venueName: matchedCodeData.venueName,
      studentUni: matchedCodeData.studentUni,
      amount: matchedCodeData.finalPrice,
      savedAmount: matchedCodeData.originalPrice - matchedCodeData.finalPrice,
      timestamp: timeStr,
    };

    setRedemptionLogs((prev) => [newLog, ...prev]);
    setB2bMetrics((prev) => ({
      ...prev,
      studentsToday: prev.studentsToday + 1,
      additionalRevenue: prev.additionalRevenue + matchedCodeData.finalPrice,
    }));

    trackRedemption({
      code: matchedCodeData.code,
      venueId: matchedCodeData.venueId,
      venueName: matchedCodeData.venueName,
      amount: matchedCodeData.finalPrice,
      savedAmount: matchedCodeData.originalPrice - matchedCodeData.finalPrice,
      originalPrice: matchedCodeData.originalPrice,
    });

    const res = {
      success: true,
      message: `PIN ${matchedCodeData.code} подтвержден в «${matchedCodeData.venueName}»! Скидка -${matchedCodeData.discountPercent}%. К оплате: ${matchedCodeData.finalPrice.toLocaleString()} ₸`,
      codeData: matchedCodeData,
    };

    setLastValidatedCode(res);
    return res;
  };

  const clearLastValidation = () => {
    setLastValidatedCode(null);
  };

  const updateVenueOffer = (offerId: string, partial: Partial<VenueOffer>) => {
    setOffers((prev) =>
      prev.map((off) => (off.id === offerId ? { ...off, ...partial } : off))
    );
  };

  const resetDemoData = () => {
    setOffers(INITIAL_OFFERS);
    setMapSpots(INITIAL_MAP_SPOTS);
    setActiveMapFilters(['toilet', 'wifi', 'outlet', 'deal', 'print']);
    setSelectedMapSpot(null);
    setStudentTab('offers');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nooki_user_spots');
      localStorage.removeItem('studcity_user_spots');
    }
    setUrboHappyHoursActive(true);
    setB2bMetrics(INITIAL_METRICS);
    setRedemptionLogs(INITIAL_LOGS);
    setLastValidatedCode(null);
    setActiveStudentCode(null);
    setActiveOfferForQr(null);
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        logout,
        isAuthModalOpen,
        setAuthModalOpen,
        role,
        setRole,
        studentTab,
        setStudentTab,
        viewMode,
        setViewMode,
        selectedCategory,
        setSelectedCategory,
        selectedCluster,
        setSelectedCluster,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        offers,
        updateVenueOffer,
        mapSpots,
        addMapSpot,
        deleteMapSpot,
        activeMapFilters,
        toggleMapFilter,
        setAllMapFilters,
        selectedMapSpot,
        setSelectedMapSpot,
        activeStudentCode,
        activeOfferForQr,
        openQrModal,
        closeQrModal,
        generateNewCode,
        codeTimeRemaining,
        urboHappyHoursActive,
        setUrboHappyHoursActive,
        toggleUrboHappyHours,
        b2bMetrics,
        redemptionLogs,
        validateCode,
        lastValidatedCode,
        clearLastValidation,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
