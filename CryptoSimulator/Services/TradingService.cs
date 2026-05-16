using Microsoft.EntityFrameworkCore;
using CryptoSimulator.Data;
using CryptoSimulator.Data.Models;

namespace CryptoSimulator.Services;

public class TradingService(ApplicationDbContext dbContext)
{
    public async Task<(bool Success, string Message)> BuyCoinAsync(string userId, string coinId, string symbol, decimal quantity, decimal priceAtTrade)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync();
        try
        {
            var wallet = await dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null) return (false, "Wallet not found.");

            decimal totalCost = quantity * priceAtTrade;
            if (wallet.Balance < totalCost) return (false, "Insufficient balance.");

            // Deduct from wallet
            wallet.Balance -= totalCost;

            // Update Portfolio
            var portfolioItem = await dbContext.Portfolios.FirstOrDefaultAsync(p => p.UserId == userId && p.CoinId == coinId);
            if (portfolioItem == null)
            {
                portfolioItem = new PortfolioItem
                {
                    UserId = userId,
                    CoinId = coinId,
                    Symbol = symbol,
                    Quantity = quantity,
                    AverageBuyPrice = priceAtTrade
                };
                dbContext.Portfolios.Add(portfolioItem);
            }
            else
            {
                // Calculate new average price
                decimal totalQuantity = portfolioItem.Quantity + quantity;
                decimal totalCostBasis = (portfolioItem.Quantity * portfolioItem.AverageBuyPrice) + totalCost;
                portfolioItem.AverageBuyPrice = totalCostBasis / totalQuantity;
                portfolioItem.Quantity = totalQuantity;
            }

            // Record Transaction
            var tradeRecord = new Transaction
            {
                UserId = userId,
                CoinId = coinId,
                Symbol = symbol,
                Type = TransactionType.Buy,
                Quantity = quantity,
                PriceAtTrade = priceAtTrade,
                TotalUsdAmount = totalCost
            };
            dbContext.Transactions.Add(tradeRecord);

            await dbContext.SaveChangesAsync();
            await transaction.CommitAsync();
            return (true, "Purchase successful.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return (false, "An error occurred during the purchase.");
        }
    }

    public async Task<(bool Success, string Message)> SellCoinAsync(string userId, string coinId, decimal quantity, decimal priceAtTrade)
    {
        using var transaction = await dbContext.Database.BeginTransactionAsync();
        try
        {
            var portfolioItem = await dbContext.Portfolios.FirstOrDefaultAsync(p => p.UserId == userId && p.CoinId == coinId);
            if (portfolioItem == null || portfolioItem.Quantity < quantity) return (false, "Insufficient holdings.");

            var wallet = await dbContext.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
            if (wallet == null) return (false, "Wallet not found.");

            decimal totalRevenue = quantity * priceAtTrade;

            // Add to wallet
            wallet.Balance += totalRevenue;

            // Update Portfolio
            portfolioItem.Quantity -= quantity;
            if (portfolioItem.Quantity == 0)
            {
                dbContext.Portfolios.Remove(portfolioItem);
            }

            // Record Transaction
            var tradeRecord = new Transaction
            {
                UserId = userId,
                CoinId = coinId,
                Symbol = portfolioItem.Symbol,
                Type = TransactionType.Sell,
                Quantity = quantity,
                PriceAtTrade = priceAtTrade,
                TotalUsdAmount = totalRevenue
            };
            dbContext.Transactions.Add(tradeRecord);

            await dbContext.SaveChangesAsync();
            await transaction.CommitAsync();
            return (true, "Sale successful.");
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return (false, "An error occurred during the sale.");
        }
    }

    public async Task<decimal> GetTotalPortfolioValueAsync(string userId, List<CoinModel> currentPrices)
    {
        var portfolio = await dbContext.Portfolios.Where(p => p.UserId == userId).ToListAsync();
        decimal totalValue = 0;

        foreach (var item in portfolio)
        {
            var currentPrice = currentPrices.FirstOrDefault(c => c.Id == item.CoinId)?.CurrentPrice ?? item.AverageBuyPrice;
            totalValue += item.Quantity * currentPrice;
        }

        return totalValue;
    }
}
