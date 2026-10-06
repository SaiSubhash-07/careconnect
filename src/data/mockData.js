export const mockSeniors = [
  {
    id: 'senior-001',
    name: 'Ravi Kumar',
    preferredName: 'Ravi ji',
    age: 74,
    gender: 'Male',
    bloodGroup: 'B+',
    pin: '1234',
    phone: '+91 98450 12345',
    address: 'Flat 402, Green Meadows, MG Road',
    locationDetails: 'Tower B, 4th Floor, Lift available',
    gpsCoords: { lat: 12.9716, lng: 77.5946 },
    avatar: '👴',
    healthConditions: ['Hypertension (BP)', 'Mild Arthritis', 'Type-2 Diabetes'],
    familyContacts: [
      {
        id: 'fam-1',
        name: 'Ananya Kumar',
        relation: 'Daughter',
        phone: '+91 98765 43210',
        isPrimary: true,
        status: 'Online',
        avatar: '👩'
      },
      {
        id: 'fam-2',
        name: 'Rohan Kumar',
        relation: 'Son',
        phone: '+91 98765 11223',
        isPrimary: false,
        status: 'Online',
        avatar: '👨'
      }
    ],
    medications: [
      {
        id: 'med-1',
        name: 'Blood Pressure Medicine',
        dosage: 'Amlodipine 5mg - 1 Tablet',
        time: '9:00 AM',
        instructions: 'Take after breakfast with water',
        icon: '💊',
        status: 'due',
        takenAt: null,
        urgent: true
      },
      {
        id: 'med-2',
        name: 'Diabetes Care',
        dosage: 'Metformin 500mg - 1 Tablet',
        time: '1:00 PM',
        instructions: 'Take right after lunch',
        icon: '💉',
        status: 'upcoming',
        takenAt: null,
        urgent: false
      },
      {
        id: 'med-3',
        name: 'Joint Calcium & Vitamin D3',
        dosage: 'Shelcal 500mg - 1 Tablet',
        time: '8:30 PM',
        instructions: 'Take with warm milk after dinner',
        icon: '🦴',
        status: 'upcoming',
        takenAt: null,
        urgent: false
      }
    ],
    appointments: [
      {
        id: 'apt-1',
        doctorName: 'Dr. Sharma',
        specialty: 'Cardiologist (Heart Specialist)',
        clinicName: 'City Heart Care Clinic',
        address: 'Near Central Park, 2.8 km away',
        time: '4:00 PM Today',
        date: 'Today',
        icon: '🏥',
        phone: '+91 99000 88776',
        needHelpRequested: false,
        escortVolunteer: null,
        notes: 'Routine blood pressure review & ECG follow-up.'
      }
    ]
  },
  {
    id: 'senior-002',
    name: 'Kamala Devi',
    preferredName: 'Kamala Amma',
    age: 79,
    gender: 'Female',
    bloodGroup: 'O+',
    pin: '2345',
    phone: '+91 98450 67890',
    address: 'House 12, Rose Villa, 100ft Road, Indiranagar',
    locationDetails: 'Ground Floor, Near BDA Complex',
    gpsCoords: { lat: 12.9784, lng: 77.6408 },
    avatar: '👵',
    healthConditions: ['Severe Osteoporosis', 'Chronic Asthma', 'Cataracts'],
    familyContacts: [
      {
        id: 'fam-3',
        name: 'Suresh Devi',
        relation: 'Son',
        phone: '+91 98451 98765',
        isPrimary: true,
        status: 'Online',
        avatar: '👨'
      },
      {
        id: 'fam-4',
        name: 'Meera Devi',
        relation: 'Granddaughter',
        phone: '+91 98451 11223',
        isPrimary: false,
        status: 'Online',
        avatar: '👩'
      }
    ],
    medications: [
      {
        id: 'med-4',
        name: 'Asthalin Inhaler',
        dosage: '2 Puffs with Spacer',
        time: '8:30 AM',
        instructions: 'Take before breakfast for breathing ease',
        icon: '💨',
        status: 'due',
        takenAt: null,
        urgent: true
      },
      {
        id: 'med-5',
        name: 'Osteo Bone Calcium D3',
        dosage: 'Calcirol 60k - 1 Sachet with milk',
        time: '2:00 PM',
        instructions: 'Take after lunch once weekly',
        icon: '🦴',
        status: 'upcoming',
        takenAt: null,
        urgent: false
      },
      {
        id: 'med-6',
        name: 'Eye Lubricant Drops',
        dosage: '1 Drop each eye',
        time: '9:00 PM',
        instructions: 'Apply before sleeping for dry eyes',
        icon: '👁️',
        status: 'upcoming',
        takenAt: null,
        urgent: false
      }
    ],
    appointments: [
      {
        id: 'apt-2',
        doctorName: 'Dr. Verma',
        specialty: 'Ophthalmologist (Eye Specialist)',
        clinicName: 'Vision Care Hospital',
        address: 'CMH Road, Indiranagar, 1.2 km away',
        time: '11:30 AM Tomorrow',
        date: 'Tomorrow',
        icon: '👁️',
        phone: '+91 99000 33221',
        needHelpRequested: false,
        escortVolunteer: null,
        notes: 'Pre-surgery evaluation for cataract extraction.'
      }
    ]
  },
  {
    id: 'senior-003',
    name: 'Joseph Fernandes',
    preferredName: 'Uncle Joe',
    age: 82,
    gender: 'Male',
    bloodGroup: 'A+',
    pin: '3456',
    phone: '+91 98450 33445',
    address: 'Villa 8B, Palm Grove Enclave, Koramangala',
    locationDetails: 'Block 4, Gated Security, Ground floor',
    gpsCoords: { lat: 12.9352, lng: 77.6245 },
    avatar: '👴🏻',
    healthConditions: ['Cardiac Arrhythmia', 'Post Knee Surgery Mobility', 'Glaucoma'],
    familyContacts: [
      {
        id: 'fam-5',
        name: 'Maria Fernandes',
        relation: 'Daughter',
        phone: '+91 98452 33221',
        isPrimary: true,
        status: 'Online',
        avatar: '👩'
      },
      {
        id: 'fam-6',
        name: 'David Fernandes',
        relation: 'Son',
        phone: '+91 98452 55667',
        isPrimary: false,
        status: 'Online',
        avatar: '👨'
      }
    ],
    medications: [
      {
        id: 'med-7',
        name: 'EcoSprin 75mg Blood Thinner',
        dosage: '75mg - 1 Tablet with water',
        time: '9:00 AM',
        instructions: 'Cardiologist prescribed, take after breakfast',
        icon: '❤️',
        status: 'due',
        takenAt: null,
        urgent: true
      },
      {
        id: 'med-8',
        name: 'Metoprolol Tartrate',
        dosage: '25mg - 1 Tablet',
        time: '1:30 PM',
        instructions: 'Heart rate regulation after lunch',
        icon: '💊',
        status: 'upcoming',
        takenAt: null,
        urgent: false
      }
    ],
    appointments: [
      {
        id: 'apt-3',
        doctorName: 'Dr. Rao',
        specialty: 'Orthopedic Surgeon (Joint Care)',
        clinicName: 'St. John\'s Specialty Center',
        address: 'Sarjapur Main Road, 2.1 km away',
        time: '3:15 PM Friday',
        date: 'Friday',
        icon: '🏥',
        phone: '+91 99000 77665',
        needHelpRequested: true,
        escortVolunteer: null,
        notes: '6-month knee mobility assessment and physiotherapy plan.'
      }
    ]
  },
  {
    id: 'senior-004',
    name: 'Meenakshi Sundaram',
    preferredName: 'Meenakshi Ammal',
    age: 71,
    gender: 'Female',
    bloodGroup: 'AB+',
    pin: '4567',
    phone: '+91 98450 77889',
    address: 'Plot 55, Lakeview Residency, 9th Main, Jayanagar',
    locationDetails: 'Flat 101, 1st Floor with ramp entrance',
    gpsCoords: { lat: 12.9250, lng: 77.5938 },
    avatar: '👵🏽',
    healthConditions: ['Early Parkinson\'s Tremor', 'High Cholesterol', 'Mild Vertigo'],
    familyContacts: [
      {
        id: 'fam-7',
        name: 'Karthik Sundaram',
        relation: 'Son',
        phone: '+91 98453 77889',
        isPrimary: true,
        status: 'Online',
        avatar: '👨'
      },
      {
        id: 'fam-8',
        name: 'Lakshmi Sundaram',
        relation: 'Daughter',
        phone: '+91 98453 22446',
        isPrimary: false,
        status: 'Online',
        avatar: '👩'
      }
    ],
    medications: [
      {
        id: 'med-9',
        name: 'Syndopa 110mg (Parkinson Support)',
        dosage: '1 Tablet with water',
        time: '8:00 AM',
        instructions: 'Take 30 mins before breakfast',
        icon: '🧠',
        status: 'due',
        takenAt: null,
        urgent: true
      },
      {
        id: 'med-10',
        name: 'Atorvastatin 20mg (Cholesterol)',
        dosage: '1 Tablet before bedtime',
        time: '9:30 PM',
        instructions: 'Take with water at night',
        icon: '💊',
        status: 'upcoming',
        takenAt: null,
        urgent: false
      }
    ],
    appointments: [
      {
        id: 'apt-4',
        doctorName: 'Dr. Nair',
        specialty: 'Neurologist (Brain & Nerve Specialist)',
        clinicName: 'Apollo Neuro Center',
        address: 'Bannerghatta Road, 3.4 km away',
        time: '10:00 AM Thursday',
        date: 'Thursday',
        icon: '🧠',
        phone: '+91 99000 44556',
        needHelpRequested: false,
        escortVolunteer: null,
        notes: 'Hand tremor examination and motor response testing.'
      }
    ]
  }
];

export const initialSeniorData = mockSeniors[0];


export const mockCaregivers = [
  {
    id: 'cg-1',
    name: 'Nurse Sunita Devi',
    role: 'Registered Geriatric Nurse',
    type: 'caregiver',
    phone: '+91 98111 22334',
    distance: '0.8 km',
    distanceMeters: 800,
    etaMinutes: 4,
    rating: 4.9,
    status: 'available',
    avatar: '👩‍⚕️',
    skills: ['First Aid', 'BP Monitoring', 'IV Administration', 'Elder Mobility'],
    rationale: 'Primary registered caregiver assigned to Ravi Kumar.'
  },
  {
    id: 'vol-1',
    name: 'Amit Patel',
    role: 'Community Volunteer & First Responder',
    type: 'volunteer',
    phone: '+91 98222 33445',
    distance: '1.2 km',
    distanceMeters: 1200,
    etaMinutes: 7,
    rating: 4.8,
    status: 'available',
    avatar: '🤝',
    skills: ['Red Cross First Aid', 'Two-wheeler rapid transit', 'Companion care'],
    rationale: 'Volunteer selected because they are available and can reach you in approximately 7 minutes.'
  },
  {
    id: 'vol-2',
    name: 'Priya Nair',
    role: 'Certified Social Worker',
    type: 'volunteer',
    phone: '+91 98333 44556',
    distance: '2.1 km',
    distanceMeters: 2100,
    etaMinutes: 12,
    rating: 4.9,
    status: 'available',
    avatar: '🌸',
    skills: ['Grocery Assistance', 'Hospital Escort', 'Emotional Support'],
    rationale: 'Volunteer selected based on proximity and mobility assistance certification.'
  },
  {
    id: 'ems-108',
    name: '108 Emergency Medical Services',
    role: 'Govt. Ambulance & Rapid Paramedic Unit',
    type: 'ems',
    phone: '108',
    distance: '1.8 km',
    distanceMeters: 1800,
    etaMinutes: 5,
    rating: 5.0,
    status: 'on-standby',
    avatar: '🚑',
    skills: ['Critical Life Support', 'Defibrillator', 'Oxygen Support', 'Hospital Triage'],
    rationale: 'Dispatched directly to City Central Hospital Emergency Ward.'
  }
];

export const initialMedications = [
  {
    id: 'med-1',
    name: 'Blood Pressure Medicine',
    dosage: 'Amlodipine 5mg - 1 Tablet',
    time: '9:00 AM',
    instructions: 'Take after breakfast with water',
    icon: '💊',
    status: 'due', // 'due', 'taken', 'snoozed'
    takenAt: null,
    urgent: true
  },
  {
    id: 'med-2',
    name: 'Diabetes Care',
    dosage: 'Metformin 500mg - 1 Tablet',
    time: '1:00 PM',
    instructions: 'Take right after lunch',
    icon: '💉',
    status: 'upcoming',
    takenAt: null,
    urgent: false
  },
  {
    id: 'med-3',
    name: 'Joint Calcium & Vitamin D3',
    dosage: 'Shelcal 500mg - 1 Tablet',
    time: '8:30 PM',
    instructions: 'Take with warm milk after dinner',
    icon: '🦴',
    status: 'upcoming',
    takenAt: null,
    urgent: false
  }
];

export const initialAppointments = [
  {
    id: 'apt-1',
    doctorName: 'Dr. Sharma',
    specialty: 'Cardiologist (Heart Specialist)',
    clinicName: 'City Heart Care Clinic',
    address: 'Near Central Park, 2.8 km away',
    time: '4:00 PM Today',
    date: 'Today',
    icon: '🏥',
    phone: '+91 99000 88776',
    needHelpRequested: false,
    escortVolunteer: null,
    notes: 'Routine blood pressure review & ECG follow-up.'
  },
  {
    id: 'apt-2',
    doctorName: 'Dr. Verma',
    specialty: 'Eye Care (Ophthalmologist)',
    clinicName: 'Vision Eye Center',
    address: 'Indiranagar 1st Stage',
    time: '11:30 AM',
    date: 'Friday, Sept 22',
    icon: '👁️',
    phone: '+91 99000 33221',
    needHelpRequested: false,
    escortVolunteer: null,
    notes: 'Cataract checkup & vision test.'
  }
];

export const helpCategories = [
  {
    id: 'grocery',
    title: 'Grocery',
    icon: '🛒',
    color: 'bg-emerald-500',
    description: 'Fresh vegetables, fruits, milk & daily household items'
  },
  {
    id: 'medicine_pickup',
    title: 'Medicine Pickup',
    icon: '💊',
    color: 'bg-indigo-500',
    description: 'Prescription pickup from local pharmacy'
  },
  {
    id: 'walking',
    title: 'Walking Assistance',
    icon: '🚶',
    color: 'bg-amber-500',
    description: 'Companion for evening walk in the park or balcony'
  },
  {
    id: 'hospital_visit',
    title: 'Hospital Visit',
    icon: '🏥',
    color: 'bg-rose-500',
    description: 'Assistance and ride to clinic or diagnostic center'
  },
  {
    id: 'food',
    title: 'Food',
    icon: '🍱',
    color: 'bg-orange-500',
    description: 'Hot home-cooked meal or diet-friendly meal delivery'
  },
  {
    id: 'household',
    title: 'Household Help',
    icon: '🏠',
    color: 'bg-cyan-500',
    description: 'Light repairs, changing bulbs, moving items'
  },
  {
    id: 'talk',
    title: 'Someone to Talk To',
    icon: '📞',
    color: 'bg-purple-500',
    description: 'Friendly chat, chai companionship, reducing loneliness'
  }
];

export const initialHelpRequests = [
  {
    id: 'req-101',
    category: 'grocery',
    title: 'Grocery Supplies',
    seniorName: 'Ravi Kumar',
    address: 'Flat 402, Green Meadows',
    distance: '1.2 km',
    priority: 'NORMAL',
    details: 'Need 1 liter low-fat milk and whole wheat bread from nearby store.',
    status: 'accepted', // 'pending', 'accepted', 'in_progress', 'completed'
    assignedHelper: {
      name: 'Priya Nair',
      role: 'Community Volunteer',
      phone: '+91 98333 44556',
      etaMinutes: 15
    },
    requestedAt: '10:15 AM Today'
  }
];

export const defaultUserProfiles = {
  senior: {
    id: 'senior-001',
    name: 'Ravi Kumar',
    preferredName: 'Ravi ji',
    role: 'senior',
    roleTitle: 'Senior Citizen',
    avatar: '👴',
    phone: '+91 98450 12345',
    address: 'Flat 402, Green Meadows, MG Road'
  },
  family: {
    id: 'fam-1',
    name: 'Ananya Kumar',
    role: 'family',
    roleTitle: 'Daughter / Primary Guardian',
    avatar: '👩',
    phone: '+91 98765 43210',
    relation: 'Daughter'
  },
  caregiver: {
    id: 'cg-1',
    name: 'Nurse Sunita Devi',
    role: 'caregiver',
    roleTitle: 'Registered Geriatric Nurse',
    avatar: '👩‍⚕️',
    phone: '+91 98111 22334',
    type: 'caregiver',
    badgeId: 'RN-KA-88421'
  },
  volunteer: {
    id: 'vol-1',
    name: 'Amit Patel',
    role: 'caregiver',
    roleTitle: 'Community First Responder',
    avatar: '🤝',
    phone: '+91 98222 33445',
    type: 'volunteer',
    badgeId: 'VOL-BLR-094'
  },
  admin: {
    id: 'admin-001',
    name: 'Dr. A. K. Varma',
    role: 'admin',
    roleTitle: 'Master System Administrator',
    avatar: '🛡️',
    phone: '+91 99000 00001',
    email: 'admin@careconnect.org',
    badgeId: 'SYS-ADMIN-MASTER'
  }
};
