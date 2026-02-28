'use client'

import { ChevronDown } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COUNTRY_CODES = [
  // India first
  { code: '+91', label: '🇮🇳 IN', country: 'India' },

  // Top countries with large NRI (Non-Resident Indian) communities
  { code: '+1',  label: '🇺🇸 US', country: 'United States' },
  { code: '+1',  label: '🇨🇦 CA', country: 'Canada' },
  { code: '+44', label: '🇬🇧 UK', country: 'United Kingdom' },
  { code: '+61', label: '🇦🇺 AU', country: 'Australia' },
  { code: '+971', label: '🇦🇪 AE', country: 'United Arab Emirates' },
  { code: '+974', label: '🇶🇦 QA', country: 'Qatar' },
  { code: '+966', label: '🇸🇦 SA', country: 'Saudi Arabia' },
  { code: '+968', label: '🇴🇲 OM', country: 'Oman' },
  { code: '+973', label: '🇧🇭 BH', country: 'Bahrain' },
  { code: '+965', label: '🇰🇼 KW', country: 'Kuwait' },

  // Other countries with significant Indian populations
  { code: '+65', label: '🇸🇬 SG', country: 'Singapore' },
  { code: '+60', label: '🇲🇾 MY', country: 'Malaysia' },
  { code: '+852', label: '🇭🇰 HK', country: 'Hong Kong' },
  { code: '+27', label: '🇿🇦 ZA', country: 'South Africa' },
  { code: '+254', label: '🇰🇪 KE', country: 'Kenya' },
  { code: '+230', label: '🇲🇺 MU', country: 'Mauritius' },
  { code: '+1',  label: '🇹🇹 TT', country: 'Trinidad and Tobago' },
  { code: '+592', label: '🇬🇾 GY', country: 'Guyana' },
  { code: '+597', label: '🇸🇷 SR', country: 'Suriname' },
  { code: '+679', label: '🇫🇯 FJ', country: 'Fiji' },
  
  // European countries with Indian diaspora
  { code: '+49', label: '🇩🇪 DE', country: 'Germany' },
  { code: '+33', label: '🇫🇷 FR', country: 'France' },
  { code: '+39', label: '🇮🇹 IT', country: 'Italy' },
  { code: '+31', label: '🇳🇱 NL', country: 'Netherlands' },
  { code: '+32', label: '🇧🇪 BE', country: 'Belgium' },
  { code: '+41', label: '🇨🇭 CH', country: 'Switzerland' },
  { code: '+46', label: '🇸🇪 SE', country: 'Sweden' },
  { code: '+47', label: '🇳🇴 NO', country: 'Norway' },
  { code: '+45', label: '🇩🇰 DK', country: 'Denmark' },
  { code: '+358', label: '🇫🇮 FI', country: 'Finland' },
  { code: '+353', label: '🇮🇪 IE', country: 'Ireland' },
  { code: '+34', label: '🇪🇸 ES', country: 'Spain' },
  { code: '+351', label: '🇵🇹 PT', country: 'Portugal' },
  { code: '+30', label: '🇬🇷 GR', country: 'Greece' },
  { code: '+43', label: '🇦🇹 AT', country: 'Austria' },
  { code: '+48', label: '🇵🇱 PL', country: 'Poland' },
  
  // Asia Pacific
  { code: '+81', label: '🇯🇵 JP', country: 'Japan' },
  { code: '+82', label: '🇰🇷 KR', country: 'South Korea' },
  { code: '+86', label: '🇨🇳 CN', country: 'China' },
  { code: '+66', label: '🇹🇭 TH', country: 'Thailand' },
  { code: '+84', label: '🇻🇳 VN', country: 'Vietnam' },
  { code: '+95', label: '🇲🇲 MM', country: 'Myanmar' },
  { code: '+94', label: '🇱🇰 LK', country: 'Sri Lanka' },
  { code: '+977', label: '🇳🇵 NP', country: 'Nepal' },
  { code: '+880', label: '🇧🇩 BD', country: 'Bangladesh' },
  { code: '+92', label: '🇵🇰 PK', country: 'Pakistan' },
  
  // Africa
  { code: '+20', label: '🇪🇬 EG', country: 'Egypt' },
  { code: '+212', label: '🇲🇦 MA', country: 'Morocco' },
  { code: '+234', label: '🇳🇬 NG', country: 'Nigeria' },
  { code: '+255', label: '🇹🇿 TZ', country: 'Tanzania' },
  { code: '+256', label: '🇺🇬 UG', country: 'Uganda' },
  { code: '+263', label: '🇿🇼 ZW', country: 'Zimbabwe' },
  { code: '+260', label: '🇿🇲 ZM', country: 'Zambia' },
  { code: '+265', label: '🇲🇼 MW', country: 'Malawi' },
]

interface CountryCodeSelectProps {
  value: string
  onChange: (value: string) => void
}

export default function CountryCodeSelect({
  value,
  onChange,
}: CountryCodeSelectProps) {
  const selectedItem = COUNTRY_CODES.find((item) => item.code === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-28 bg-white border-2 border-input focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {COUNTRY_CODES.map((country) => (
          <SelectItem 
            key={`${country.code}-${country.country}`} 
            value={country.code}
            className="cursor-pointer hover:bg-orange-50 focus:bg-orange-50"
          >
            <span className="flex items-center gap-2">
              {country.label} {country.code}
              <span className="text-xs text-gray-500 ml-1">({country.country})</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}