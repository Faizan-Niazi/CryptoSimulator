using Microsoft.Extensions.Caching.Memory;
using System.Net.Http.Json;
using CryptoSimulator.Data.Models;

namespace CryptoSimulator.Services;

public class CoinGeckoService(HttpClient httpClient, IMemoryCache cache)
{
    private const string BaseUrl = "https://api.coingecko.com/api/v3";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(60);
    private static readonly SemaphoreSlim ApiSemaphore = new SemaphoreSlim(1, 1);

    public async Task<List<CoinModel>> GetTopCoinsAsync(int count = 50)
    {
        string cacheKey = $"TopCoins_{count}";
        
        if (cache.TryGetValue(cacheKey, out List<CoinModel>? cachedCoins) && cachedCoins != null && cachedCoins.Any())
        {
            return cachedCoins;
        }

        await ApiSemaphore.WaitAsync();
        try
        {
            // Double-check cache after acquiring semaphore
            if (cache.TryGetValue(cacheKey, out List<CoinModel>? secondTryCachedCoins) && secondTryCachedCoins != null)
            {
                return secondTryCachedCoins;
            }

            var request = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page={count}&page=1&sparkline=false");
            request.Headers.Add("User-Agent", "CryptoSimulator/1.0");
            
            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            
            var coins = await response.Content.ReadFromJsonAsync<List<CoinModel>>();
            if (coins != null && coins.Any())
            {
                cache.Set(cacheKey, coins, CacheDuration);
                return coins;
            }
            return new List<CoinModel>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching coins: {ex.Message}");
            return new List<CoinModel>();
        }
        finally
        {
            ApiSemaphore.Release();
        }
    }

    public async Task<decimal?> GetPriceAsync(string coinId)
    {
        string cacheKey = $"Price_{coinId}";

        if (cache.TryGetValue(cacheKey, out decimal cachedPrice))
        {
            return cachedPrice;
        }

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/simple/price?ids={coinId}&vs_currencies=usd");
            request.Headers.Add("User-Agent", "CryptoSimulator/1.0");

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var priceData = await response.Content.ReadFromJsonAsync<Dictionary<string, Dictionary<string, decimal>>>();
            
            if (priceData != null && priceData.TryGetValue(coinId, out var priceDict))
            {
                if (priceDict.TryGetValue("usd", out var price))
                {
                    cache.Set(cacheKey, price, CacheDuration);
                    return price;
                }
            }
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching price for {coinId}: {ex.Message}");
            return null;
        }
    }
}
