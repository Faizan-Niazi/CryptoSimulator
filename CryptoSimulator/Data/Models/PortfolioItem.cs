using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CryptoSimulator.Data.Models;

public class PortfolioItem
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public ApplicationUser User { get; set; } = null!;

    [Required]
    public string CoinId { get; set; } = string.Empty; // e.g., "bitcoin"

    [Required]
    public string Symbol { get; set; } = string.Empty; // e.g., "btc"

    [Column(TypeName = "decimal(38, 18)")]
    public decimal Quantity { get; set; }

    [Column(TypeName = "decimal(38, 18)")]
    public decimal AverageBuyPrice { get; set; }
}
