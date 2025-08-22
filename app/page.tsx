"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, RefreshCw, Search } from "lucide-react"

interface TokenPool {
  id: string
  name: string
  pool_name: string
  price_usd: number
  price_change_24h: number
  volume_24h: number
  market_cap: number
}

interface ExchangeRates {
  USD: number
  PHP: number
}

const POOL_ADDRESSES = [
  "0x8d896c96ffcafbf12d86dd4510236de7bcfa7dcf",
  "0x0016c4c602cc1a96a9d35fe133a7e374d3cdc26d",
  "0x70c063f17dacb35e4b3df06c8f36020416a44a3c",
  "0xc356cd52364541379ad4d31a889b7031e758220a",
  "0x8b1a1b7b43a53904b0a05406c13399079e553501",
  "0xb287ea5a5cd4f2b74571e30fdec96241aa5163d9",
  "0x0f8f4dcf1b6eb9f5c0e8fbb9cd6879aa3983c8bc",
  "0x4343846ebe54dcd40ba572275640230d533296e5",
  "0xfa3a564b27deb29781f80032df662a4406eebef6",
  "0xd1d6bb059c97295f7437ad423111047cbcddf4c6",
  "0xefc128c4cb990a5ecc88ff71e9efcc0eaef434d2",
  "0x6ccd01c951e57d82be8dccb90c01a58bfb4d83cd",
  "0xe973dc221bb031010ec673105ed8b04c9e713b9d",
  "0xe63f8cefea9a17a259bb3b375929bd10d5e1cdfa",
  "0x6d8839a585f7877a5e218a217c07334980f04a4a",
  "0x54ae64826ca9d440ede8c33e6cf4cfa1a3aa5801",
  "0xb0a3c31aae83526fd6ee75aac552822d676f46b2",
  "0x346e30b7ca273fb001eec84fabf2b693617df710",
  "0x4782e36bbe6e9abca5357d3e43a090fa772de71b",
  "0x491a412400840651c243acfc1ed9947ffe8a4e8f",
  "0xda4145a4975b1219e85a233673187309c4840044",
  "0x6f363e6760876a4c66730fbbefccdd3014b6220c",
  "0x0ab775634107063a7c16c6c8e0fd6bda1f219ae6",
  "0x7bf03c63adfded079adbd9f807ccce0fd28b8fd8",
]

const TOKEN_NAME_MAPPING: Record<string, string> = {
  "0x8d896c96ffcafbf12d86dd4510236de7bcfa7dcf": "COIN",
  "0x0016c4c602cc1a96a9d35fe133a7e374d3cdc26d": "SCREW",
  "0x70c063f17dacb35e4b3df06c8f36020416a44a3c": "STEEL",
  "0xc356cd52364541379ad4d31a889b7031e758220a": "EARTH",
  "0x8b1a1b7b43a53904b0a05406c13399079e553501": "CLAY",
  "0xb287ea5a5cd4f2b74571e30fdec96241aa5163d9": "MUD",
  "0x0f8f4dcf1b6eb9f5c0e8fbb9cd6879aa3983c8bc": "FUEL",
  "0x4343846ebe54dcd40ba572275640230d533296e5": "OXYGEN",
  "0xfa3a564b27deb29781f80032df662a4406eebef6": "CERAMICS",
  "0xd1d6bb059c97295f7437ad423111047cbcddf4c6": "SEAWATER",
  "0xefc128c4cb990a5ecc88ff71e9efcc0eaef434d2": "ACID",
  "0x6ccd01c951e57d82be8dccb90c01a58bfb4d83cd": "HEAT",
  "0xe973dc221bb031010ec673105ed8b04c9e713b9d": "FIRE",
  "0xe63f8cefea9a17a259bb3b375929bd10d5e1cdfa": "ALGAE",
  "0x6d8839a585f7877a5e218a217c07334980f04a4a": "SAND",
  "0x54ae64826ca9d440ede8c33e6cf4cfa1a3aa5801": "LAVA",
  "0xb0a3c31aae83526fd6ee75aac552822d676f46b2": "ENERGY",
  "0x346e30b7ca273fb001eec84fabf2b693617df710": "SULFUR",
  "0x4782e36bbe6e9abca5357d3e43a090fa772de71b": "GAS",
  "0x491a412400840651c243acfc1ed9947ffe8a4e8f": "CEMENT",
  "0xda4145a4975b1219e85a233673187309c4840044": "STONE",
  "0x6f363e6760876a4c66730fbbefccdd3014b6220c": "OIL",
  "0x0ab775634107063a7c16c6c8e0fd6bda1f219ae6": "PLASTICS",
  "0x7bf03c63adfded079adbd9f807ccce0fd28b8fd8": "STEAM",
}

export default function TokenConverter() {
  const [tokens, setTokens] = useState<TokenPool[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ USD: 1, PHP: 56 })
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currency, setCurrency] = useState<"USD" | "PHP">("PHP")
  const [convertAmount, setConvertAmount] = useState("1")
  const [selectedToken, setSelectedToken] = useState("")
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setExchangeRates({
        USD: 1,
        PHP: data.rates.PHP || 56,
      })
    } catch (error) {
      console.error("Failed to fetch exchange rates:", error)
      setExchangeRates({ USD: 1, PHP: 56 })
    }
  }

  const fetchTokenData = async () => {
    try {
      const BATCH_SIZE = 3 // Process 3 tokens at a time
      const DELAY_BETWEEN_BATCHES = 1000 // 1 second delay between batches
      const MAX_RETRIES = 2

      const allTokens: TokenPool[] = []

      // Process addresses in batches to avoid rate limiting
      for (let i = 0; i < POOL_ADDRESSES.length; i += BATCH_SIZE) {
        const batch = POOL_ADDRESSES.slice(i, i + BATCH_SIZE)

        const batchPromises = batch.map(async (address) => {
          let retries = 0

          while (retries <= MAX_RETRIES) {
            try {
              const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/ronin/pools/${address}`)

              if (!response.ok) {
                if (response.status === 429) {
                  // Rate limited
                  console.log(`[v0] Rate limited for ${address}, waiting...`)
                  await new Promise((resolve) => setTimeout(resolve, 2000 * (retries + 1)))
                  retries++
                  continue
                }
                console.warn(`Failed to fetch data for ${address}: ${response.status}`)
                return null
              }

              const data = await response.json()

              if (data.data) {
                const pool = data.data
                const pool_name = TOKEN_NAME_MAPPING[address] || "UNKNOWN"

                return {
                  id: pool.id,
                  name: pool.attributes.name || "Unknown Token",
                  pool_name: pool_name,
                  price_usd: Number.parseFloat(pool.attributes.base_token_price_usd || "0"),
                  price_change_24h: Number.parseFloat(pool.attributes.price_change_percentage?.h24 || "0"),
                  volume_24h: Number.parseFloat(pool.attributes.volume_usd?.h24 || "0"),
                  market_cap: Number.parseFloat(pool.attributes.market_cap_usd || "0"),
                }
              }
              return null
            } catch (error) {
              console.error(`[v0] Failed to fetch data for ${address} (attempt ${retries + 1}):`, error)
              if (retries < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)))
                retries++
              } else {
                return null
              }
            }
          }
          return null
        })

        const batchResults = await Promise.all(batchPromises)
        const validBatchTokens = batchResults.filter((token): token is TokenPool => token !== null)
        allTokens.push(...validBatchTokens)

        console.log(
          `[v0] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(POOL_ADDRESSES.length / BATCH_SIZE)}, got ${validBatchTokens.length} tokens`,
        )

        // Add delay between batches (except for the last batch)
        if (i + BATCH_SIZE < POOL_ADDRESSES.length) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
        }
      }

      console.log(`[v0] Successfully fetched ${allTokens.length}/${POOL_ADDRESSES.length} tokens`)
      setTokens(allTokens)

      if (allTokens.length > 0 && !selectedToken) {
        setSelectedToken(allTokens[0].pool_name)
      }
    } catch (error) {
      console.error("Failed to fetch token data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    if (tokens.length === 0 && !initialLoading) {
      // This is the very first load
      setInitialLoading(true)
    } else if (tokens.length > 0) {
      // This is a refresh of existing data
      setRefreshing(true)
    }

    await Promise.all([fetchExchangeRates(), fetchTokenData()])
    setLastUpdate(new Date())

    setInitialLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    refreshData()

    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getConvertedValue = () => {
    const amount = Number.parseFloat(convertAmount) || 0
    const token = tokens.find((t) => t.pool_name === selectedToken)
    if (token) {
      return (amount * token.price_usd * exchangeRates.PHP).toFixed(6)
    }
    return "0"
  }

  const getTokenPrice = (pool_name: string) => {
    const token = tokens.find((t) => t.pool_name === pool_name)
    return token ? token.price_usd * exchangeRates.PHP : 0
  }

  const formatPrice = (price: number, targetCurrency: "USD" | "PHP" = currency) => {
    const convertedPrice = targetCurrency === "PHP" ? price * exchangeRates.PHP : price
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: targetCurrency,
      minimumFractionDigits: targetCurrency === "PHP" ? 2 : 6,
      maximumFractionDigits: targetCurrency === "PHP" ? 2 : 6,
    }).format(convertedPrice)
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const filteredTokens = tokens.filter((token) => token.pool_name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('https://voya-games.gitbook.io/voya-games-litepaper/~gitbook/image?url=https%3A%2F%2F1677138888-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FePKSw0hUcw8DHLu9qvMm%252Fuploads%252FzRnYgnyx5iEAyZXTXdqL%252Fcoin.png%3Falt%3Dmedia%26token%3D02ed7e57-e62b-4052-aadd-144b8c1cc328&width=1248&dpr=1&quality=100&sign=71745d35&sv=2')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-white text-center mb-6">Token Converter</h2>

            <Card className="shadow-lg border-gray-200 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Enter Amount */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">$</span>
                      </div>
                      <label className="text-sm font-medium text-blue-600">Enter Amount</label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={convertAmount}
                        onChange={(e) => setConvertAmount(e.target.value)}
                        className="flex-1 border-blue-200 focus:border-blue-400"
                        placeholder="1"
                      />
                      <Select value={selectedToken} onValueChange={setSelectedToken}>
                        <SelectTrigger className="w-32 border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tokens.map((token) => (
                            <SelectItem key={token.id} value={token.pool_name}>
                              {token.pool_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Converted Value */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <label className="text-sm font-medium text-green-600">Converted Value</label>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={getConvertedValue()}
                        readOnly
                        className="flex-1 bg-green-50 border-green-200 text-green-700 font-semibold"
                      />
                      <Select value="PHP" disabled>
                        <SelectTrigger className="w-24 border-green-200 bg-green-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PHP">PHP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-lg">🪙</span>
                    <span className="text-gray-600 text-sm font-medium">
                      1 {selectedToken} = ₱{getTokenPrice(selectedToken).toFixed(6)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <h1 className="text-lg font-semibold text-gray-800">Current Market Prices</h1>
              {refreshing && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              )}
              <button
                onClick={refreshData}
                disabled={refreshing || initialLoading}
                className="ml-auto flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm text-gray-600">Real-time prices • Updates every 30 seconds</p>
              <div className="relative ml-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 border-gray-200 focus:border-blue-400 placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {filteredTokens.length === 0 && tokens.length === 0 ? (
                // Show placeholder cards during initial load
                POOL_ADDRESSES.map((address, index) => {
                  const tokenName = TOKEN_NAME_MAPPING[address] || "UNKNOWN"
                  if (searchQuery && !tokenName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return null
                  }
                  return (
                    <div key={address} className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="bg-gray-400 rounded-full flex items-center justify-center w-6 h-6">
                          <span className="text-white text-xs font-bold">$</span>
                        </div>
                        <span className="text-gray-700 text-sm font-semibold">${tokenName}</span>
                      </div>
                      <div className="text-gray-400 text-lg font-bold">
                        ₱0.000000
                        <span className="ml-2 inline-block animate-pulse text-xs">●</span>
                      </div>
                    </div>
                  )
                }).filter(Boolean)
              ) : filteredTokens.length === 0 && searchQuery ? (
                // Show no results message when search returns no matches
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No tokens found matching "{searchQuery}"</p>
                </div>
              ) : (
                filteredTokens.map((token, index) => {
                  const getPriceChangeColor = () => {
                    if (token.price_change_24h > 0) {
                      return {
                        bg: "bg-green-50",
                        border: "border-green-200",
                        text: "text-green-700",
                        price: "text-green-600",
                        icon: "bg-green-500",
                      }
                    } else if (token.price_change_24h < 0) {
                      return {
                        bg: "bg-red-50",
                        border: "border-red-200",
                        text: "text-red-700",
                        price: "text-red-600",
                        icon: "bg-red-500",
                      }
                    } else {
                      return {
                        bg: "bg-white",
                        border: "border-gray-200",
                        text: "text-gray-700",
                        price: "text-gray-600",
                        icon: "bg-gray-500",
                      }
                    }
                  }

                  const colorScheme = getPriceChangeColor()
                  const priceInPHP = token.price_usd * exchangeRates.PHP

                  return (
                    <div
                      key={token.id}
                      className={`${colorScheme.bg} border ${colorScheme.border} rounded-lg px-4 py-3`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`${colorScheme.icon} rounded-full flex items-center justify-center w-6 h-6`}>
                          <span className="text-white text-xs font-bold">$</span>
                        </div>
                        <span className={`${colorScheme.text} text-sm font-semibold`}>${token.pool_name}</span>
                      </div>
                      <div className={`${colorScheme.price} text-lg font-bold`}>
                        ₱{priceInPHP.toFixed(6)}
                        {refreshing && <span className="ml-2 inline-block animate-pulse text-xs text-gray-400">●</span>}
                      </div>
                      {token.price_change_24h !== 0 && (
                        <div
                          className={`text-xs mt-1 ${token.price_change_24h >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {token.price_change_24h >= 0 ? "+" : ""}
                          {token.price_change_24h.toFixed(2)}%
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
