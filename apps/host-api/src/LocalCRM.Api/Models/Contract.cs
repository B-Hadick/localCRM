namespace LocalCRM.Api.Models;

public class Contract
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public Guid? QuoteId { get; set; }

    public Guid? ScopeOfWorkId { get; set; }

    public string ContractNumber { get; set; } = "";

    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public decimal Amount { get; set; }

    public string Status { get; set; } = "Draft";

    public DateTime ContractDateUtc { get; set; }

    public DateTime? SentAtUtc { get; set; }

    public DateTime? SignedAtUtc { get; set; }

    public DateTime? CompletedBillableAtUtc { get; set; }

    public DateTime? CancelledAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}