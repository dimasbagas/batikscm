import { Injectable, Logger } from '@nestjs/common'
import { ethers } from 'ethers'
import { BatikNFT_ABI } from './abi'

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name)
  private provider: ethers.JsonRpcProvider
  private wallet: ethers.Wallet
  private contract: ethers.Contract
  private operatorAddress: string

  constructor() {
    const providerUrl = process.env.BLOCKCHAIN_PROVIDER_URL || 'http://127.0.0.1:8545'
    const privateKey = process.env.OPERATOR_PRIVATE_KEY
    const contractAddress = process.env.CONTRACT_ADDRESS

    if (!privateKey || !contractAddress) {
      this.logger.warn('Blockchain provider not fully configured. OPERATOR_PRIVATE_KEY or CONTRACT_ADDRESS is missing.')
      return
    }

    try {
      this.provider = new ethers.JsonRpcProvider(providerUrl)
      this.wallet = new ethers.Wallet(privateKey, this.provider)
      this.contract = new ethers.Contract(contractAddress, BatikNFT_ABI, this.wallet)
      this.operatorAddress = this.wallet.address
      this.logger.log(`Blockchain initialized on ${providerUrl}. Contract: ${contractAddress}. Operator: ${this.operatorAddress}`)
    } catch (error) {
      this.logger.error(`Error initializing blockchain provider: ${error.message}`, error.stack)
    }
  }

  isConfigured(): boolean {
    return !!this.contract
  }

  getOperatorAddress(): string {
    return this.operatorAddress || ''
  }

  async getNonce(): Promise<number> {
    if (!this.isConfigured()) return 0
    try {
      return await this.wallet.getNonce('pending')
    } catch (error) {
      this.logger.error(`Failed to get blockchain nonce: ${error.message}`)
      return await this.wallet.getNonce('latest')
    }
  }

  async registerProduct(
    productName: string,
    producerName: string,
    originRegion: string,
    metadataHash: string,
    photoUrl: string,
    options?: { nonce?: number },
  ): Promise<{ txHash: string; onChainTokenId: number }> {
    if (!this.isConfigured()) {
      this.logger.warn('Blockchain service is not configured. Simulating product registration.')
      return {
        txHash: '0x' + '0'.repeat(64),
        onChainTokenId: Math.floor(Math.random() * 1000) + 1,
      }
    }

    try {
      this.logger.log(`Registering product on-chain: ${productName} with options: ${JSON.stringify(options || {})}`)
      const tx = await this.contract.registerProduct(
        productName,
        producerName,
        originRegion,
        metadataHash,
        photoUrl,
        options || {},
      )
      const receipt = await tx.wait()

      const parsedEvent = receipt.logs
        .map((log: any) => {
          try {
            return this.contract.interface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((event: any) => event && event.name === 'ProductRegistered')

      if (!parsedEvent) {
        throw new Error('ProductRegistered event not found in transaction logs')
      }

      const onChainTokenId = Number(parsedEvent.args.tokenId)
      this.logger.log(`Product registered successfully. Tx: ${receipt.hash}, Token ID: ${onChainTokenId}`)

      return {
        txHash: receipt.hash,
        onChainTokenId,
      }
    } catch (error) {
      this.logger.error(`Failed to register product on-chain: ${error.message}`, error.stack)
      throw error
    }
  }

  async mintCertificate(
    onChainTokenId: number,
    toAddress: string,
    certificateURI: string,
    options?: { nonce?: number },
  ): Promise<{ txHash: string }> {
    if (!this.isConfigured()) {
      this.logger.warn('Blockchain service is not configured. Simulating certificate minting.')
      return {
        txHash: '0x' + '0'.repeat(64),
      }
    }

    try {
      const recipient = toAddress || this.operatorAddress
      this.logger.log(`Minting certificate on-chain for Token ID: ${onChainTokenId} to ${recipient} with options: ${JSON.stringify(options || {})}`)
      const tx = await this.contract.mintCertificate(onChainTokenId, recipient, certificateURI, options || {})
      const receipt = await tx.wait()
      this.logger.log(`Certificate minted successfully. Tx: ${receipt.hash}`)
      return { txHash: receipt.hash }
    } catch (error) {
      this.logger.error(`Failed to mint certificate on-chain: ${error.message}`, error.stack)
      throw error
    }
  }

  async verifyProduct(
    onChainTokenId: number,
    metadataHash: string,
  ): Promise<{ isValid: boolean; onChainHash: string; status: number }> {
    if (!this.isConfigured()) {
      this.logger.warn('Blockchain service is not configured. Simulating product verification.')
      return {
        isValid: true,
        onChainHash: metadataHash,
        status: 1, // Certified
      }
    }

    try {
      const result = await this.contract.verifyProduct(onChainTokenId, metadataHash)
      return {
        isValid: result[0],
        onChainHash: result[4],
        status: Number(result[5]),
      }
    } catch (error) {
      this.logger.error(`Failed to verify product on-chain: ${error.message}`, error.stack)
      throw error
    }
  }

  async distributeProduct(
    onChainTokenId: number,
    photoUrl: string,
    distributorName: string,
    newMetadataHash: string,
    options?: { nonce?: number },
  ): Promise<{ txHash: string }> {
    if (!this.isConfigured()) {
      this.logger.warn('Blockchain service is not configured. Simulating product distribution.')
      return {
        txHash: '0x' + '0'.repeat(64),
      }
    }

    try {
      this.logger.log(`Distributing product on-chain. Token ID: ${onChainTokenId}, Distributor: ${distributorName}`)
      const tx = await this.contract.distributeProduct(
        onChainTokenId,
        photoUrl,
        distributorName,
        newMetadataHash,
        options || {},
      )
      const receipt = await tx.wait()
      this.logger.log(`Product distributed successfully. Tx: ${receipt.hash}`)
      return { txHash: receipt.hash }
    } catch (error) {
      this.logger.error(`Failed to distribute product on-chain: ${error.message}`, error.stack)
      throw error
    }
  }
}
