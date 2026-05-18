namespace LocalCRM.Api.Models;

public class DocumentTemplate
{
    public Guid Id { get; set; }

    public string Name { get; set; } = "";

    public string DocumentType { get; set; } = "";

    public string ContentHtml { get; set; } = "";

    public string SourceFormat { get; set; } = "Html";

    public string OriginalFileName { get; set; } = "";

    public string OriginalContentType { get; set; } = "";

    public byte[]? OriginalFileBytes { get; set; }

    public DateTime? ImportedAtUtc { get; set; }

    public bool IsDefault { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}