namespace LocalCRM.Api.Models;

public class DocumentTemplate
{
    public Guid Id { get; set; }

    public string Name { get; set; } = "";

    public string DocumentType { get; set; } = "";

    public string ContentHtml { get; set; } = "";

    public bool IsDefault { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}