export interface User {
  id: string
  email: string
  name: string
  role: 'visitor' | 'umkm' | 'verificator' | 'admin'
  umkmName?: string
  phone?: string
  city?: string
  province?: string
  avatar?: string
}

export interface Product {
  id: string
  tokenId: string
  productName: string
  batikName?: string
  category?: string
  motif?: string
  originLocation: string
  description?: string
  productionDate: string
  price?: number
  stock?: number
  imageUrl: string
  detailImageUrl?: string
  metadataHash: string
  certificationDate: string
  producerName: string
  producerId: string
  status: 'registered' | 'verified' | 'rejected'
  certificateId?: string
  contractAddress?: string
  transactionHash?: string
}

export interface Certificate {
  id: string
  tokenId: string
  productId: string
  productName: string
  producerName: string
  originLocation: string
  productionDate: string
  certificationDate: string
  metadataHash: string
  imageUrl: string
  qrValue: string
  nftTokenId?: string
  contractAddress?: string
}

export interface VerificationResult {
  valid: boolean
  message: string
  product?: Product
  timestamp: string
}

export interface DashboardStats {
  totalProducts: number
  totalCertificates: number
  totalScans: number
  verifiedProducts: number
  recentProducts: Product[]
}

export interface AdminStats {
  totalUsers: number
  totalUmkm: number
  totalProducts: number
  totalCertificates: number
  totalVerifications: number
  recentProducts: Product[]
}
