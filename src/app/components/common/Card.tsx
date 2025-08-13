import React from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  className?: string
  style?: React.CSSProperties
  padding?: 'small' | 'medium' | 'large'
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  style = {},
  padding = 'medium'
}) => {
  const paddingStyles = {
    small: '16px',
    medium: '24px',
    large: '32px'
  }

  const cardStyles: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #818181',
    borderRadius: '13px',
    padding: paddingStyles[padding],
    ...style
  }

  return (
    <div className={className} style={cardStyles}>
      {title && (
        <h3 style={{
          fontSize: '28px',
          fontWeight: 700,
          marginBottom: '20px',
          fontFamily: 'Inter',
          lineHeight: '34px',
          margin: '0 0 20px 0'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default Card