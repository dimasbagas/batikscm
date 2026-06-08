import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class MetadataService {
  constructor(private prisma: PrismaService) {}

  async getMetadata(tokenId: string) {
    const product = await this.prisma.product.findUnique({
      where: { tokenId },
      include: { producer: { select: { name: true, umkmName: true } } },
    })
    if (!product) return null

    return {
      name: `BatikChain Certificate #${product.tokenId}`,
      description: `Certificate of Authenticity for ${product.productName}. This batik product is registered and verified on the BatikChain blockchain.`,
      image: product.imageUrl,
      external_url: `https://batikchain.id/verify/${product.tokenId}`,
      attributes: [
        { trait_type: 'Product Name', value: product.productName },
        { trait_type: 'Producer', value: product.producerName || product.producer?.name || product.producer?.umkmName || '' },
        { trait_type: 'Origin', value: product.originLocation },
        { trait_type: 'Production Date', value: product.productionDate.toISOString().split('T')[0] },
        { trait_type: 'Token ID', value: product.tokenId },
        { trait_type: 'Metadata Hash', value: product.metadataHash },
        { trait_type: 'Status', value: product.status },
      ],
    }
  }
}
