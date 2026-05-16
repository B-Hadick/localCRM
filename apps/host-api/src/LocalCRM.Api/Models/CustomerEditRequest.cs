namespace LocalCRM.Api.Models;

public class CustomerEditRequest
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public string RequestedByUserId { get; set; } = "";

    public string RequestedByEmail { get; set; } = "";

    public string Status { get; set; } = "Pending";

    public string RequestedName { get; set; } = "";

    public string RequestedType { get; set; } = "Company";

    public string RequestedEmail { get; set; } = "";

    public string RequestedPhone { get; set; } = "";

    public string RequestedAddressLine1 { get; set; } = "";

    public string RequestedAddressLine2 { get; set; } = "";

    public string RequestedCity { get; set; } = "";

    public string RequestedState { get; set; } = "";

    public string RequestedPostalCode { get; set; } = "";

    public string RequestedStatus { get; set; } = "Active";

    public string AdminDecisionByEmail { get; set; } = "";

    public string AdminDecisionNote { get; set; } = "";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? DecidedAtUtc { get; set; }
}