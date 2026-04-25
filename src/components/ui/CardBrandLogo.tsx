interface CardBrandLogoProps {
  bandeira: string
  className?: string
}

export function CardBrandLogo({ bandeira, className = 'w-10 h-6' }: CardBrandLogoProps) {
  const b = bandeira.toLowerCase()

  if (b === 'visa') {
    return (
      <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Visa">
        <rect width="48" height="24" rx="4" fill="#1A1F71"/>
        <text x="7" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#FFFFFF" letterSpacing="1">VISA</text>
      </svg>
    )
  }

  if (b === 'mastercard') {
    return (
      <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
        <rect width="48" height="24" rx="4" fill="#252525"/>
        <circle cx="18" cy="12" r="7" fill="#EB001B"/>
        <circle cx="30" cy="12" r="7" fill="#F79E1B"/>
        <path d="M24 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 24 6.8z" fill="#FF5F00"/>
      </svg>
    )
  }

  if (b === 'elo') {
    return (
      <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Elo">
        <rect width="48" height="24" rx="4" fill="#00A4E0"/>
        <text x="9" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="13" fill="#FFCB05" letterSpacing="1">elo</text>
      </svg>
    )
  }

  if (b === 'amex' || b === 'american express') {
    return (
      <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="American Express">
        <rect width="48" height="24" rx="4" fill="#2E77BC"/>
        <text x="5" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" fill="#FFFFFF" letterSpacing="0.5">AMEX</text>
      </svg>
    )
  }

  // fallback genérico
  return (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="24" rx="4" fill="#6b7280"/>
      <text x="7" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#FFFFFF" textAnchor="start">
        {bandeira.slice(0, 4).toUpperCase()}
      </text>
    </svg>
  )
}
