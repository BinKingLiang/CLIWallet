import { createWalletClient, createPublicClient, http, parseEther, encodeFunctionData } from 'viem'
import { sepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

export class WalletService {
  private walletClient = createWalletClient({
    chain: sepolia,
    transport: http()
  })
  private publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  })
  private account: ReturnType<typeof privateKeyToAccount> | null = null

  async generatePrivateKey(): Promise<{privateKey: string, publicKey: string}> {
    const { randomBytes } = await import('crypto')
    const bytes = randomBytes(32)
    const privateKey = `0x${bytes.toString('hex')}`
    this.account = privateKeyToAccount(privateKey as `0x${string}`)
    return {
      privateKey,
      publicKey: this.account.address
    }
  }

  async getBalance(address: `0x${string}`): Promise<string> {
    const balance = await this.publicClient.getBalance({ address })
    return parseEther(balance.toString()).toString()
  }

  async buildERC20Transfer(
    tokenAddress: `0x${string}`,
    to: `0x${string}`,
    amount: string
  ): Promise<any> {
    const value = parseEther(amount)
    return {
      account: this.account,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [to, BigInt(value.toString())]
      }),
      chain: sepolia,
      type: 'eip1559'
    }
  }

  async signAndSendTransaction(tx: any): Promise<string> {
    const signedTx = await this.walletClient.signTransaction(tx)
    const txHash = await this.walletClient.sendRawTransaction({
      serializedTransaction: signedTx
    })
    return txHash
  }

  getTransactionLink(txHash: string): string {
    return this.walletClient.chain.id === sepolia.id 
      ? `https://sepolia.etherscan.io/tx/${txHash}`
      : `https://etherscan.io/tx/${txHash}`
  }
}

const erc20Abi = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function'
  }
] as const
