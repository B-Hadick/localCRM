using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using LocalCRM.Api.Data;
using LocalCRM.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// --- SERVICES ---
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.AddCors(options =>
{
    options.AddPolicy("DesktopDev", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<LocalCrmDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// --- MIDDLEWARE ---
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";

        var error = context.Features.Get<IExceptionHandlerFeature>();

        await context.Response.WriteAsJsonAsync(new
        {
            error = "Internal Server Error",
            detail = error?.Error.Message
        });
    });
});

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("DesktopDev");

// --- DB INIT ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LocalCrmDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

// --- ROUTES ---
app.MapGet("/health", async (LocalCrmDbContext db) =>
{
    var canConnect = await db.Database.CanConnectAsync();

    return Results.Ok(new
    {
        status = canConnect ? "ok" : "degraded",
        service = "LocalCRM.Api",
        database = canConnect ? "connected" : "disconnected",
        timeUtc = DateTime.UtcNow
    });
});

app.MapGet("/", () => Results.Ok(new
{
    message = "LocalCRM Host API running"
}));

app.MapPost("/auth/login", async (LoginRequest input, LocalCrmDbContext db, ILogger<Program> logger) =>
{
    var email = input.Email.Trim().ToLowerInvariant();
    var password = input.Password;

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
    {
        return Results.BadRequest(new { error = "Email and password are required" });
    }

    var user = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

    if (user is null || !user.IsActive)
    {
        logger.LogWarning("Failed login attempt for {Email}", email);
        return Results.Unauthorized();
    }

    var passwordHasher = new PasswordHasher<User>();
    var passwordResult = VerifyPassword(user, password, passwordHasher);

    if (!passwordResult.IsValid)
    {
        logger.LogWarning("Failed login attempt for {Email}", email);
        return Results.Unauthorized();
    }

    if (passwordResult.NeedsHashUpgrade)
    {
        user.PasswordHash = passwordHasher.HashPassword(user, password);
        user.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync();

        logger.LogInformation("Password hash upgraded for {Email}", user.Email);
    }

    logger.LogInformation("User {Email} logged in with role {Role}", user.Email, user.Role);

    return Results.Ok(new AuthUserResponse(
        user.Id,
        user.DisplayName,
        user.Email,
        user.Role,
        user.IsActive
    ));
});

app.MapPost("/users/staff", async (
    CreateStaffUserRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var caller = await GetCallerUserAsync(httpContext, db);

    if (caller is null || caller.Role != "Admin")
    {
        logger.LogWarning("Unauthorized staff user creation attempt by {PerformedBy}", performedBy);
        return Results.Forbid();
    }

    var displayName = input.DisplayName.Trim();
    var email = input.Email.Trim().ToLowerInvariant();
    var password = input.Password;

    if (string.IsNullOrWhiteSpace(displayName))
    {
        return Results.BadRequest(new { error = "Display name is required" });
    }

    if (displayName.Length < 2)
    {
        return Results.BadRequest(new { error = "Display name must be at least 2 characters" });
    }

    if (string.IsNullOrWhiteSpace(email))
    {
        return Results.BadRequest(new { error = "Email is required" });
    }

    if (!IsValidEmail(email))
    {
        return Results.BadRequest(new { error = "A valid email address is required" });
    }

    if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
    {
        return Results.BadRequest(new { error = "Temporary password must be at least 8 characters" });
    }

    var emailExists = await db.Users.AnyAsync(u => u.Email.ToLower() == email);
    if (emailExists)
    {
        return Results.Conflict(new { error = "A user with this email already exists" });
    }

    var user = new User
    {
        Id = Guid.NewGuid(),
        DisplayName = displayName,
        Email = email,
        Role = "Staff",
        IsActive = true,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    var passwordHasher = new PasswordHasher<User>();
    user.PasswordHash = passwordHasher.HashPassword(user, password);

    db.Users.Add(user);

    logger.LogInformation("Staff user {Email} created by {PerformedBy}", user.Email, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/users/{user.Id}", new AuthUserResponse(
        user.Id,
        user.DisplayName,
        user.Email,
        user.Role,
        user.IsActive
    ));
});

app.MapGet("/customers", async (LocalCrmDbContext db, ILogger<Program> logger) =>
{
    logger.LogInformation("Fetching customers");

    var customers = await db.Customers
        .OrderBy(c => c.Name)
        .ToListAsync();

    return Results.Ok(customers);
});

app.MapGet("/customers/search", async (
    string? q,
    string? status,
    LocalCrmDbContext db,
    ILogger<Program> logger) =>
{
    logger.LogInformation("Searching customers with query '{Query}' and status '{Status}'", q, status);

    var query = db.Customers.AsQueryable();

    if (!string.IsNullOrWhiteSpace(q))
    {
        var search = q.Trim().ToLower();

        query = query.Where(c =>
            c.Name.ToLower().Contains(search) ||
            c.Email.ToLower().Contains(search) ||
            c.Phone.ToLower().Contains(search) ||
            c.Type.ToLower().Contains(search) ||
            c.City.ToLower().Contains(search) ||
            c.State.ToLower().Contains(search));
    }

    if (!string.IsNullOrWhiteSpace(status) && status != "All")
    {
        query = query.Where(c => c.Status == status);
    }

    var customers = await query
        .OrderBy(c => c.Name)
        .ToListAsync();

    return Results.Ok(customers);
});

app.MapGet("/customers/{id:guid}", async (Guid id, LocalCrmDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);

    return customer is null
        ? Results.NotFound(new { error = "Customer not found" })
        : Results.Ok(customer);
});

app.MapPost("/customers", async (
    Customer input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    if (string.IsNullOrWhiteSpace(input.Name))
    {
        return Results.BadRequest(new { error = "Name is required" });
    }

    var performedBy = GetPerformedBy(httpContext);

    input.Id = Guid.NewGuid();
    input.CreatedAtUtc = DateTime.UtcNow;
    input.UpdatedAtUtc = DateTime.UtcNow;

    db.Customers.Add(input);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Customer",
        EntityId = input.Id.ToString(),
        Action = "Created",
        Details = $"Customer '{input.Name}' created.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Creating customer {CustomerName} by {PerformedBy}", input.Name, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/customers/{input.Id}", input);
});

app.MapPut("/customers/{id:guid}", async (
    Guid id,
    Customer input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var caller = await GetCallerUserAsync(httpContext, db);

    if (caller is null || caller.Role != "Admin")
    {
        logger.LogWarning("Unauthorized customer update attempt by {PerformedBy}", performedBy);
        return Results.Forbid();
    }

    var customer = await db.Customers.FindAsync(id);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    if (string.IsNullOrWhiteSpace(input.Name))
    {
        return Results.BadRequest(new { error = "Name is required" });
    }

    customer.Name = input.Name;
    customer.Type = input.Type;
    customer.Email = input.Email;
    customer.Phone = input.Phone;
    customer.AddressLine1 = input.AddressLine1;
    customer.AddressLine2 = input.AddressLine2;
    customer.City = input.City;
    customer.State = input.State;
    customer.PostalCode = input.PostalCode;
    customer.Status = input.Status;
    customer.UpdatedAtUtc = DateTime.UtcNow;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Customer",
        EntityId = customer.Id.ToString(),
        Action = "Updated",
        Details = $"Customer '{customer.Name}' updated.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Updating customer {CustomerId} by {PerformedBy}", customer.Id, performedBy);

    await db.SaveChangesAsync();

    return Results.Ok(customer);
});

app.MapGet("/customers/{customerId:guid}/notes", async (Guid customerId, LocalCrmDbContext db) =>
{
    var notes = await db.CustomerNotes
        .Where(n => n.CustomerId == customerId)
        .OrderByDescending(n => n.CreatedAtUtc)
        .ToListAsync();

    return Results.Ok(notes);
});

app.MapPost("/customers/{customerId:guid}/notes", async (
    Guid customerId,
    CustomerNote input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    if (string.IsNullOrWhiteSpace(input.Content))
    {
        return Results.BadRequest(new { error = "Note content is required" });
    }

    var performedBy = GetPerformedBy(httpContext);

    input.Id = Guid.NewGuid();
    input.CustomerId = customerId;
    input.CreatedAtUtc = DateTime.UtcNow;
    input.UpdatedAtUtc = DateTime.UtcNow;

    db.CustomerNotes.Add(input);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Customer",
        EntityId = customerId.ToString(),
        Action = "NoteCreated",
        Details = $"Note created for customer '{customer.Name}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Creating note for customer {CustomerId} by {PerformedBy}", customerId, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/customers/{customerId}/notes/{input.Id}", input);
});

app.MapGet("/customers/{customerId:guid}/audit", async (Guid customerId, LocalCrmDbContext db) =>
{
    var logs = await db.AuditLogs
        .Where(a => a.EntityId == customerId.ToString())
        .OrderByDescending(a => a.CreatedAtUtc)
        .Take(100)
        .ToListAsync();

    return Results.Ok(logs);
});

app.MapGet("/audit", async (string? entityType, string? entityId, LocalCrmDbContext db) =>
{
    var query = db.AuditLogs.AsQueryable();

    if (!string.IsNullOrWhiteSpace(entityType))
    {
        query = query.Where(a => a.EntityType == entityType);
    }

    if (!string.IsNullOrWhiteSpace(entityId))
    {
        query = query.Where(a => a.EntityId == entityId);
    }

    var logs = await query
        .OrderByDescending(a => a.CreatedAtUtc)
        .Take(100)
        .ToListAsync();

    return Results.Ok(logs);
});

app.Run();

static string GetPerformedBy(HttpContext httpContext)
{
    var headerValue = httpContext.Request.Headers["X-LocalCRM-User"].FirstOrDefault();

    if (string.IsNullOrWhiteSpace(headerValue))
    {
        return "system";
    }

    return headerValue.Trim();
}

static async Task<User?> GetCallerUserAsync(HttpContext httpContext, LocalCrmDbContext db)
{
    var performedBy = GetPerformedBy(httpContext).ToLowerInvariant();

    if (performedBy == "system")
    {
        return null;
    }

    return await db.Users.FirstOrDefaultAsync(u =>
        u.Email.ToLower() == performedBy &&
        u.IsActive);
}

static PasswordVerificationResultInfo VerifyPassword(User user, string password, PasswordHasher<User> passwordHasher)
{
    try
    {
        var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password);

        if (verificationResult == PasswordVerificationResult.Success)
        {
            return new PasswordVerificationResultInfo(true, false);
        }

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            return new PasswordVerificationResultInfo(true, true);
        }
    }
    catch (FormatException)
    {
        // Existing development rows may still contain placeholder/plaintext values.
        // Fall through to legacy compatibility check below.
    }

    if (IsLegacyDevelopmentPasswordMatch(user, password))
    {
        return new PasswordVerificationResultInfo(true, true);
    }

    return new PasswordVerificationResultInfo(false, false);
}

static bool IsLegacyDevelopmentPasswordMatch(User user, string password)
{
    if (user.Email.Equals("admin@localcrm.dev", StringComparison.OrdinalIgnoreCase) && password == "Admin123!")
    {
        return true;
    }

    if (user.Email.Equals("staff@localcrm.dev", StringComparison.OrdinalIgnoreCase) && password == "Staff123!")
    {
        return true;
    }

    return user.PasswordHash == password;
}

static bool IsValidEmail(string email)
{
    return email.Contains('@') && email.Contains('.');
}

public record LoginRequest(string Email, string Password);

public record CreateStaffUserRequest(
    string DisplayName,
    string Email,
    string Password
);

public record AuthUserResponse(
    Guid Id,
    string DisplayName,
    string Email,
    string Role,
    bool IsActive
);

public record PasswordVerificationResultInfo(
    bool IsValid,
    bool NeedsHashUpgrade
);