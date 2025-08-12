export interface User {
  id: string
  name: string
  role: string
}

export interface AuthCredentials {
  username: string
  password: string
  name: string
  role: string
}

// ブラウザ互換のハッシュ関数
async function simpleHash(text: string): Promise<string> {
  if (typeof window !== 'undefined') {
    // ブラウザ環境
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } else {
    // Node.js環境（サーバーサイド）
    try {
      const crypto = await import('crypto')
      return crypto.createHash('sha256').update(text).digest('hex')
    } catch (error) {
      // Fallback for edge runtime
      return btoa(text).replace(/[^a-zA-Z0-9]/g, '')
    }
  }
}

// 環境変数から認証情報を取得（Vercel Edge Runtime対応）
function getValidCredentials(): AuthCredentials[] {
  const credentials: AuthCredentials[] = []
  
  // 環境変数の取得（Edge Runtime対応）
  const getEnvVar = (key: string): string | undefined => {
    if (typeof window !== 'undefined') {
      // クライアントサイドでは使用不可
      return undefined
    }
    // Edge Runtime環境でも動作するように修正
    try {
      return process.env[key] || globalThis.process?.env?.[key]
    } catch (error) {
      console.error(`Failed to read env var ${key}:`, error)
      return undefined
    }
  }
  
  // ユーザー1
  const user1Username = getEnvVar('AUTH_USER1_USERNAME')
  const user1Password = getEnvVar('AUTH_USER1_PASSWORD')
  if (user1Username && user1Password) {
    credentials.push({
      username: user1Username,
      password: user1Password,
      name: getEnvVar('AUTH_USER1_NAME') || 'User 1',
      role: getEnvVar('AUTH_USER1_ROLE') || 'operator'
    })
  }
  
  // ユーザー2
  const user2Username = getEnvVar('AUTH_USER2_USERNAME')
  const user2Password = getEnvVar('AUTH_USER2_PASSWORD')
  if (user2Username && user2Password) {
    credentials.push({
      username: user2Username,
      password: user2Password,
      name: getEnvVar('AUTH_USER2_NAME') || 'User 2',
      role: getEnvVar('AUTH_USER2_ROLE') || 'supervisor'
    })
  }
  
  // ユーザー3
  const user3Username = getEnvVar('AUTH_USER3_USERNAME')
  const user3Password = getEnvVar('AUTH_USER3_PASSWORD')
  if (user3Username && user3Password) {
    credentials.push({
      username: user3Username,
      password: user3Password,
      name: getEnvVar('AUTH_USER3_NAME') || 'User 3',
      role: getEnvVar('AUTH_USER3_ROLE') || 'admin'
    })
  }
  
  return credentials
}

// セキュアな認証関数（Vercel Edge Runtime対応）
export async function authenticate(username: string, password: string): Promise<User | null> {
  try {
    const validCredentials = getValidCredentials()
    
    // デバッグ用ログ（環境変数読み込み状況も含む）
    console.log('Available credentials count:', validCredentials.length)
    console.log('Environment variables check:', {
      hasUser1Username: !!process.env.AUTH_USER1_USERNAME,
      hasUser1Password: !!process.env.AUTH_USER1_PASSWORD,
      user1UsernameValue: process.env.AUTH_USER1_USERNAME,
      allEnvKeys: Object.keys(process.env).filter(k => k.startsWith('AUTH_'))
    })
    
    // ユーザー名で検索
    const user = validCredentials.find(cred => cred.username === username)
    if (!user) {
      console.log('User not found:', username, 'Available users:', validCredentials.map(c => c.username))
      return null
    }
    
    // パスワード検証（平文比較 - 本番環境では改善要）
    if (user.password === password) {
      console.log('Authentication successful for:', username)
      return {
        id: user.username,
        name: user.name,
        role: user.role
      }
    }
    
    console.log('Password mismatch for:', username)
    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// セッショントークンの生成（簡易版）
export async function generateSessionToken(user: User): Promise<string> {
  const timestamp = Date.now()
  const payload = JSON.stringify({ user, timestamp })
  return await simpleHash(payload)
}

// セッショントークンの検証（簡易版）
export async function verifySessionToken(token: string, userData: string): Promise<boolean> {
  try {
    const expectedToken = await simpleHash(userData)
    return token === expectedToken
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}