using LocalCRM.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LocalCRM.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(LocalCrmDbContext db)
    {
        var passwordHasher = new PasswordHasher<User>();

        await EnsureUserAsync(
            db,
            passwordHasher,
            displayName: "Owner User",
            email: "owner@localcrm.dev",
            role: "Owner",
            password: "Owner123!"
        );

        await EnsureUserAsync(
            db,
            passwordHasher,
            displayName: "Admin User",
            email: "admin@localcrm.dev",
            role: "Admin",
            password: "Admin123!"
        );

        await EnsureUserAsync(
            db,
            passwordHasher,
            displayName: "Staff User",
            email: "staff@localcrm.dev",
            role: "Staff",
            password: "Staff123!"
        );

        if (!await db.Customers.AnyAsync())
        {
            db.Customers.AddRange(
                new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = "Acme Corp",
                    Type = "Company",
                    Email = "contact@acme.example",
                    Phone = "555-0100",
                    AddressLine1 = "",
                    AddressLine2 = "",
                    City = "Oklahoma City",
                    State = "OK",
                    PostalCode = "73101",
                    Status = "Active",
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                },
                new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = "John Smith",
                    Type = "Person",
                    Email = "john.smith@example.com",
                    Phone = "555-0101",
                    AddressLine1 = "",
                    AddressLine2 = "",
                    City = "Norman",
                    State = "OK",
                    PostalCode = "73069",
                    Status = "Lead",
                    CreatedAtUtc = DateTime.UtcNow,
                    UpdatedAtUtc = DateTime.UtcNow
                }
            );
        }

        await db.SaveChangesAsync();
    }

    private static async Task EnsureUserAsync(
        LocalCrmDbContext db,
        PasswordHasher<User> passwordHasher,
        string displayName,
        string email,
        string role,
        string password)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var existingUser = await db.Users.FirstOrDefaultAsync(u =>
            u.Email.ToLower() == normalizedEmail);

        if (existingUser is not null)
        {
            var changed = false;

            if (existingUser.DisplayName != displayName)
            {
                existingUser.DisplayName = displayName;
                changed = true;
            }

            if (existingUser.Role != role)
            {
                existingUser.Role = role;
                changed = true;
            }

            if (!existingUser.IsActive)
            {
                existingUser.IsActive = true;
                changed = true;
            }

            if (changed)
            {
                existingUser.UpdatedAtUtc = DateTime.UtcNow;
            }

            return;
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            DisplayName = displayName,
            Email = normalizedEmail,
            Role = role,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        user.PasswordHash = passwordHasher.HashPassword(user, password);

        db.Users.Add(user);
    }
}