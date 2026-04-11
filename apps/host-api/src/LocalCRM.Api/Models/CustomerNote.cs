namespace LocalCRM.Api.Models;

public class CustomerNote
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string Content { get; set; } = "";
    public bool IsPinned { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}