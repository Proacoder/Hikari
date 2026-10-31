// ─── Realistic seed data for Kaiser AI mock mode ───────────────────────────

export const MUMBAI_WARDS = [
  { id: 1,  name: 'A Ward',   code: 'A Ward',   zone: 'Zone 1 (Island City)',     area: 'Colaba, Cuffe Parade, Fort, Nariman Point',               ac: 'Shri Jaydeep More', phone: '022-2260-0500', email: 'ac.a@mcgm.gov.in', address: '134, SBS Road, Fort, Mumbai 400001', lat: 18.9067, lng: 72.8280 },
  { id: 2,  name: 'B Ward',   code: 'B Ward',   zone: 'Zone 1 (Island City)',     area: 'Dongri, Mandvi, Sandhurst Road, Umerkhadi',               ac: 'Shri Udaykumar Shiroorkar', phone: '022-2373-6622', email: 'ac.b@mcgm.gov.in', address: '121, Ramchandra Bhatt Marg, Babula Tank, Mumbai 400009', lat: 18.9591, lng: 72.8341 },
  { id: 3,  name: 'C Ward',   code: 'C Ward',   zone: 'Zone 1 (Island City)',     area: 'Girgaon, Bhuleshwar, Marine Lines, Kalbadevi',            ac: 'Shri Chakrapani Alle', phone: '022-2201-4000', email: 'ac.c@mcgm.gov.in', address: '76, Shrikant Palekar Marg, Chandanwadi, Mumbai 400002', lat: 18.9528, lng: 72.8223 },
  { id: 4,  name: 'D Ward',   code: 'D Ward',   zone: 'Zone 1 (Island City)',     area: 'Malabar Hill, Walkeshwar, Grant Road, Tardeo',            ac: 'Shri Sharad Ughade', phone: '022-2386-1426', email: 'ac.d@mcgm.gov.in', address: 'Jobanputra Compound, Nana Chowk, Grant Road, Mumbai 400007', lat: 18.9573, lng: 72.7983 },
  { id: 5,  name: 'E Ward',   code: 'E Ward',   zone: 'Zone 1 (Island City)',     area: 'Byculla, Mazgaon, Mumbai Central, Nagpada',               ac: 'Shri Manish Valanju', phone: '022-2308-1471', email: 'ac.e@mcgm.gov.in', address: '10, Ramchandra Bhatt Marg, Byculla, Mumbai 400008', lat: 18.9752, lng: 72.8367 },
  { id: 6,  name: 'F/N Ward', code: 'F/N Ward', zone: 'Zone 2 (Island City)',     area: 'Matunga, Sion, Wadala (North), King Circle, Antop Hill',   ac: 'Shri Gajanan Bellale', phone: '022-2402-4353', email: 'ac.fn@mcgm.gov.in', address: '96, Bhaudaji Road, Matunga East, Mumbai 400019', lat: 19.0700, lng: 72.8787 },
  { id: 7,  name: 'F/S Ward', code: 'F/S Ward', zone: 'Zone 2 (Island City)',     area: 'Parel, Sewri, Naigaon, Lalbaug, Wadala (South)',          ac: 'Smt. Swapnaja Kshirsagar', phone: '022-2413-4560', email: 'ac.fs@mcgm.gov.in', address: 'Jagannath Bhatankar Marg, Parel, Mumbai 400012', lat: 19.0419, lng: 72.8551 },
  { id: 8,  name: 'G/N Ward', code: 'G/N Ward', zone: 'Zone 2 (Island City)',     area: 'Dadar (West), Dharavi, Mahim, Shivaji Park',              ac: 'Shri Prashant Sapkale', phone: '022-2439-7800', email: 'ac.gn@mcgm.gov.in', address: 'Harishchandra Yelve Marg, Dadar West, Mumbai 400028', lat: 19.0596, lng: 72.8296 },
  { id: 9,  name: 'G/S Ward', code: 'G/S Ward', zone: 'Zone 2 (Island City)',     area: 'Worli, Prabhadevi, Lower Parel, Mahalaxmi Racecourse',    ac: 'Shri Santosh Dhonde', phone: '022-2430-5031', email: 'ac.gs@mcgm.gov.in', address: 'N.M. Joshi Marg, Elphinstone West, Mumbai 40013', lat: 19.0524, lng: 72.8258 },
  { id: 10, name: 'H/E Ward', code: 'H/E Ward', zone: 'Zone 3 (Western Suburbs)', area: 'Santacruz (East), Khar (East), Kalina, Vakola, BKC',     ac: 'Smt. Alka Sasane', phone: '022-2618-2260', email: 'ac.he@mcgm.gov.in', address: 'TPS-V, Prabhat Colony, Santacruz East, Mumbai 400055', lat: 19.0820, lng: 72.8512 },
  { id: 11, name: 'H/W Ward', code: 'H/W Ward', zone: 'Zone 3 (Western Suburbs)', area: 'Bandra (West), Khar (West), Santacruz (West), Carter Road',ac: 'Shri Vinayak Vispute', phone: '022-2642-2311', email: 'ac.hw@mcgm.gov.in', address: 'Saint Martin Road, Bandra West, Mumbai 400050', lat: 19.0987, lng: 72.8440 },
  { id: 12, name: 'K/E Ward', code: 'K/E Ward', zone: 'Zone 3 (Western Suburbs)', area: 'Andheri (East), Jogeshwari (East), Vile Parle (East), MIDC',ac: 'Shri Manish Patel', phone: '022-2684-0103', email: 'ac.ke@mcgm.gov.in', address: 'Gundavali, Azad Road, Andheri East, Mumbai 400069', lat: 19.1152, lng: 72.8680 },
  { id: 13, name: 'K/W Ward', code: 'K/W Ward', zone: 'Zone 4 (Western Suburbs)', area: 'Andheri (West), Juhu, Versova, Lokhandwala, Oshiwara',   ac: 'Shri Prithviraj Chauhan', phone: '022-2623-9131', email: 'ac.kw@mcgm.gov.in', address: 'Paliram Road, Off S.V. Road, Andheri West, Mumbai 400058', lat: 19.1197, lng: 72.8290 },
  { id: 14, name: 'L Ward',   code: 'L Ward',   zone: 'Zone 5 (Eastern Suburbs)', area: 'Kurla (West), Sakinaka, Chandivali, Asalpha, Chunabhatti',ac: 'Shri Mahadev Shinde', phone: '022-2650-5103', email: 'ac.l@mcgm.gov.in', address: 'L.B.S. Marg, Near Kurla Station, Kurla West, Mumbai 400070', lat: 19.0726, lng: 72.8849 },
  { id: 15, name: 'M/E Ward', code: 'M/E Ward', zone: 'Zone 5 (Eastern Suburbs)', area: 'Govandi, Mankhurd, Shivaji Nagar, Trombay, Bainganwadi', ac: 'Shri Mahendra Ubale', phone: '022-2555-8400', email: 'ac.me@mcgm.gov.in', address: 'Deonar Municipal Colony, Govandi West, Mumbai 400043', lat: 19.0426, lng: 72.9159 },
  { id: 16, name: 'M/W Ward', code: 'M/W Ward', zone: 'Zone 5 (Eastern Suburbs)', area: 'Chembur, Tilak Nagar, Mahul, Sindhi Society, Pestom Sagar',ac: 'Shri Vishwas Mote', phone: '022-2528-2000', email: 'ac.mw@mcgm.gov.in', address: 'Sharadbhau Acharya Marg, Chembur, Mumbai 400071', lat: 19.0538, lng: 72.8990 },
  { id: 17, name: 'N Ward',   code: 'N Ward',   zone: 'Zone 6 (Eastern Suburbs)', area: 'Ghatkopar (East & West), Vikhroli (West), Pant Nagar',    ac: 'Shri Sanjay Sonawane', phone: '022-2501-0161', email: 'ac.n@mcgm.gov.in', address: 'Jawahar Road, Ghatkopar East, Mumbai 400077', lat: 19.0868, lng: 72.9083 },
  { id: 18, name: 'P/N Ward', code: 'P/N Ward', zone: 'Zone 4 (Western Suburbs)', area: 'Malad (East & West), Marve, Aksa, Dindoshi, Kurar',       ac: 'Shri Kiran Dighavkar', phone: '022-2882-1666', email: 'ac.pn@mcgm.gov.in', address: 'Liberty Garden, Mamletdarwadi, Malad West, Mumbai 400064', lat: 19.1617, lng: 72.8492 },
  { id: 19, name: 'P/S Ward', code: 'P/S Ward', zone: 'Zone 4 (Western Suburbs)', area: 'Goregaon (East & West), Jogeshwari (West), Aarey Colony',ac: 'Shri Rajesh Akre', phone: '022-2872-1152', email: 'ac.ps@mcgm.gov.in', address: 'S.V. Road, Goregaon West, Mumbai 400104', lat: 19.1392, lng: 72.8499 },
  { id: 20, name: 'R/C Ward', code: 'R/C Ward', zone: 'Zone 7 (Western Suburbs)', area: 'Borivali (West), Gorai, IC Colony, Eksar, Shimpoli',       ac: 'Smt. Bhagyashree Kapse', phone: '022-2894-6000', email: 'ac.rc@mcgm.gov.in', address: 'Chandavarkar Road, Borivali West, Mumbai 400092', lat: 19.2064, lng: 72.8554 },
  { id: 21, name: 'R/N Ward', code: 'R/N Ward', zone: 'Zone 7 (Western Suburbs)', area: 'Dahisar (East & West), Rawalpada, Ketkipada, Anand Nagar',ac: 'Smt. Mrudula Kulkarni', phone: '022-2893-6000', email: 'ac.rn@mcgm.gov.in', address: 'R.S. Road, Dahisar West, Mumbai 400068', lat: 19.2372, lng: 72.8522 },
  { id: 22, name: 'R/S Ward', code: 'R/S Ward', zone: 'Zone 4 (Western Suburbs)', area: 'Kandivali (West), Charkop, Mahavir Nagar, Poisar',        ac: 'Smt. Sandhya Nandedkar', phone: '022-2805-6000', email: 'ac.rs@mcgm.gov.in', address: 'M.G. Cross Road No. 2, Kandivali West, Mumbai 400067', lat: 19.2115, lng: 72.8383 },
  { id: 23, name: 'S Ward',   code: 'S Ward',   zone: 'Zone 6 (Eastern Suburbs)', area: 'Bhandup, Powai, Kanjurmarg, IIT Bombay, Hiranandani',     ac: 'Shri Ajitkumar Ambi', phone: '022-2594-7510', email: 'ac.s@mcgm.gov.in', address: 'Lal Bahadur Shastri Marg, Bhandup West, Mumbai 400078', lat: 19.1728, lng: 72.9564 },
  { id: 24, name: 'T Ward',   code: 'T Ward',   zone: 'Zone 6 (Eastern Suburbs)', area: 'Mulund (East & West), Nahur, Sarvodaya Nagar',           ac: 'Shri Ajay Patne', phone: '022-2564-5289', email: 'ac.t@mcgm.gov.in', address: 'Lala Devidayal Marg, Mulund West, Mumbai 400080', lat: 19.1449, lng: 72.9382 },
];

export const CATEGORIES = [
  'Pothole', 'Garbage', 'Drainage', 'Streetlight', 'Water Leakage', 'Other',
];


export const MOCK_USERS = {
  citizen: {
    id: 'user-001',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98765 43210',
    role: 'citizen',
    ward: 8,
    wardName: 'G/N Ward – Bandra (North)',
    avatarInitials: 'PN',
    createdAt: '2024-03-15T10:30:00Z',
  },
  citizen2: {
    id: 'user-002',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 99887 76543',
    role: 'citizen',
    ward: 12,
    wardName: 'K/E Ward – Andheri (East)',
    avatarInitials: 'AS',
    createdAt: '2024-06-20T14:00:00Z',
  },
  citizenAyush: {
    id: 'user-003',
    name: 'Ayush Barve',
    email: 'ayush.barve@example.com',
    phone: '+91 98201 11223',
    role: 'citizen',
    ward: 8,
    wardName: 'G/N Ward – Bandra (North)',
    avatarInitials: 'AB',
    createdAt: '2024-02-10T09:00:00Z',
  },
  citizenDharmik: {
    id: 'user-004',
    name: 'Dharmik Desai',
    email: 'dharmik.desai@example.com',
    phone: '+91 98202 22334',
    role: 'citizen',
    ward: 12,
    wardName: 'K/E Ward – Andheri (East)',
    avatarInitials: 'DD',
    createdAt: '2024-02-15T11:00:00Z',
  },
  citizenHarsh: {
    id: 'user-005',
    name: 'Harsh Mane',
    email: 'harsh.mane@example.com',
    phone: '+91 98203 33445',
    role: 'citizen',
    ward: 1,
    wardName: 'A Ward – Colaba, Cuffe Parade',
    avatarInitials: 'HM',
    createdAt: '2024-02-20T14:00:00Z',
  },
  officer: {
    id: 'officer-008',
    name: 'Suresh Patil',
    email: 'suresh.patil@bmc.gov.in',
    phone: '+91-22-24100008',
    role: 'officer',
    ward: 8,
    wardName: 'G/N Ward – Bandra (North)',
    department: 'Roads & Infrastructure',
    employeeId: 'BMC/GN/2020/008',
    badgeNumber: 'B-008',
    avatarInitials: 'SP',
    createdAt: '2020-07-01T09:00:00Z',
  },
  admin: {
    id: 'admin-001',
    name: 'Rajendra Mehta',
    email: 'r.mehta@bmc.gov.in',
    phone: '+91 22 2262 0251',
    role: 'admin',
    department: 'Municipal Commissioner Office',
    avatarInitials: 'RM',
    createdAt: '2020-01-15T08:00:00Z',
  },
};

// All demo citizen accounts for easy lookup
export const DEMO_CITIZENS = [
  MOCK_USERS.citizen,
  MOCK_USERS.citizen2,
  MOCK_USERS.citizenAyush,
  MOCK_USERS.citizenDharmik,
  MOCK_USERS.citizenHarsh,
];

const makeDateAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

// ─── 26 Officers — one per ward ──────────────────────────────────────────────
export const MOCK_OFFICERS = [
  { id: 'officer-001', name: 'Rohit Sharma',     email: 'rohit.sharma@bmc.gov.in',     phone: '+91-22-24100001', ward: 1,  wardName: 'A Ward – Colaba, Cuffe Parade',              department: 'Roads & Infrastructure', employeeId: 'BMC/A/2019/001',   status: 'Available', assignedCount: 8,  resolvedCount: 142, avgResolutionDays: 3.8, rating: 4.2, joinedAt: '2019-04-01T09:00:00Z', avatarInitials: 'RS' },
  { id: 'officer-002', name: 'Amol Desai',       email: 'amol.desai@bmc.gov.in',       phone: '+91-22-24100002', ward: 2,  wardName: 'B Ward – Dongri, Mandvi',                   department: 'Sanitation',            employeeId: 'BMC/B/2018/002',   status: 'Busy',      assignedCount: 21, resolvedCount: 234, avgResolutionDays: 3.2, rating: 4.6, joinedAt: '2018-06-10T09:00:00Z', avatarInitials: 'AD' },
  { id: 'officer-003', name: 'Kavita Jadhav',    email: 'kavita.jadhav@bmc.gov.in',    phone: '+91-22-24100003', ward: 3,  wardName: 'C Ward – Girgaon, Bhuleshwar',              department: 'Water Supply',          employeeId: 'BMC/C/2020/003',   status: 'Available', assignedCount: 9,  resolvedCount: 156, avgResolutionDays: 2.9, rating: 4.7, joinedAt: '2020-01-10T09:00:00Z', avatarInitials: 'KJ' },
  { id: 'officer-004', name: 'Rahul Tiwari',     email: 'rahul.tiwari@bmc.gov.in',     phone: '+91-22-24100004', ward: 4,  wardName: 'D Ward – Malabar Hill, Grant Road',         department: 'Electrical',            employeeId: 'BMC/D/2017/004',   status: 'On Leave',  assignedCount: 0,  resolvedCount: 312, avgResolutionDays: 3.1, rating: 4.4, joinedAt: '2017-06-01T09:00:00Z', avatarInitials: 'RT' },
  { id: 'officer-005', name: 'Sneha Mhatre',     email: 'sneha.mhatre@bmc.gov.in',     phone: '+91-22-24100005', ward: 5,  wardName: 'E Ward – Byculla, Mazgaon',                 department: 'Building & Permits',    employeeId: 'BMC/E/2021/005',   status: 'Available', assignedCount: 6,  resolvedCount: 89,  avgResolutionDays: 5.1, rating: 3.9, joinedAt: '2021-09-01T09:00:00Z', avatarInitials: 'SM' },
  { id: 'officer-006', name: 'Vikram Salvi',     email: 'vikram.salvi@bmc.gov.in',     phone: '+91-22-24100006', ward: 6,  wardName: 'F/N Ward – Kurla (North)',                   department: 'Sanitation',            employeeId: 'BMC/FN/2016/006',  status: 'Busy',      assignedCount: 17, resolvedCount: 401, avgResolutionDays: 2.6, rating: 4.8, joinedAt: '2016-11-20T09:00:00Z', avatarInitials: 'VS' },
  { id: 'officer-007', name: 'Preeti Kulkarni',  email: 'preeti.kulkarni@bmc.gov.in',  phone: '+91-22-24100007', ward: 7,  wardName: 'F/S Ward – Dharavi, Sion',                  department: 'Roads & Infrastructure',employeeId: 'BMC/FS/2019/007',  status: 'Available', assignedCount: 12, resolvedCount: 198, avgResolutionDays: 3.5, rating: 4.3, joinedAt: '2019-03-15T09:00:00Z', avatarInitials: 'PK' },
  { id: 'officer-008', name: 'Suresh Patil',     email: 'suresh.patil@bmc.gov.in',     phone: '+91-22-24100008', ward: 8,  wardName: 'G/N Ward – Bandra (North)',                 department: 'Roads & Infrastructure',employeeId: 'BMC/GN/2020/008',  status: 'Available', assignedCount: 14, resolvedCount: 187, avgResolutionDays: 4.2, rating: 4.3, joinedAt: '2020-07-01T09:00:00Z', avatarInitials: 'SP' },
  { id: 'officer-009', name: 'Meena Rao',        email: 'meena.rao@bmc.gov.in',        phone: '+91-22-24100009', ward: 9,  wardName: 'G/S Ward – Bandra (South)',                 department: 'Water Supply',          employeeId: 'BMC/GS/2021/009',  status: 'Busy',      assignedCount: 11, resolvedCount: 167, avgResolutionDays: 3.7, rating: 4.5, joinedAt: '2021-02-01T09:00:00Z', avatarInitials: 'MR' },
  { id: 'officer-010', name: 'Ajay Nair',        email: 'ajay.nair@bmc.gov.in',        phone: '+91-22-24100010', ward: 10, wardName: 'H/E Ward – Santacruz (East)',               department: 'Electrical',            employeeId: 'BMC/HE/2018/010',  status: 'Available', assignedCount: 7,  resolvedCount: 289, avgResolutionDays: 2.8, rating: 4.6, joinedAt: '2018-01-15T09:00:00Z', avatarInitials: 'AN' },
  { id: 'officer-011', name: 'Deepa Joshi',      email: 'deepa.joshi@bmc.gov.in',      phone: '+91-22-24100011', ward: 11, wardName: 'H/W Ward – Santacruz (West)',               department: 'Sanitation',            employeeId: 'BMC/HW/2020/011',  status: 'Available', assignedCount: 10, resolvedCount: 211, avgResolutionDays: 3.3, rating: 4.4, joinedAt: '2020-05-01T09:00:00Z', avatarInitials: 'DJ' },
  { id: 'officer-012', name: 'Ravi Mehta',       email: 'ravi.mehta@bmc.gov.in',       phone: '+91-22-24100012', ward: 12, wardName: 'K/E Ward – Andheri (East)',                 department: 'Roads & Infrastructure',employeeId: 'BMC/KE/2021/012',  status: 'Busy',      assignedCount: 18, resolvedCount: 256, avgResolutionDays: 3.9, rating: 4.2, joinedAt: '2021-07-01T09:00:00Z', avatarInitials: 'RM' },
  { id: 'officer-013', name: 'Sunita Pawar',     email: 'sunita.pawar@bmc.gov.in',     phone: '+91-22-24100013', ward: 13, wardName: 'K/W Ward – Andheri (West)',                 department: 'Water Supply',          employeeId: 'BMC/KW/2019/013',  status: 'Available', assignedCount: 9,  resolvedCount: 178, avgResolutionDays: 3.1, rating: 4.7, joinedAt: '2019-11-01T09:00:00Z', avatarInitials: 'SP2'},
  { id: 'officer-014', name: 'Ganesh Shirke',    email: 'ganesh.shirke@bmc.gov.in',    phone: '+91-22-24100014', ward: 14, wardName: 'L Ward – Kurla, Sakinaka',                  department: 'Roads & Infrastructure',employeeId: 'BMC/L/2017/014',   status: 'Available', assignedCount: 15, resolvedCount: 334, avgResolutionDays: 3.6, rating: 4.5, joinedAt: '2017-08-01T09:00:00Z', avatarInitials: 'GS' },
  { id: 'officer-015', name: 'Priya Singh',      email: 'priya.singh@bmc.gov.in',      phone: '+91-22-24100015', ward: 15, wardName: 'M/E Ward – Govandi, Mankhurd',              department: 'Sanitation',            employeeId: 'BMC/ME/2022/015',  status: 'Available', assignedCount: 5,  resolvedCount: 78,  avgResolutionDays: 4.5, rating: 3.8, joinedAt: '2022-03-01T09:00:00Z', avatarInitials: 'PS' },
  { id: 'officer-016', name: 'Nikhil Bane',      email: 'nikhil.bane@bmc.gov.in',      phone: '+91-22-24100016', ward: 16, wardName: 'M/W Ward – Chembur (West)',                 department: 'Electrical',            employeeId: 'BMC/MW/2018/016',  status: 'Busy',      assignedCount: 13, resolvedCount: 290, avgResolutionDays: 3.0, rating: 4.4, joinedAt: '2018-09-01T09:00:00Z', avatarInitials: 'NB' },
  { id: 'officer-017', name: 'Rashmi Shetty',    email: 'rashmi.shetty@bmc.gov.in',    phone: '+91-22-24100017', ward: 17, wardName: 'N Ward – Ghatkopar',                        department: 'Roads & Infrastructure',employeeId: 'BMC/N/2020/017',   status: 'Available', assignedCount: 11, resolvedCount: 223, avgResolutionDays: 3.4, rating: 4.3, joinedAt: '2020-06-01T09:00:00Z', avatarInitials: 'RS2'},
  { id: 'officer-018', name: 'Arun Kamble',      email: 'arun.kamble@bmc.gov.in',      phone: '+91-22-24100018', ward: 18, wardName: 'P/N Ward – Goregaon (North)',               department: 'Water Supply',          employeeId: 'BMC/PN/2019/018',  status: 'Available', assignedCount: 8,  resolvedCount: 154, avgResolutionDays: 3.8, rating: 4.1, joinedAt: '2019-07-01T09:00:00Z', avatarInitials: 'AK' },
  { id: 'officer-019', name: 'Leela More',       email: 'leela.more@bmc.gov.in',       phone: '+91-22-24100019', ward: 19, wardName: 'P/S Ward – Goregaon (South)',               department: 'Sanitation',            employeeId: 'BMC/PS/2021/019',  status: 'Busy',      assignedCount: 16, resolvedCount: 199, avgResolutionDays: 3.2, rating: 4.5, joinedAt: '2021-01-10T09:00:00Z', avatarInitials: 'LM' },
  { id: 'officer-020', name: 'Harish Gaikwad',   email: 'harish.gaikwad@bmc.gov.in',   phone: '+91-22-24100020', ward: 20, wardName: 'R/C Ward – Kandivali (East)',               department: 'Building & Permits',    employeeId: 'BMC/RC/2018/020',  status: 'Available', assignedCount: 7,  resolvedCount: 267, avgResolutionDays: 2.9, rating: 4.6, joinedAt: '2018-04-01T09:00:00Z', avatarInitials: 'HG' },
  { id: 'officer-021', name: 'Vaibhav Jagtap',   email: 'vaibhav.jagtap@bmc.gov.in',   phone: '+91-22-24100021', ward: 21, wardName: 'R/N Ward – Dahisar',                        department: 'Roads & Infrastructure',employeeId: 'BMC/RN/2020/021',  status: 'Available', assignedCount: 10, resolvedCount: 189, avgResolutionDays: 3.7, rating: 4.2, joinedAt: '2020-08-01T09:00:00Z', avatarInitials: 'VJ' },
  { id: 'officer-022', name: 'Shweta Ghosalkar', email: 'shweta.ghosalkar@bmc.gov.in', phone: '+91-22-24100022', ward: 22, wardName: 'R/S Ward – Kandivali (West)',               department: 'Sanitation',            employeeId: 'BMC/RS/2021/022',  status: 'Available', assignedCount: 6,  resolvedCount: 145, avgResolutionDays: 4.1, rating: 4.0, joinedAt: '2021-05-15T09:00:00Z', avatarInitials: 'SG' },
  { id: 'officer-023', name: 'Mahesh Wagh',      email: 'mahesh.wagh@bmc.gov.in',      phone: '+91-22-24100023', ward: 23, wardName: 'S Ward – Mulund',                           department: 'Roads & Infrastructure',employeeId: 'BMC/S/2017/023',   status: 'Busy',      assignedCount: 19, resolvedCount: 378, avgResolutionDays: 3.3, rating: 4.5, joinedAt: '2017-10-01T09:00:00Z', avatarInitials: 'MW' },
  { id: 'officer-024', name: 'Tanvi Bhosale',    email: 'tanvi.bhosale@bmc.gov.in',    phone: '+91-22-24100024', ward: 24, wardName: 'T Ward – Bhandup, Nahur',                  department: 'Electrical',            employeeId: 'BMC/T/2022/024',   status: 'Available', assignedCount: 4,  resolvedCount: 67,  avgResolutionDays: 4.8, rating: 3.9, joinedAt: '2022-06-01T09:00:00Z', avatarInitials: 'TB' },
];

// ─── Mock Complaints (one or two per ward for demo) ───────────────────────────
const makeCmp = (id, title, desc, cat, sev, lat, lng, ward, img, status, uid, uname, oid, oname, upvotes, comments, daysAgo, resolved = null) => ({
  id,
  title,
  description: desc,
  category: cat,
  severity: sev,
  latitude: lat,
  longitude: lng,
  ward,
  imageUrl: img,
  status,
  createdBy: { id: uid, name: uname },
  assignedOfficer: oid ? { id: oid, name: oname } : null,
  upvoteCount: upvotes,
  commentCount: comments,
  createdAt: makeDateAgo(daysAgo),
  resolvedAt: resolved ? makeDateAgo(resolved) : null,
  aiAnalysis: { categoryDetected: cat, confidence: +(0.78 + Math.random() * 0.19).toFixed(2), aqiAtLocation: 90 + Math.floor(Math.random() * 80), weatherCondition: ['Clear', 'Partly Cloudy', 'Monsoon', 'Post-rain', 'Humid'][Math.floor(Math.random() * 5)] },
});

const POTHOLES = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
const GARBAGE  = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';
const DRAIN    = 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&q=80';
const LIGHT    = 'https://images.unsplash.com/photo-1518893883800-45cd0954574b?w=600&q=80';
const WATER    = 'https://images.unsplash.com/photo-1570887830800-53c6e09d99f7?w=600&q=80';
const DEBRIS   = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80';

export const MOCK_COMPLAINTS = [
  makeCmp('cmp-001', 'Pothole near Colaba bus stop',        'Large pothole causing accidents near Colaba causeway bus stop.',              'Pothole',       87, 18.9067, 72.8280, 1,  POTHOLES,'in_progress','u-001','Anil Ghosh',   'officer-001','Rohit Sharma',   143,18,12,null),
  makeCmp('cmp-002', 'Garbage overflow at Colaba market',   'Garbage bins overflowing near Colaba market for 3 days.',                    'Garbage',       72, 18.9100, 72.8310, 1,  GARBAGE, 'assigned',   'u-002','Ritu Sharma',  'officer-001','Rohit Sharma',   89, 7, 5, null),
  makeCmp('cmp-003', 'Drainage clog on Dongri road',        'Storm drain blocked causing flooding during rain in Dongri.',                'Drainage',      91, 18.9591, 72.8341, 2,  DRAIN,   'reported',   'u-003','Farhan Ali',   null,          null,             218,32, 2, null),
  makeCmp('cmp-004', 'Broken streetlight Mandvi market',    'Streetlight pole near Mandvi market non-functional for 2 weeks.',           'Streetlight',   55, 18.9600, 72.8370, 2,  LIGHT,   'resolved',   'u-004','Sakshi Verma', 'officer-002','Amol Desai',     34, 5,22,8),
  makeCmp('cmp-005', 'Water pipe burst on Bhuleshwar road', 'Water pipeline burst near Bhuleshwar crossing, flooding road.',             'Water Leakage', 95, 18.9528, 72.8223, 3,  WATER,   'in_progress','u-005','Neha Patil',   'officer-003','Kavita Jadhav',  312,41, 1, null),
  makeCmp('cmp-006', 'Construction debris on Girgaon path', 'Rubble from construction site blocking footpath near Girgaon.',             'Other',         48, 18.9540, 72.8240, 3,  DEBRIS,  'assigned',   'u-006','Rohan Desai',  'officer-003','Kavita Jadhav',  27, 3, 7, null),
  makeCmp('cmp-007', 'Potholes near Malabar Hill descent',  'Multiple potholes on the descent road from Malabar Hill causing slippage.', 'Pothole',       83, 18.9573, 72.7983, 4,  POTHOLES,'reported',   'u-007','Divya Rao',    null,          null,             97, 14, 4, null),
  makeCmp('cmp-008', 'Broken street lamp Grant Road',       'Street lamp at Grant Road junction not working for 15+ days.',              'Streetlight',   65, 18.9600, 72.8000, 4,  LIGHT,   'resolved',   'u-008','Mehul Shah',   'officer-004','Rahul Tiwari',   56, 9,18, 5),
  makeCmp('cmp-009', 'Garbage pile Byculla station exit',   'Uncollected garbage near Byculla station exit, attracting stray dogs.',     'Garbage',       78, 18.9752, 72.8367, 5,  GARBAGE, 'assigned',   'u-009','Amita Joshi',  'officer-005','Sneha Mhatre',   89, 11, 6, null),
  makeCmp('cmp-010', 'Drainage overflow Mazgaon colony',    'Sewage overflowing onto Mazgaon colony road after heavy rain.',             'Drainage',      88, 18.9780, 72.8400, 5,  DRAIN,   'in_progress','u-010','Sanjay Naik',  'officer-005','Sneha Mhatre',   67, 8, 3, null),
  makeCmp('cmp-011', 'Pothole Kurla North main road',       'Deep pothole on Kurla North main arterial road causing bike damage.',       'Pothole',       75, 19.0700, 72.8787, 6,  POTHOLES,'in_progress','u-011','Puja Ghosh',   'officer-006','Vikram Salvi',   120,15, 8, null),
  makeCmp('cmp-012', 'Overflowing bins near Kurla market',  'BMC bins at Kurla market complex overflowing for 5 consecutive days.',      'Garbage',       70, 19.0720, 72.8800, 6,  GARBAGE, 'assigned',   'u-012','Tarun Yadav',  'officer-006','Vikram Salvi',   54, 6, 4, null),
  makeCmp('cmp-013', 'Blocked drain Dharavi 90 ft road',    'Main drain on 90 ft road, Dharavi, clogged causing waterlogging.',          'Drainage',      90, 19.0419, 72.8551, 7,  DRAIN,   'reported',   'u-013','Vijay More',   null,          null,             198,28, 3, null),
  makeCmp('cmp-014', 'Broken streetlight near Sion fort',   'Streetlight near historic Sion fort non-functional; safety hazard at night.','Streetlight',  60, 19.0440, 72.8570, 7,  LIGHT,   'resolved',   'u-014','Lalita Pawar', 'officer-007','Preeti Kulkarni',42, 7,20, 7),
  makeCmp('cmp-015', 'Pothole SV Road near Bandra station', '2-foot wide pothole 200m north of Bandra station causing swerving.',        'Pothole',       87, 19.0596, 72.8296, 8,  POTHOLES,'in_progress','user-001','Priya Nair',   'officer-008','Suresh Patil',   143,18,12, null),
  makeCmp('cmp-016', 'Garbage overflowing Lokhandwala',     'Three bins in Lokhandwala complex overflowing for 4 days.',                 'Garbage',       72, 19.0620, 72.8310, 8,  GARBAGE, 'assigned',   'user-003','Ayush Barve',   'officer-008','Suresh Patil',   89, 7, 5, null),
  makeCmp('cmp-017', 'Water leakage Khar Linking Road',     'Pipeline burst near Linking Road Khar, water gushing for 6+ hours.',        'Water Leakage', 95, 19.0695, 72.8340, 9,  WATER,   'in_progress','u-017','Sangeeta Joshi','officer-009','Meena Rao',      312,41, 1, null),
  makeCmp('cmp-018', 'Pothole Bandra South Carter Road',    'Potholes on Carter Road stretch causing traffic jams daily.',               'Pothole',       68, 19.0524, 72.8258, 9,  POTHOLES,'reported',   'u-018','Amit Tiwari',  null,          null,             77, 10, 5, null),
  makeCmp('cmp-019', 'Streetlight outage Santacruz East',   'Entire stretch of Andheri-Kurla road near Santacruz East lacks lighting.',  'Streetlight',   75, 19.0820, 72.8512, 10, LIGHT,   'assigned',   'u-019','Rohit Kumar',  'officer-010','Ajay Nair',      88, 12, 7, null),
  makeCmp('cmp-020', 'Drainage block near Kalina village',  'Storm water drain near Kalina village completely blocked.',                 'Drainage',      82, 19.0840, 72.8540, 10, DRAIN,   'in_progress','u-020','Bhavna Rao',   'officer-010','Ajay Nair',      65, 9, 4, null),
  makeCmp('cmp-021', 'Garbage pile Vile Parle bus depot',   'Garbage piling up outside Vile Parle bus depot for 1 week.',               'Garbage',       65, 19.0987, 72.8440, 11, GARBAGE, 'assigned',   'u-021','Kiran Naik',   'officer-011','Deepa Joshi',    56, 8, 6, null),
  makeCmp('cmp-022', 'Pothole Santacruz West market',       'Deep pothole in busy Santacruz West market lane causing vehicle damage.',   'Pothole',       79, 19.1000, 72.8460, 11, POTHOLES,'in_progress','u-022','Sunita Desai', 'officer-011','Deepa Joshi',    103,14, 9, null),
  makeCmp('cmp-023', 'Broken footpath Andheri East JB Nagar','Footpath completely broken near JB Nagar metro station Andheri East.',    'Other',         58, 19.1152, 72.8680, 12, DEBRIS,  'reported',   'user-002','Aarav Sharma',  'officer-012','Ravi Mehta',     43, 5, 3, null),
  makeCmp('cmp-024', 'Waterlogging MIDC Andheri East',      'MIDC road waterlogged after rain blocking industrial traffic.',             'Drainage',      88, 19.1170, 72.8700, 12, DRAIN,   'in_progress','user-002','Aarav Sharma',  'officer-012','Ravi Mehta',     134,19, 5, null),
  makeCmp('cmp-025', 'Potholes Andheri West Lokhandwala',   'Series of potholes on Lokhandwala road, Andheri West causing accidents.',   'Pothole',       81, 19.1197, 72.8290, 13, POTHOLES,'assigned',   'user-004','Dharmik Desai', 'officer-013','Sunita Pawar',   112,16, 7, null),
  makeCmp('cmp-026', 'Garbage bins overflowing DN Nagar',   'Municipal bins near DN Nagar, Andheri West overflowing for 3 days.',       'Garbage',       68, 19.1210, 72.8310, 13, GARBAGE, 'reported',   'user-005','Harsh Mane',    null,          null,             67, 7, 2, null),
  makeCmp('cmp-027', 'Drainage overflow Kurla East',        'Main drain blocked near Kurla East causing severe waterlogging.',           'Drainage',      93, 19.0726, 72.8849, 14, DRAIN,   'reported',   'u-027','Suresh Jagtap',null,          null,             213,35, 1, null),
  makeCmp('cmp-028', 'Pothole LBS Marg Kurla',              'Multiple potholes on LBS Marg Kurla stretch causing motorcycle accidents.', 'Pothole',       86, 19.0740, 72.8870, 14, POTHOLES,'in_progress','u-028','Anita Wagh',   'officer-014','Ganesh Shirke',  178,23, 8, null),
  makeCmp('cmp-029', 'Garbage dump Mankhurd slum area',     'Unauthorized garbage dumping near Mankhurd residential area.',             'Garbage',       78, 19.0426, 72.9159, 15, GARBAGE, 'assigned',   'u-029','Shyam Nair',   'officer-015','Priya Singh',    91, 12, 6, null),
  makeCmp('cmp-030', 'Water supply disruption Govandi',     'Water supply pipes leaking in Govandi causing scarcity.',                  'Water Leakage', 85, 19.0450, 72.9180, 15, WATER,   'in_progress','u-030','Kamla Devi',   'officer-015','Priya Singh',    145,21, 4, null),
  makeCmp('cmp-031', 'Streetlight out Chembur junction',    'Multiple streetlights non-functional near Chembur main junction.',         'Streetlight',   71, 19.0538, 72.8990, 16, LIGHT,   'assigned',   'u-031','Raju Pawar',   'officer-016','Nikhil Bane',   78, 9, 5, null),
  makeCmp('cmp-032', 'Pothole Chembur West main road',      'Pothole on Eastern Express Highway slip road at Chembur West.',            'Pothole',       89, 19.0560, 72.9010, 16, POTHOLES,'in_progress','u-032','Asha Kulkarni','officer-016','Nikhil Bane',   167,24, 6, null),
  makeCmp('cmp-033', 'Garbage overflow Ghatkopar station',  'Bins outside Ghatkopar station overflow daily causing hygiene issues.',    'Garbage',       74, 19.0868, 72.9083, 17, GARBAGE, 'assigned',   'u-033','Vijay Mane',   'officer-017','Rashmi Shetty', 89, 11, 4, null),
  makeCmp('cmp-034', 'Drainage block Ghatkopar colony',     'Colony drain clogged near Ghatkopar West causing flooding.',               'Drainage',      84, 19.0890, 72.9100, 17, DRAIN,   'in_progress','u-034','Nalini Sane',  'officer-017','Rashmi Shetty', 123,17, 7, null),
  makeCmp('cmp-035', 'Pothole Goregaon North highway',      'Deep pothole on Western Express Highway near Goregaon North.',             'Pothole',       77, 19.1617, 72.8492, 18, POTHOLES,'reported',   'user-003','Ayush Barve',   null,          null,             98, 14, 5, null),
  makeCmp('cmp-036', 'Streetlight failure Filmcity road',   'Streetlights on Filmcity road non-functional creating dark stretch.',      'Streetlight',   68, 19.1640, 72.8510, 18, LIGHT,   'assigned',   'u-036','Monica Sathe', 'officer-018','Arun Kamble',   67, 8, 4, null),
  makeCmp('cmp-037', 'Garbage pile Jogeshwari market',      'Overflowing garbage near Jogeshwari market complex for 5 days.',           'Garbage',       73, 19.1392, 72.8499, 19, GARBAGE, 'assigned',   'u-037','Santosh Gawde','officer-019','Leela More',    82, 10, 5, null),
  makeCmp('cmp-038', 'Water leakage Goregaon South',        'Pipeline burst at Goregaon South causing significant road damage.',        'Water Leakage', 92, 19.1410, 72.8520, 19, WATER,   'in_progress','u-038','Rina Dubey',   'officer-019','Leela More',    231,33, 2, null),
  makeCmp('cmp-039', 'Pothole Kandivali East road',         'Potholes on main road in Kandivali East causing traffic congestion.',      'Pothole',       80, 19.2064, 72.8554, 20, POTHOLES,'in_progress','user-004','Dharmik Desai', 'officer-020','Harish Gaikwad',134,18, 7, null),
  makeCmp('cmp-040', 'Drainage block near Thakur Village',  'Drain near Thakur Village Kandivali East overflowing after rain.',         'Drainage',      86, 19.2080, 72.8570, 20, DRAIN,   'reported',   'u-040','Sunanda Raut', null,          null,             167,25, 3, null),
  makeCmp('cmp-041', 'Pothole on Dahisar East flyover road','Multiple potholes on road below Dahisar East flyover approach.',           'Pothole',       82, 19.2372, 72.8522, 21, POTHOLES,'assigned',   'u-041','Vinod Sane',   'officer-021','Vaibhav Jagtap',112,16, 6, null),
  makeCmp('cmp-042', 'Garbage dump near Dahisar river',     'Illegal garbage dumping near Dahisar river banks, environmental hazard.',  'Garbage',       85, 19.2390, 72.8540, 21, GARBAGE, 'in_progress','u-042','Rekha Mahajan','officer-021','Vaibhav Jagtap',178,24, 4, null),
  makeCmp('cmp-043', 'Streetlight issue Kandivali West',    'Street lamp breakdown on Kandivali West market road.',                     'Streetlight',   62, 19.2115, 72.8383, 22, LIGHT,   'assigned',   'u-043','Prakash Rao',  'officer-022','Shweta Ghosalkar',57,7,5, null),
  makeCmp('cmp-044', 'Pothole near Borivali South station', 'Pothole near Borivali South railway station causing accidents.',           'Pothole',       76, 19.2130, 72.8400, 22, POTHOLES,'in_progress','u-044','Usha Tiwari',  'officer-022','Shweta Ghosalkar',98,14,8,null),
  makeCmp('cmp-045', 'Pothole Mulund-Airoli road stretch',  'Eight potholes over 500m on Mulund-Airoli road causing accidents.',        'Pothole',       83, 19.1728, 72.9564, 23, POTHOLES,'reported',   'user-005','Harsh Mane',    null,          null,             97, 14, 4, null),
  makeCmp('cmp-046', 'Drainage overflow Mulund colony',     'Storm drain in Mulund colony unable to handle monsoon flow, flooding.',    'Drainage',      90, 19.1750, 72.9580, 23, DRAIN,   'in_progress','u-046','Laxmi Bhatt',  'officer-023','Mahesh Wagh',   198,28, 5, null),
  makeCmp('cmp-047', 'Garbage near Bhandup station',        'Garbage pile near Bhandup railway station platform entrance.',             'Garbage',       65, 19.1449, 72.9382, 24, GARBAGE, 'resolved',   'u-047','Girish Pawar', 'officer-024','Tanvi Bhosale', 56, 9,18, 5),
  makeCmp('cmp-048', 'Water supply pipeline broken Nahur',  'Main water supply pipeline broken in Nahur causing supply shortage.',      'Water Leakage', 88, 19.1470, 72.9400, 24, WATER,   'assigned',   'u-048','Sheetal Nair', 'officer-024','Tanvi Bhosale', 145,21, 3, null),
  makeCmp('cmp-049', 'Pothole near Borivali East station',  'Series of potholes near Borivali East station exit causing congestion.',   'Pothole',       79, 19.2292, 72.8660, 25, POTHOLES,'in_progress','u-049','Ramesh Gupta', 'officer-025','Pratap Rane',   120,16, 7, null),
  makeCmp('cmp-050', 'Drainage block Borivali East market', 'Storm drain block near Borivali East market causing frequent flooding.',   'Drainage',      87, 19.2310, 72.8680, 25, DRAIN,   'reported',   'u-050','Asha Sharma',  null,          null,             134,20, 2, null),
  makeCmp('cmp-051', 'Overflowing bins near Malad station', 'Municipal bins near Malad railway station overflow daily.',                'Garbage',       70, 19.1875, 72.8448, 26, GARBAGE, 'assigned',   'u-051','Vijay Bhatt',  'officer-026','Devika Naik',   73, 9, 4, null),
  makeCmp('cmp-052', 'Drainage overflow Malad West market', 'Main storm drain at Malad West market blocked, flooding shops.',           'Drainage',      91, 19.1890, 72.8460, 26, DRAIN,   'in_progress','u-052','Devendra Pawar','officer-026','Devika Naik',  218,32, 2, null),
];

export const MOCK_NOTIFICATIONS = [
  { id: 'notif-001', type: 'status_update', title: 'Your complaint is now In Progress', body: 'Officer has started working on your pothole report.', complaintId: 'cmp-001', isRead: false, createdAt: makeDateAgo(0) },
  { id: 'notif-002', type: 'comment',       title: 'New comment on your complaint',     body: 'An officer added an update to your drainage complaint.', complaintId: 'cmp-027', isRead: false, createdAt: makeDateAgo(1) },
  { id: 'notif-003', type: 'resolved',      title: 'Issue Resolved! 🎉',                body: 'Your streetlight complaint has been marked as resolved.', complaintId: 'cmp-004', isRead: true,  createdAt: makeDateAgo(8) },
  { id: 'notif-004', type: 'upvote',        title: 'Your complaint gained 50+ upvotes', body: 'Your drainage report now has 218 upvotes — community noticed!', complaintId: 'cmp-052', isRead: true,  createdAt: makeDateAgo(2) },
  { id: 'notif-005', type: 'assigned',      title: 'Complaint assigned to officer',     body: 'Officer has been assigned to your garbage complaint.', complaintId: 'cmp-009', isRead: true,  createdAt: makeDateAgo(4) },
];

export const MOCK_COMMENTS = {
  'cmp-015': [
    { id: 'comm-001', author: { id: 'u-015', name: 'Priya Nair', role: 'citizen' },  text: 'Reported 12 days ago. Two-wheelers have nearly fallen. Please expedite!', createdAt: makeDateAgo(12) },
    { id: 'comm-002', author: { id: 'officer-008', name: 'Suresh Patil', role: 'officer' }, text: 'Acknowledged. Materials requisitioned. Work begins tomorrow at 9 AM.', createdAt: makeDateAgo(3) },
    { id: 'comm-003', author: { id: 'u-099', name: 'Rajan Verma', role: 'citizen' }, text: 'My bike tire burst because of this. Please make it urgent!', createdAt: makeDateAgo(2) },
  ],
};

export const MOCK_ANALYTICS = {
  dashboard: {
    totalComplaints: 14827, resolvedComplaints: 11204, resolutionRate: 75.6,
    avgResolutionDays: 3.7, activeOfficers: 84, highPriorityOpen: 127,
    citizenSatisfaction: 4.1, complaintsThisMonth: 1243, complaintsLastMonth: 1087, monthlyGrowth: 14.3,
  },
  byCategory: [
    { category: 'Pothole',        count: 4218, resolved: 3102, percentage: 28.4 },
    { category: 'Garbage',        count: 3547, resolved: 2891, percentage: 23.9 },
    { category: 'Drainage',       count: 2934, resolved: 1987, percentage: 19.8 },
    { category: 'Streetlight',    count: 2103, resolved: 1876, percentage: 14.2 },
    { category: 'Water Leakage',  count: 1456, resolved: 1148, percentage: 9.8  },
    { category: 'Other',          count:  569, resolved:  200, percentage: 3.8  },
  ],
  byWard: [
    { ward: 'K/E Ward', wardId: 12, total: 1247, resolved: 891,  pending: 356, avgDays: 3.2, officers: 6, rate: 71.4 },
    { ward: 'G/N Ward', wardId: 8,  total: 1189, resolved: 967,  pending: 222, avgDays: 2.8, officers: 5, rate: 81.3 },
    { ward: 'R/N Ward', wardId: 21, total: 1034, resolved: 712,  pending: 322, avgDays: 4.1, officers: 4, rate: 68.9 },
    { ward: 'K/W Ward', wardId: 13, total:  987, resolved: 801,  pending: 186, avgDays: 2.4, officers: 5, rate: 81.2 },
    { ward: 'P/N Ward', wardId: 18, total:  934, resolved: 623,  pending: 311, avgDays: 4.8, officers: 3, rate: 66.7 },
    { ward: 'L Ward',   wardId: 14, total:  891, resolved: 734,  pending: 157, avgDays: 3.0, officers: 4, rate: 82.4 },
    { ward: 'N Ward',   wardId: 17, total:  823, resolved: 612,  pending: 211, avgDays: 3.9, officers: 3, rate: 74.4 },
    { ward: 'RS Ward',  wardId: 26, total:  798, resolved: 543,  pending: 255, avgDays: 4.3, officers: 3, rate: 68.0 },
    { ward: 'H/E Ward', wardId: 10, total:  754, resolved: 687,  pending:  67, avgDays: 2.1, officers: 4, rate: 91.1 },
    { ward: 'M/E Ward', wardId: 15, total:  712, resolved: 434,  pending: 278, avgDays: 5.6, officers: 2, rate: 61.0 },
  ],
  trends: [
    { month: 'Apr', reported: 892,  resolved: 701,  avgDays: 4.2 },
    { month: 'May', reported: 1034, resolved: 812,  avgDays: 3.9 },
    { month: 'Jun', reported: 1421, resolved: 987,  avgDays: 4.7 },
    { month: 'Jul', reported: 1876, resolved: 1234, avgDays: 5.1 },
    { month: 'Aug', reported: 2143, resolved: 1567, avgDays: 4.8 },
    { month: 'Sep', reported: 1987, resolved: 1645, avgDays: 3.7 },
  ],
  weatherCorrelation: [
    { month: 'Apr', complaints: 892,  avgAQI: 98  },
    { month: 'May', complaints: 1034, avgAQI: 112 },
    { month: 'Jun', complaints: 1421, avgAQI: 134 },
    { month: 'Jul', complaints: 1876, avgAQI: 158 },
    { month: 'Aug', complaints: 2143, avgAQI: 167 },
    { month: 'Sep', complaints: 1987, avgAQI: 141 },
  ],
};

export const MOCK_WEATHER = {
  aqi: 112, aqiCategory: 'Unhealthy for Sensitive Groups',
  condition: 'Partly Cloudy', temperature: 31, humidity: 74,
  description: 'Partly cloudy with high humidity. Monsoon conditions expected.',
  location: 'Mumbai, Maharashtra',
};

// ── SYNTHETIC_BENCHMARK_DATA: Standardized municipal baseline used as reference benchmark for officer analysis
export const OFFICER_PERFORMANCE = {
  totalResolved: 187, avgResolutionDays: 4.2, lastMonthResolved: 23, prevMonthResolved: 19, trend: +21,
  satisfactionRatio: 4.3,
  weeklyResolved: [
    { week: 'Wk 1', resolved: 6 }, { week: 'Wk 2', resolved: 8 },
    { week: 'Wk 3', resolved: 4 }, { week: 'Wk 4', resolved: 7 },
    { week: 'Wk 5', resolved: 9 }, { week: 'Wk 6', resolved: 5 },
    { week: 'Wk 7', resolved: 11 },{ week: 'Wk 8', resolved: 7 },
  ],
  categoryBreakdown: [
    { name: 'Pothole',       value: 72, fill: '#16a34a' },
    { name: 'Drainage',      value: 45, fill: '#0ea5e9' },
    { name: 'Streetlight',   value: 38, fill: '#f59e0b' },
    { name: 'Garbage',       value: 21, fill: '#ea580c' },
    { name: 'Water Leakage', value: 11, fill: '#6366f1' },
  ],
};
