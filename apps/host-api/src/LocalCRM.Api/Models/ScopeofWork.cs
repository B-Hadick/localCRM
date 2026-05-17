namespace LocalCRM.Api.Models;

public class ScopeOfWork
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public Guid? QuoteId { get; set; }

    public Guid? ContractId { get; set; }

    public string ScopeNumber { get; set; } = "";

    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public string Deliverables { get; set; } = "";

    public string Assumptions { get; set; } = "";

    public string Exclusions { get; set; } = "";

    public decimal EstimatedAmount { get; set; }

    public string Status { get; set; } = "Draft";

    public DateTime ScopeDateUtc { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }

    public DateTime? ApprovedAtUtc { get; set; }

    public DateTime? ActivatedAtUtc { get; set; }

    public DateTime? CompletedAtUtc { get; set; }

    public DateTime? CancelledAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}