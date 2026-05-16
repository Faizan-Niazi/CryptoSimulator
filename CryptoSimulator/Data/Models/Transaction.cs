using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CryptoSimulator.Data.Models;

public enum TransactionType
{
    Buy,
    Sell
}

public class Transaction
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;

    [Required]
    public string CoinId { get; set; } = string.Empty;

    [Required]
    public string Symbol { get; set; } = string.Empty;

    [Required]
    public TransactionType Type { get; set; }

    [Column(TypeName = "decimal(38, 18)")]
    public decimal Quantity { get; set; }

    [Column(TypeName = "decimal(38, 18)")]
    public decimal PriceAtTrade { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalUsdAmount { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
