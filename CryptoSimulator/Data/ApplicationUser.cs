using CryptoSimulator.Data.Models;
using Microsoft.AspNetCore.Identity;

namespace CryptoSimulator.Data;

// Add profile data for application users by adding properties to the ApplicationUser class
public class ApplicationUser : IdentityUser
{
    public Wallet? Wallet { get; set; }
    public ICollection<PortfolioItem> Portfolio { get; set; } = new List<PortfolioItem>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}

