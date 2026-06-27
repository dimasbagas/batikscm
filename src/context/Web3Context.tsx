import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { BrowserProvider, Contract } from 'ethers'

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  connectWallet: () => Promise<string | null>
  disconnectWallet: () => void
  getBatikContract: () => Promise<Contract | null>
}

const Web3Context = createContext<Web3ContextType | null>(null)

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

export const BatikNFT_ABI = [
  'function registerProduct(string _productName, string _producerName, string _originRegion, string _metadataHash, string _photoUrl) external returns (uint256)',
  'function mintCertificate(uint256 _tokenId, address _to, string _certificateURI) external returns (uint256)',
  'function verifyProduct(uint256 _tokenId, string _metadataHash) external view returns (bool isValid, string productName, string producerName, string originRegion, string onChainHash, uint8 status)',
  'event ProductRegistered(uint256 indexed tokenId, string productName, string producerName, string metadataHash)',
  'event CertificateMinted(uint256 indexed tokenId, address indexed owner, string uri)'
]

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = (window as any).ethereum
      if (ethereum && ethereum.selectedAddress) {
        setAccount(ethereum.selectedAddress)
      }
    }
    checkConnection()
  }, [])

  useEffect(() => {
    const ethereum = (window as any).ethereum
    if (ethereum) {
      const handleAccountsChange = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          setAccount(null)
        }
      }
      ethereum.on('accountsChanged', handleAccountsChange)
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChange)
      }
    }
  }, [])

  const connectWallet = useCallback(async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) {
      alert('Silakan instal dompet MetaMask terlebih dahulu!')
      return null
    }

    try {
      const provider = new BrowserProvider(ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      if (accounts.length > 0) {
        setAccount(accounts[0])
        return accounts[0]
      }
    } catch (error: any) {
      console.error('Failed to connect MetaMask wallet:', error)
      alert('Gagal menghubungkan MetaMask: ' + (error.message || error))
    }
    return null
  }, [])

  const disconnectWallet = useCallback(() => {
    setAccount(null)
  }, [])

  const getBatikContract = useCallback(async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return null

    try {
      const provider = new BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      return new Contract(CONTRACT_ADDRESS, BatikNFT_ABI, signer)
    } catch (error) {
      console.error('Failed to instantiate smart contract:', error)
      return null
    }
  }, [])

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnected: !!account,
        connectWallet,
        disconnectWallet,
        getBatikContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  const ctx = useContext(Web3Context)
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider')
  return ctx
}
