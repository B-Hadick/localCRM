namespace LocalCRM.Api.Models;

public class UserEmailSettings
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string SmtpHost { get; set; } = "";

    public int SmtpPort { get; set; }

    public bool UseTls { get; set; } = true;

    public string FromEmail { get; set; } = "";

    public string FromDisplayName { get; set; } = "";

    public string Username { get; set; } = "";

    public string EncryptedPassword { get; set; } = "";

    public bool IsConfigured { get; set; }

    public bool IsActive { get; set; } = true;

    public string CreatedByEmail { get; set; } = "";

    public string UpdatedByEmail { get; set; } = "";

    public DateTime CreatedAtUtc { get; set; }

    public DateTime UpdatedAtUtc { get; set; }

    public DateTime? LastTestedAtUtc { get; set; }

    public bool LastTestSucceeded { get; set; }

    public string LastTestMessage { get; set; } = "";
}