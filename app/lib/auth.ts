import crypto from 'crypto'

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

// 環境変数から認証情報を取得（セキュア）
function getValidCredentials(): AuthCredentials[] {
  const credentials: AuthCredentials[] = []
  
  // ユーザー1
  if (process.env.AUTH_USER1_USERNAME && process.env.AUTH_USER1_PASSWORD) {
    credentials.push({
      username: process.env.AUTH_USER1_USERNAME,
      password: process.env.AUTH_USER1_PASSWORD,
      name: process.env.AUTH_USER1_NAME || 'User 1',
      role: process.env.AUTH_USER1_ROLE || 'operator'
    })
  }
  
  // ユーザー2
  if (process.env.AUTH_USER2_USERNAME && process.env.AUTH_USER2_PASSWORD) {
    credentials.push({
      username: process.env.AUTH_USER2_USERNAME,
      password: process.env.AUTH_USER2_PASSWORD,
      name: process.env.AUTH_USER2_NAME || 'User 2',
      role: process.env.AUTH_USER2_ROLE || 'supervisor'
    })
  }
  
  // ユーザー3
  if (process.env.AUTH_USER3_USERNAME && process.env.AUTH_USER3_PASSWORD) {
    credentials.push({
      username: process.env.AUTH_USER3_USERNAME,
      password: process.env.AUTH_USER3_PASSWORD,
      name: process.env.AUTH_USER3_NAME || 'User 3',
      role: process.env.AUTH_USER3_ROLE || 'admin'
    })
  }
  
  return credentials
}

// パスワードのハッシュ化（本番環境ではbcryptを使用推奨）
function hashPassword(password: string): string {
  const secret = process.env.SESSION_SECRET || 'default-secret'
  return crypto.createHmac('sha256', secret).update(password).digest('hex')
}

// セキュアな認証関数
export async function authenticate(username: string, password: string): Promise<User | null> {
  try {
    const validCredentials = getValidCredentials()
    
    // ユーザー名で検索
    const user = validCredentials.find(cred => cred.username === username)
    if (!user) {
      return null
    }
    
    // パスワード検証（実際の本番環境では適切な時間ベースの比較を実装）
    if (user.password === password) {
      return {
        id: user.username,
        name: user.name,
        role: user.role
      }
    }
    
    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// セッショントークンの生成
export function generateSessionToken(user: User): string {
  const secret = process.env.SESSION_SECRET || 'default-secret'
  const timestamp = Date.now()
  const payload = JSON.stringify({ user, timestamp })
  
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// セッショントークンの検証
export function verifySessionToken(token: string, userData: string): boolean {
  try {
    const secret = process.env.SESSION_SECRET || 'default-secret'
    const expectedToken = crypto.createHmac('sha256', secret).update(userData).digest('hex')
    
    // タイミング攻撃を防ぐため、crypto.timingSafeEqualを使用
    return crypto.timingSafeEqual(
      Buffer.from(token, 'hex'),
      Buffer.from(expectedToken, 'hex')
    )
  } catch (error) {
    console.error('Token verification error:', error)
    return false
  }
}