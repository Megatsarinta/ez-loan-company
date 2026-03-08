// Company information for admin documents (loan approval letters, repayment schedules, etc.)
export const COMPANY_INFO = {
  // Indian Company Details
  name: 'EASY LOAN COMPANY PVT LTD',
  cin: 'U99999MH1986PTC038964', // Corporate Identity Number
  pan: 'AAICC4746N', // Permanent Account Number
  tan: 'MUMC25878G', // Tax Deduction Account Number
  gst: '27AAICC4746N1Z5', // GST Number (format: state code + PAN + entity number + check digit)

  // Registration Details
  registrationDate: '1986-03-15',
  incorporationDate: '1986-03-15',
  companyType: 'Private Limited Company',
  classification: 'Non-Banking Financial Company (NBFC)',
  rbiRegistrationNo: 'N-13.02218', // Example RBI registration
  cibilMembershipNo: 'CIL-2024-0893',

  // Office Address
  registeredOffice: {
    address: 'Maker Maxity',
    area: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    country: 'India',
    fullAddress: 'Maker Maxity, Bandra Kurla Complex, Mumbai - 400051, Maharashtra, India'
  },
  corporateOffice: {
    address: 'Maker Maxity',
    area: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    country: 'India',
    fullAddress: 'Maker Maxity, Bandra Kurla Complex, Mumbai - 400051, Maharashtra, India'
  },

  // Contact Information
  contact: {
    phone: '+91 22 6789 1234',
    tollFree: '1800 123 4567',
    email: 'support@easyloancompany.com',
    nriEmail: 'nri@easyloancompany.com',
    complaintsEmail: 'complaints@easyloancompany.com',
    website: 'www.easyloancompany.com'
  },

  // Social Media
  social: {
    facebook: 'https://facebook.com/easyloancompany',
    twitter: 'https://twitter.com/easyloancompany',
    linkedin: 'https://linkedin.com/company/easyloancompany',
    instagram: 'https://instagram.com/easyloancompany',
    youtube: 'https://youtube.com/easyloancompany'
  },

  // Regulatory Details
  regulatory: {
    rbiRegistered: true,
    rbiRegistrationDate: '2020-04-01',
    nbfcType: 'Systemically Important NBFC',
    iso27001: true,
    iso27001CertNo: 'ISO-27001-2024-0893',
    dpiitRegistration: 'DPIIT/2024/123456', // Department for Promotion of Industry and Internal Trade
    msmeRegistration: 'UDYAM-MH-01-1234567'
  },

  // Key Personnel
  keyPersonnel: {
    ceo: {
      name: 'Rajesh Mehta',
      designation: 'Chief Executive Officer',
      din: '01234567' // Director Identification Number
    },
    complianceOfficer: {
      name: 'Sunil Sharma',
      designation: 'Compliance Officer',
      email: 'compliance@easyloancompany.com',
      phone: '+91 22 6789 5678'
    },
    grievanceOfficer: {
      name: 'Priya Patel',
      designation: 'Nodal Grievance Officer',
      email: 'grievance@easyloancompany.com',
      phone: '+91 22 6789 5679'
    }
  },

  // Bank Details
  bankDetails: {
    bankName: 'State Bank of India',
    branch: 'Bandra Kurla Complex',
    accountName: 'EASY LOAN COMPANY PVT LTD',
    accountNumber: '12345678901234',
    ifscCode: 'SBIN0001234',
    swiftCode: 'SBININBB123',
    upiId: 'easyloancompany@sbi'
  },

  // Digital Signatures
  digitalSignature: {
    class: 'Class 3 DSC',
    certIssuer: 'eMudhra',
    certNumber: 'DSC-2024-0893-1234',
    validUntil: '2025-12-31'
  },

  // Loan Products
  loanProducts: {
    minAmount: 100000, // ₹1,00,000
    maxAmount: 10000000, // ₹1,00,00,000
    interestRates: {
      // Fixed monthly interest rates by tenure
      tenureBased: {
        6: '0.5% per month',
        12: '0.6% per month',
        24: '0.7% per month',
        36: '0.8% per month'
      },
      nri: '0.5% - 0.8% per month',
      resident: '0.5% - 0.8% per month'
    },
    processingFee: '0% - No Processing Fee', // Updated to No Processing Fee
    prepaymentCharges: 'Nil after 6 months',
    foreclosureCharges: '2% if within 6 months'
  },

  // Statistics
  stats: {
    customersServed: '500,000+',
    nriCustomers: '200,000+',
    totalDisbursed: '₹2,500+ Crores',
    averageProcessingTime: '24 hours',
    customerRating: '4.5/5',
    trustpilotRating: '4.6/5',
    googleRating: '4.4/5'
  },

  // Taglines
  tagline: {
    primary: 'For NRIs, For India',
    secondary: 'Instant Loans from ₹1 Lakh to ₹1 Crore',
    nri: 'Serving Indians Worldwide',
    mission: 'Making credit accessible for every Indian, anywhere in the world.'
  }
}

// Fallback company info (for backward compatibility)
export const COMPANY_INFO_FALLBACK = {
  name: COMPANY_INFO.name,
  secNumber: COMPANY_INFO.cin,
  dateRegisteredSec: COMPANY_INFO.registrationDate,
  address: COMPANY_INFO.registeredOffice.fullAddress,
  contactPhone: COMPANY_INFO.contact.phone,
  tagline: COMPANY_INFO.tagline.primary,
  officerName: COMPANY_INFO.keyPersonnel.ceo.name,
  officerTitle: COMPANY_INFO.keyPersonnel.ceo.designation,
  status: 'Registered',
  secondaryLicense: {
    type: COMPANY_INFO.classification,
    licenseNumber: COMPANY_INFO.rbiRegistrationNo,
    dateIssued: COMPANY_INFO.regulatory.rbiRegistrationDate,
    status: 'Active'
  }
}

// Government & Regulatory Logos
export const GOVERNMENT_LOGOS = {
  // Indian Regulatory Bodies
  rbi: '/logos/rbi.png',              // Reserve Bank of India
  mca: '/logos/mca.png',              // Ministry of Corporate Affairs
  meity: '/logos/meity.png',          // Ministry of Electronics & IT
  cibil: '/logos/cibil.png',           // CIBIL
  digilocker: '/logos/digilocker.png', // DigiLocker
  umang: '/logos/umang.png',           // UMANG App
  digitalIndia: '/logos/digital-india.png', // Digital India
  makeInIndia: '/logos/make-in-india.png',  // Make in India
  gst: '/logos/gst.png',               // GST Council
  incomeTax: '/logos/income-tax.png',   // Income Tax Department
  nru: '/logos/nru.png',               // Ministry of External Affairs (NRU)
  mea: '/logos/mea.png',               // Ministry of External Affairs
  passport: '/logos/passport.png',      // Passport Seva
  npc: '/logos/npc.png',                // National Payments Corporation (for UPI)
}

// Brand colors: Saffron & Green (primary) + Navy (secondary trust)
export const BRAND_COLORS = {
  saffron: 'var(--color-accent-500)',
  green: 'var(--color-secondary-600)',
  navy: 'var(--color-primary-900)',
}

// Company Logos for Admin Documents
export const COMPANY_LOGOS = {
  main: '/logos/EasyLoan.png',        // Company logo (use for header/mobile)
  icon: '/logos/easy-loan-icon.png',
  stamp: '/logos/company-stamp.png',
  approvalStamp: '/logos/approved-stamp.png',
  signature: '/logos/company-stamp.png',
  nriBadge: '/logos/nri-badge.png',
  trustBadge: '/logos/trust-badge.png'
}

// UPI & Payment Apps Logos
export const PAYMENT_LOGOS = {
  googlePay: '/logos/google-pay.png',
  phonePe: '/logos/phonepe.png',
  paytm: '/logos/paytm.png',
  bhim: '/logos/bhim-upi.png',
  amazonPay: '/logos/amazon-pay.png',
  cred: '/logos/cred.png',
  razorpay: '/logos/razorpay.png'
}

// Bank Logos
export const BANK_LOGOS = {
  sbi: '/logos/sbi.png',
  hdfc: '/logos/hdfc.png',
  icici: '/logos/icici.png',
  axis: '/logos/axis.png',
  kotak: '/logos/kotak.png',
  yesBank: '/logos/yes-bank.png',
  pnb: '/logos/pnb.png',
  bob: '/logos/bob.png'
}

// Helper function to check if we're on admin side vs frontend
export const isAdminRoute = (pathname: string): boolean => {
  return pathname?.startsWith('/admin') || false
}

// Combined logos for admin documents (company + government)
export const ADMIN_DOCUMENT_LOGOS = {
  company: COMPANY_LOGOS.main,
  government: {
    rbi: GOVERNMENT_LOGOS.rbi,
    mca: GOVERNMENT_LOGOS.mca,
    meity: GOVERNMENT_LOGOS.meity,
    cibil: GOVERNMENT_LOGOS.cibil,
    digilocker: GOVERNMENT_LOGOS.digilocker,
    gst: GOVERNMENT_LOGOS.gst,
    incomeTax: GOVERNMENT_LOGOS.incomeTax
  }
}

// Document templates configuration
export const DOCUMENT_TEMPLATES = {
  loanAgreement: {
    header: 'LOAN AGREEMENT',
    footer: 'This agreement is digitally signed and valid under Indian IT Act, 2000',
    governingLaw: 'Subject to Mumbai jurisdiction'
  },
  repaymentSchedule: {
    header: 'REPAYMENT SCHEDULE',
    note: 'EMI deducted on 5th of every month via NACH mandate'
  },
  sanctionLetter: {
    header: 'LOAN SANCTION LETTER',
    validity: '30 days from date of issue',
    specialNote: 'Zero Processing Fee - No hidden charges'
  }
}

// EMI Payment Configuration
export const EMI_CONFIG = {
  dueDates: [5], // 5th of every month
  paymentMethods: ['NACH', 'UPI AutoPay', 'Standing Instruction'],
  gracePeriod: 3, // days
  latePenalty: '2% per month on overdue amount'
}

// Loan Tenure Configuration
export const LOAN_TENURES = [
  { months: 6, monthlyRate: 0.005, label: '6 months' },
  { months: 12, monthlyRate: 0.006, label: '12 months' },
  { months: 24, monthlyRate: 0.007, label: '24 months' },
  { months: 36, monthlyRate: 0.008, label: '36 months' }
]

// KYC Document Types for India
export const KYC_DOCUMENT_TYPES = {
  primary: ['Aadhaar Card', 'PAN Card', 'Passport', 'Voter ID', 'Driving License'],
  address: ['Aadhaar Card', 'Passport', 'Voter ID', 'Driving License', 'Utility Bill'],
  income: ['Salary Slips (3 months)', 'Bank Statements (6 months)', 'IT Returns (2 years)'],
  nri: ['Passport', 'Visa', 'NRE/NRO Account Statement', 'Overseas Address Proof']
}

// Loan Purpose Categories
export const LOAN_PURPOSES = [
  'Home Renovation',
  'Education',
  'Medical Emergency',
  'Wedding',
  'Travel',
  'Business',
  'Debt Consolidation',
  'Vehicle Purchase',
  'Property Purchase',
  'Other'
]

// Fee Structure
export const FEE_STRUCTURE = {
  processingFee: 'No Processing Fee',
  latePaymentFee: '2% per month on overdue amount',
  prepaymentCharges: 'Nil after 6 months',
  foreclosureCharges: '2% if within 6 months',
  documentationCharges: 'Nil',
  legalCharges: 'Nil',
  verificationCharges: 'Nil'
}