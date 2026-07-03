import http from './http'
import type { Product, Certificate, VerificationResult, DashboardStats, AdminStats, User as UserType } from '../types'

export async function getProducts(): Promise<Product[]> {
  const res = await http.get('/products')
  return (res.data ?? []).map(mapProduct)
}

export async function getPublicDistributors(): Promise<any[]> {
  const res = await http.get('/auth/distributors')
  return res.data ?? []
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const res = await http.get(`/products/${id}`)
    return mapProduct(res.data)
  } catch {
    return undefined
  }
}

export async function registerProduct(data: Record<string, unknown>): Promise<Product> {
  const res = await http.post('/products', data)
  return mapProduct(res.data)
}

export async function distributeProduct(productId: string, imageUrl: string, distributorName: string): Promise<Product> {
  const res = await http.post(`/products/${productId}/distribute`, { imageUrl, distributorName })
  return mapProduct(res.data)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await http.get('/dashboard/umkm')
    const d = res.data ?? {}
    return {
      totalProducts: d.totalProducts ?? 0,
      totalCertificates: d.totalCertificates ?? 0,
      totalScans: d.totalScans ?? 0,
      verifiedProducts: d.verifiedProducts ?? 0,
      recentProducts: (d.recentProducts ?? []).map(mapProduct),
    }
  } catch {
    return { totalProducts: 0, totalCertificates: 0, totalScans: 0, verifiedProducts: 0, recentProducts: [] }
  }
}

export async function verifyProduct(tokenId: string, hash: string): Promise<VerificationResult> {
  try {
    const res = await http.post('/verification', { tokenId, hash })
    return {
      valid: res.data.valid ?? false,
      message: res.data.message ?? '',
      product: res.data.product ? mapProduct(res.data.product) : undefined,
      timestamp: res.data.timestamp ?? new Date().toISOString(),
    }
  } catch {
    return { valid: false, message: 'Produk Tidak Terverifikasi atau Diduga Palsu', timestamp: new Date().toISOString() }
  }
}

export async function getCertificate(productId: string): Promise<Certificate | null> {
  try {
    const res = await http.get(`/certificates/${productId}`)
    const d = res.data
    return {
      id: d.id,
      tokenId: d.tokenId ?? d.product?.tokenId ?? '',
      productId: d.productId ?? productId,
      productName: d.productName ?? d.product?.productName ?? '',
      producerName: d.producerName ?? d.product?.producerName ?? '',
      originLocation: d.originLocation ?? d.product?.originLocation ?? '',
      productionDate: d.productionDate ?? d.product?.productionDate ?? '',
      certificationDate: d.certificationDate ?? d.mintedAt ?? '',
      metadataHash: d.metadataHash ?? d.product?.metadataHash ?? '',
      imageUrl: d.imageUrl ?? d.product?.imageUrl ?? '',
      qrValue: JSON.stringify({ tokenId: d.tokenId ?? d.product?.tokenId, hash: d.metadataHash ?? d.product?.metadataHash }),
    }
  } catch {
    return null
  }
}

export async function mintCertificate(productId: string): Promise<{ jobId: string }> {
  const res = await http.post(`/certificates/mint/${productId}`)
  return { jobId: res.data.jobId }
}

export async function getCertificateByProduct(productId: string): Promise<Certificate | null> {
  try {
    const res = await http.get(`/certificates/${productId}`)
    const d = res.data
    return {
      id: d.id,
      tokenId: d.tokenId ?? '',
      productId: d.productId ?? productId,
      productName: d.productName ?? '',
      producerName: d.producerName ?? '',
      originLocation: d.originLocation ?? '',
      productionDate: d.productionDate ?? '',
      certificationDate: d.certificationDate ?? '',
      metadataHash: d.metadataHash ?? '',
      imageUrl: d.imageUrl ?? '',
      qrValue: JSON.stringify({ tokenId: d.tokenId, hash: d.metadataHash }),
    }
  } catch {
    return null
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const res = await http.get('/dashboard/admin')
    const d = res.data ?? {}
    return {
      totalUsers: d.totalUsers ?? 0,
      totalUmkm: d.totalUmkm ?? 0,
      totalProducts: d.totalProducts ?? 0,
      totalCertificates: d.totalCertificates ?? 0,
      totalVerifications: d.totalVerifications ?? 0,
      recentProducts: (d.recentProducts ?? []).map(mapProduct),
    }
  } catch {
    return { totalUsers: 0, totalUmkm: 0, totalProducts: 0, totalCertificates: 0, totalVerifications: 0, recentProducts: [] }
  }
}

export async function getUsers(): Promise<UserType[]> {
  try {
    const res = await http.get('/users')
    const data = res.data ?? []
    return (Array.isArray(data) ? data : []).map((u: any) => ({
      id: u.id,
      email: u.email,
      name: u.name ?? '',
      role: (u.role ?? 'visitor').toLowerCase() as UserType['role'],
      umkmName: u.umkmName,
      phone: u.phone,
      city: u.city,
      province: u.province,
      avatar: u.photoUrl,
    }))
  } catch {
    return []
  }
}

export async function updateUser(id: string, data: Partial<UserType>): Promise<void> {
  await http.patch(`/users/${id}`, data)
}

export async function forgotPassword(email: string): Promise<void> {
  await http.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await http.post('/auth/reset-password', { token, password })
}

export async function getPartnerPengrajin(): Promise<any[]> {
  const res = await http.get('/users/my-pengrajin')
  return res.data
}

export async function receiveProduct(idOrTokenId: string): Promise<any> {
  const res = await http.post(`/products/${idOrTokenId}/receive`)
  return res.data
}

export async function issueFabric(productName: string, producerId: string, quantity: number): Promise<Product[]> {
  const res = await http.post('/products/issue-fabric', { productName, producerId, quantity })
  return (res.data ?? []).map(mapProduct)
}

export async function completeArtisanWork(idOrTokenId: string): Promise<Product> {
  const res = await http.post(`/products/${idOrTokenId}/complete-work`)
  return mapProduct(res.data)
}

export async function recordCertificate(productId: string, onChainTokenId: number, transactionHash: string): Promise<any> {
  const res = await http.post(`/certificates/record/${productId}`, { onChainTokenId, transactionHash })
  return res.data
}

function mapProduct(d: any): Product {
  const certDate = d.certificationDate || d.certificate?.certificationDate || d.certificate?.createdAt;
  return {
    id: d.id ?? '',
    tokenId: d.tokenId ?? '',
    productName: d.productName ?? '',
    producerName: d.producerName ?? d.producer?.name ?? d.producer?.umkmName ?? '',
    originLocation: d.originLocation ?? '',
    productionDate: d.productionDate ? new Date(d.productionDate).toISOString().split('T')[0] : '',
    imageUrl: d.imageUrl ?? '',
    metadataHash: d.metadataHash ?? '',
    certificationDate: certDate ? new Date(certDate).toISOString().split('T')[0] : '',
    producerId: d.producerId ?? d.producer?.id ?? '',
    status: d.status === 'VERIFIED' ? 'verified' :
            d.status === 'DISTRIBUTED' ? 'distributed' :
            d.status === 'RECEIVED' ? 'received' :
            d.status === 'REGISTERED' ? 'registered' :
            d.status === 'FABRIC_ISSUED' ? 'fabric_issued' : 'rejected',
    contractAddress: d.contractAddress ?? d.certificate?.contractAddress ?? '',
    transactionHash: d.transactionHash ?? '',
    onChainTokenId: d.onChainTokenId ?? '',
    distributorId: d.distributorId ?? '',
    distributorName: d.distributorName ?? '',
    distributedAt: d.distributedAt ? new Date(d.distributedAt).toISOString().split('T')[0] : '',
    distributorTxHash: d.distributorTxHash ?? '',
    recipientId: d.recipientId ?? '',
    recipientName: d.recipientName ?? '',
  }
}
