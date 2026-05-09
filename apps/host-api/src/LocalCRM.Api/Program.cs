using Microsoft.AspNetCore.Diagnostics;
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

app.MapPost("/customers", async (Customer input, LocalCrmDbContext db, ILogger<Program> logger) =>
{
    if (string.IsNullOrWhiteSpace(input.Name))
    {
        return Results.BadRequest(new { error = "Name is required" });
    }

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
        PerformedBy = "system",
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Creating customer {CustomerName}", input.Name);

    await db.SaveChangesAsync();

    return Results.Created($"/customers/{input.Id}", input);
});

app.MapPut("/customers/{id:guid}", async (Guid id, Customer input, LocalCrmDbContext db, ILogger<Program> logger) =>
{
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
        PerformedBy = "system",
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Updating customer {CustomerId}", customer.Id);

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

app.MapPost("/customers/{customerId:guid}/notes", async (Guid customerId, CustomerNote input, LocalCrmDbContext db, ILogger<Program> logger) =>
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
        PerformedBy = "system",
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Creating note for customer {CustomerId}", customerId);

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