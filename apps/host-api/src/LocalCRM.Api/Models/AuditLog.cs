namespace LocalCRM.Api.Models;

public class AuditLog
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = "";
    public string EntityId { get; set; } = "";
    public string Action { get; set; } = "";
    public string Details { get; set; } = "";
    public string PerformedBy { get; set; } = "";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}