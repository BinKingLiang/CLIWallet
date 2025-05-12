import { useState } from 'react'
import { WalletService } from '../services/wallet'

export function WalletUI() {
  const [wallet] = useState(() => new WalletService())
  const [privateKey, setPrivateKey] = useState<`0x${string}`>('0x')
  const [publicKey, setPublicKey] = useState<`0x${string}`>('0x')
  const [balance, setBalance] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')

  const generateKey = async () => {
    const {privateKey, publicKey} = await wallet.generatePrivateKey()
    setPrivateKey(privateKey as `0x${string}`)
    setPublicKey(publicKey as `0x${string}`)
  }

  const checkBalance = async () => {
    if (!privateKey) return
    const balance = await wallet.getBalance(privateKey as `0x${string}`)
    setBalance(balance)
  }

  const sendERC20 = async () => {
    if (!privateKey || !tokenAddress || !recipient || !amount) return
    try {
      const tx = await wallet.buildERC20Transfer(
        tokenAddress as `0x${string}`,
        recipient as `0x${string}`,
        amount
      )
      if (!tx.account) {
        alert('请先生成私钥')
        return
      }
      const hash = await wallet.signAndSendTransaction(tx)
      setTxHash(hash)
    } catch (error) {
      console.error('发送交易失败:', error)
      alert('发送交易失败: ' + (error as Error).message)
    }
  }

  return (
    <div className="wallet-container">
      <h2>CLI Wallet</h2>
      
      <div className="section">
        <button onClick={generateKey}>Generate Private Key</button>
        {privateKey && (
          <>
            <p>Private Key: {privateKey}</p>
            <p>Public Address: {publicKey}</p>
          </>
        )}
      </div>

      <div className="section">
        <button onClick={checkBalance}>Check Balance</button>
        {balance && <p>Balance: {balance} ETH</p>}
      </div>

      <div className="section">
        <h3>ERC20 Transfer</h3>
        <input 
          placeholder="Token Address" 
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
        />
        <input 
          placeholder="Recipient Address" 
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input 
          placeholder="Amount" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={sendERC20}>Send ERC20</button>
        {txHash && <p>Transaction Hash: {txHash}</p>}
      </div>
    </div>
  )
}
