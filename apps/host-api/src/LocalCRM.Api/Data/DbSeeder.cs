using LocalCRM.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LocalCRM.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(LocalCrmDbContext db)
    {
        if (!await db.Users.AnyAsync())
        {
            db.Users.AddRange(
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "admin",
                    PasswordHash = "Admin123!",
                    FullName = "Admin User",
                    Role = "Admin",
                    IsActive = true
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Username = "staff",
                    PasswordHash = "Staff123!",
                    FullName = "Staff User",
                    Role = "Staff",
                    IsActive = true
                }
            );
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
                    City = "Oklahoma City",
                    State = "OK",
                    PostalCode = "73101",
                    Status = "Active"
                },
                new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = "John Smith",
                    Type = "Person",
                    Email = "john.smith@example.com",
                    Phone = "555-0101",
                    City = "Norman",
                    State = "OK",
                    PostalCode = "73069",
                    Status = "Lead"
                }
            );
        }

        await db.SaveChangesAsync();
    }
}