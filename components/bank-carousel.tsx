'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BANK_LOGOS } from '@/lib/constants/company-info'

// Using only banks defined in company-info.ts
const banks = [
  // Major Indian Banks from BANK_LOGOS
  { name: 'State Bank of India', type: 'Bank', logo: BANK_LOGOS.sbi },
  { name: 'HDFC Bank', type: 'Bank', logo: BANK_LOGOS.hdfc },
  { name: 'ICICI Bank', type: 'Bank', logo: BANK_LOGOS.icici },
  { name: 'Axis Bank', type: 'Bank', logo: BANK_LOGOS.axis },
  { name: 'Kotak Mahindra', type: 'Bank', logo: BANK_LOGOS.kotak },
  { name: 'Yes Bank', type: 'Bank', logo: BANK_LOGOS.yesBank },
  { name: 'Punjab National Bank', type: 'Bank', logo: BANK_LOGOS.pnb },
  { name: 'Bank of Baroda', type: 'Bank', logo: BANK_LOGOS.bob },
  
  // UPI & Payment Apps from PAYMENT_LOGOS
  { name: 'Google Pay', type: 'UPI App', logo: '/logos/google-pay.png' },
  { name: 'PhonePe', type: 'UPI App', logo: '/logos/phonepe.png' },
  { name: 'Paytm', type: 'UPI App', logo: '/logos/paytm.png' },
  { name: 'BHIM UPI', type: 'UPI App', logo: '/logos/bhim-upi.png' },
  { name: 'Amazon Pay', type: 'UPI App', logo: '/logos/amazon-pay.png' },
  { name: 'CRED', type: 'Fintech', logo: '/logos/cred.png' },
  { name: 'Razorpay', type: 'Fintech', logo: '/logos/razorpay.png' },
]

// If you have these logos in your public folder, otherwise comment them out
// Note: Make sure these logo files exist in your /public/logos/ directory

const getTextColor = (type: string) => {
  switch (type) {
    case 'Bank':
      return 'text-[#FF9933]' // Indian flag saffron for banks
    case 'UPI App':
      return 'text-[#138808]' // Indian flag green for UPI apps
    case 'Fintech':
      return 'text-[#000080]' // Navy blue for fintech (Ashoka Chakra color)
    default:
      return 'text-[#FF9933]' // Default to saffron
  }
}

export default function BankCarousel() {
  const [isHovering, setIsHovering] = useState(false)

  // Double the banks array for seamless infinite scroll
  const extendedBanks = [...banks, ...banks]

  return (
    <div className="w-full overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .bank-carousel {
          display: flex;
          gap: 1.5rem;
          animation: scroll 30s linear infinite;
          width: fit-content;
          padding: 0 1.5rem;
        }

        .bank-carousel.paused {
          animation-play-state: paused;
        }

        .bank-card {
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .bank-card:hover {
          transform: translateY(-8px) scale(1.05);
          box-shadow: 0 20px 40px rgba(255, 153, 51, 0.15); /* Saffron shadow */
        }

        /* Gradient overlays for seamless fade effect */
        .carousel-container::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
          z-index: 10;
          pointer-events: none;
        }

        .carousel-container::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 80px;
          background: linear-gradient(to left, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
          z-index: 10;
          pointer-events: none;
        }
      `}</style>

      <div
        className="carousel-container relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="bank-carousel" style={{ animationPlayState: isHovering ? 'paused' : 'running' }}>
          {extendedBanks.map((bank, index) => (
            <div
              key={index}
              className="bank-card w-40 h-40"
            >
              <div className="bg-white rounded-2xl p-6 h-full w-full flex flex-col items-center justify-center shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:border-[#FF9933]">
                <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                  <Image
                    src={bank.logo || "/placeholder.svg"}
                    alt={bank.name}
                    width={80}
                    height={80}
                    className="object-contain"
                    priority={false}
                  />
                </div>
                <h4 className="font-bold text-gray-900 text-center text-sm leading-tight line-clamp-2">
                  {bank.name}
                </h4>
                <p className={`text-xs mt-2 font-medium ${getTextColor(bank.type)}`}>
                  {bank.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}