import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  style?: React.CSSProperties
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style = {}
}) => {
  const baseStyles: React.CSSProperties = {
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: '#2196F3',
      color: '#FFFFFF',
    },
    secondary: {
      background: 'transparent',
      color: '#666',
      border: '1px solid #E0E0E0',
    },
    danger: {
      background: '#F44336',
      color: '#FFFFFF',
    }
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
    },
    medium: {
      padding: '12px 16px',
      fontSize: '16px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
    }
  }

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size]
  }

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    
    const hoverColors: Record<string, string> = {
      primary: '#1976D2',
      secondary: '#F5F5F5',
      danger: '#D32F2F'
    }
    
    e.currentTarget.style.background = hoverColors[variant] || hoverColors.primary
  }

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return
    
    const originalColors: Record<string, string> = {
      primary: '#2196F3',
      secondary: 'transparent',
      danger: '#F44336'
    }
    
    e.currentTarget.style.background = originalColors[variant] || originalColors.primary
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={combinedStyles}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
    </button>
  )
}

export default Button