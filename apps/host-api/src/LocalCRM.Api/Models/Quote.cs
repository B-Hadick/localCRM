namespace LocalCRM.Api.Models;

public class Quote
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public string QuoteNumber { get; set; } = "";

    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public decimal Amount { get; set; }

    public string Status { get; set; } = "Draft";

    public DateTime QuoteDateUtc { get; set; }

    public DateTime? SentAtUtc { get; set; }

    public DateTime? AcceptedAtUtc { get; set; }

    public DateTime? RejectedAtUtc { get; set; }

    public DateTime? ExpiredAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}