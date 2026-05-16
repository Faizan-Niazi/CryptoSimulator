using CryptoSimulator.Data.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CryptoSimulator.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Wallet> Wallets { get; set; }
    public DbSet<PortfolioItem> Portfolios { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<WatchlistItem> Watchlists { get; set; }
}
