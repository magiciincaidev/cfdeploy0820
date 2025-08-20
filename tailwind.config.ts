import type { Config } from 'tailwindcss'
export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { page:'#FCFCFC', header:'#FFFFFF' },
        ink: { base:'#000000', mute:'#6B6B6B' },
        line: { base:'#818181', light:'#DEDEDE', soft:'#CDCDCD' },
        brand: { blue:'#005DDA', gray:'#D9D9D9', danger:'#EB0000', warn:'#FFA305', ok:'#2B9955' },
        surface: { card:'#FFFFFF', chip:'#F3F3F3', info:'#2B99550F' } // info = rgba(43,153,85,0.06)
      },
      borderRadius: {
        card:'13px', chip:'13px', xl:'16px', full:'9999px'
      },
      boxShadow: {
        header:'0px 0px 11px rgba(0,0,0,0.25)'
      },
      spacing: {
        headerW:'1678px', headerH:'111px', sidebarW:'372px'
      },
      fontFamily: { inter:['Inter','system-ui','sans-serif'] }
    },
  },
  plugins: [],
} satisfies Config
