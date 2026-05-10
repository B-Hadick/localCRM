using LocalCRM.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LocalCRM.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(LocalCrmDbContext db)
    {
        var passwordHasher = new PasswordHasher<User>();

        if (!await db.Users.AnyAsync())
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                DisplayName = "Admin User",
                Email = "admin@localcrm.dev",
                Role = "Admin",
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin123!");

            var staffUser = new User
            {
                Id = Guid.NewGuid(),
                DisplayName = "Staff User",
                Email = "staff@localcrm.dev",
                Role = "Staff",
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            staffUser.PasswordHash = passwordHasher.HashPassword(staffUser, "Staff123!");

            db.Users.AddRange(adminUser, staffUser);
        }

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
}