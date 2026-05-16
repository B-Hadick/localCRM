using LocalCRM.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LocalCRM.Api.Data;

public class LocalCrmDbContext : DbContext
{
    public LocalCrmDbContext(DbContextOptions<LocalCrmDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerNote> CustomerNotes => Set<CustomerNote>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<CustomerEditRequest> CustomerEditRequests => Set<CustomerEditRequest>();
    public DbSet<Quote> Quotes => Set<Quote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.Email).IsUnique();

            entity.Property(x => x.DisplayName).HasMaxLength(200);
            entity.Property(x => x.Email).HasMaxLength(200);
            entity.Property(x => x.PasswordHash).HasMaxLength(500);
            entity.Property(x => x.Role).HasMaxLength(50);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name).HasMaxLength(200);
            entity.Property(x => x.Type).HasMaxLength(50);
            entity.Property(x => x.Email).HasMaxLength(200);
            entity.Property(x => x.Phone).HasMaxLength(50);
            entity.Property(x => x.AddressLine1).HasMaxLength(250);
            entity.Property(x => x.AddressLine2).HasMaxLength(250);
            entity.Property(x => x.City).HasMaxLength(100);
            entity.Property(x => x.State).HasMaxLength(100);
            entity.Property(x => x.PostalCode).HasMaxLength(50);
            entity.Property(x => x.Status).HasMaxLength(50);
        });

        modelBuilder.Entity<CustomerNote>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Content).HasMaxLength(4000);
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.EntityType).HasMaxLength(100);
            entity.Property(x => x.EntityId).HasMaxLength(100);
            entity.Property(x => x.Action).HasMaxLength(100);
            entity.Property(x => x.PerformedBy).HasMaxLength(100);
            entity.Property(x => x.Details).HasMaxLength(4000);
        });

        modelBuilder.Entity<CustomerEditRequest>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.CustomerId);
            entity.HasIndex(x => x.Status);
            entity.HasIndex(x => x.RequestedByEmail);

            entity.Property(x => x.RequestedByUserId).HasMaxLength(100);
            entity.Property(x => x.RequestedByEmail).HasMaxLength(200);
            entity.Property(x => x.Status).HasMaxLength(50);

            entity.Property(x => x.RequestedName).HasMaxLength(200);
            entity.Property(x => x.RequestedType).HasMaxLength(50);
            entity.Property(x => x.RequestedEmail).HasMaxLength(200);
            entity.Property(x => x.RequestedPhone).HasMaxLength(50);
            entity.Property(x => x.RequestedAddressLine1).HasMaxLength(250);
            entity.Property(x => x.RequestedAddressLine2).HasMaxLength(250);
            entity.Property(x => x.RequestedCity).HasMaxLength(100);
            entity.Property(x => x.RequestedState).HasMaxLength(100);
            entity.Property(x => x.RequestedPostalCode).HasMaxLength(50);
            entity.Property(x => x.RequestedStatus).HasMaxLength(50);

            entity.Property(x => x.AdminDecisionByEmail).HasMaxLength(200);
            entity.Property(x => x.AdminDecisionNote).HasMaxLength(1000);
        });

        modelBuilder.Entity<Quote>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.CustomerId);
            entity.HasIndex(x => x.QuoteNumber).IsUnique();
            entity.HasIndex(x => x.Status);
            entity.HasIndex(x => x.QuoteDateUtc);

            entity.Property(x => x.QuoteNumber).HasMaxLength(50);
            entity.Property(x => x.Title).HasMaxLength(200);
            entity.Property(x => x.Description).HasMaxLength(4000);
            entity.Property(x => x.Status).HasMaxLength(50);

            entity.Property(x => x.Amount)
                .HasPrecision(18, 2);
        });
    }
}