namespace LocalCRM.Api.Models;

public class GeneratedDocument
{
    public Guid Id { get; set; }

    public string DocumentType { get; set; } = "";

    public string SourceEntityType { get; set; } = "";

    public Guid SourceEntityId { get; set; }

    public Guid? TemplateId { get; set; }

    public string FileName { get; set; } = "";

    public string ContentType { get; set; } = "";

    public byte[] FileBytes { get; set; } = Array.Empty<byte>();

    public string GeneratedBy { get; set; } = "";

    public DateTime GeneratedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}