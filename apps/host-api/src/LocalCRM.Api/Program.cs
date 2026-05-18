using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
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

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LocalCRM.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LocalCRM.Desktop";
var jwtSigningKey = builder.Configuration["Jwt:SigningKey"] ?? throw new InvalidOperationException("JWT signing key is missing.");
var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtSigningKey);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKeyBytes),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AuthenticatedUser", policy =>
    {
        policy.RequireAuthenticatedUser();
    });

    options.AddPolicy("AdminOrOwner", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole("Admin", "Owner");
    });

    options.AddPolicy("OwnerOnly", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole("Owner");
    });
});

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
app.UseAuthentication();
app.UseAuthorization();

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

app.MapPost("/auth/login", async (LoginRequest input, LocalCrmDbContext db, IConfiguration config, ILogger<Program> logger) =>
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
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = "Auth",
            EntityId = email,
            Action = "LoginFailed",
            Details = $"Failed login attempt for '{email}'.",
            PerformedBy = email,
            CreatedAtUtc = DateTime.UtcNow
        });

        await db.SaveChangesAsync();

        logger.LogWarning("Failed login attempt for {Email}", email);
        return Results.Unauthorized();
    }

    var passwordHasher = new PasswordHasher<User>();
    var passwordResult = VerifyPassword(user, password, passwordHasher);

    if (!passwordResult.IsValid)
    {
        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = "User",
            EntityId = user.Id.ToString(),
            Action = "LoginFailed",
            Details = $"Failed login attempt for user '{user.Email}'.",
            PerformedBy = user.Email,
            CreatedAtUtc = DateTime.UtcNow
        });

        await db.SaveChangesAsync();

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

    var tokenResult = CreateJwtToken(user, config);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "User",
        EntityId = user.Id.ToString(),
        Action = "LoginSucceeded",
        Details = $"User '{user.Email}' logged in with role '{user.Role}'.",
        PerformedBy = user.Email,
        CreatedAtUtc = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    logger.LogInformation("User {Email} logged in with role {Role}", user.Email, user.Role);

    return Results.Ok(new LoginResponse(
        user.Id,
        user.DisplayName,
        user.Email,
        user.Role,
        user.IsActive,
        tokenResult.Token,
        tokenResult.ExpiresAtUtc
    ));
});


app.MapPost("/auth/change-password", async (
    ChangePasswordRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var caller = await GetCallerUserAsync(httpContext, db);
    var performedBy = GetPerformedBy(httpContext);

    if (caller is null)
    {
        return Results.Unauthorized();
    }

    var currentPassword = input.CurrentPassword;
    var newPassword = input.NewPassword;

    if (string.IsNullOrWhiteSpace(currentPassword))
    {
        return Results.BadRequest(new { error = "Current password is required" });
    }

    var passwordValidationError = ValidatePassword(newPassword);
    if (!string.IsNullOrWhiteSpace(passwordValidationError))
    {
        return Results.BadRequest(new { error = passwordValidationError });
    }

    if (currentPassword == newPassword)
    {
        return Results.BadRequest(new { error = "New password must be different from current password" });
    }

    var passwordHasher = new PasswordHasher<User>();
    var passwordResult = VerifyPassword(caller, currentPassword, passwordHasher);

    if (!passwordResult.IsValid)
    {
        logger.LogWarning("Failed password change attempt for {Email}", caller.Email);
        return Results.BadRequest(new { error = "Current password is incorrect" });
    }

    caller.PasswordHash = passwordHasher.HashPassword(caller, newPassword);
    caller.UpdatedAtUtc = DateTime.UtcNow;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "User",
        EntityId = caller.Id.ToString(),
        Action = "PasswordChanged",
        Details = $"Password changed for user '{caller.Email}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Password changed for {Email}", caller.Email);

    return Results.Ok(new { message = "Password changed successfully" });
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/users/staff", async (
    CreateStaffUserRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var caller = await GetCallerUserAsync(httpContext, db);

    if (caller is null || !IsAdminOrOwner(caller))
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

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "User",
        EntityId = user.Id.ToString(),
        Action = "StaffCreated",
        Details = $"Staff user '{user.Email}' created.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Staff user {Email} created by {PerformedBy}", user.Email, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/users/{user.Id}", new AuthUserResponse(
        user.Id,
        user.DisplayName,
        user.Email,
        user.Role,
        user.IsActive
    ));
}).RequireAuthorization("AdminOrOwner");


app.MapPost("/users/admin", async (
    CreateAdminUserRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var caller = await GetCallerUserAsync(httpContext, db);

    if (caller is null || !IsOwner(caller))
    {
        logger.LogWarning("Unauthorized admin user creation attempt by {PerformedBy}", performedBy);
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

    var passwordValidationError = ValidatePassword(password);
    if (!string.IsNullOrWhiteSpace(passwordValidationError))
    {
        return Results.BadRequest(new { error = passwordValidationError });
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
        Role = "Admin",
        IsActive = true,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    var passwordHasher = new PasswordHasher<User>();
    user.PasswordHash = passwordHasher.HashPassword(user, password);

    db.Users.Add(user);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "User",
        EntityId = user.Id.ToString(),
        Action = "AdminCreated",
        Details = $"Admin user '{user.Email}' created.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Admin user {Email} created by {PerformedBy}", user.Email, performedBy);

    return Results.Created($"/users/{user.Id}", new AuthUserResponse(
        user.Id,
        user.DisplayName,
        user.Email,
        user.Role,
        user.IsActive
    ));
}).RequireAuthorization("OwnerOnly");

app.MapGet("/users", async (LocalCrmDbContext db) =>
{
    var users = await db.Users
        .OrderBy(u => u.DisplayName)
        .ThenBy(u => u.Email)
        .Select(u => new UserListResponse(
            u.Id,
            u.DisplayName,
            u.Email,
            u.Role,
            u.IsActive,
            u.CreatedAtUtc,
            u.UpdatedAtUtc
        ))
        .ToListAsync();

    return Results.Ok(users);
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/users/{userId:guid}/reset-password", async (
    Guid userId,
    ResetPasswordRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var caller = await GetCallerUserAsync(httpContext, db);

    if (caller is null || !IsAdminOrOwner(caller))
    {
        logger.LogWarning("Unauthorized password reset attempt by {PerformedBy}", performedBy);
        return Results.Forbid();
    }

    var targetUser = await db.Users.FindAsync(userId);
    if (targetUser is null)
    {
        return Results.NotFound(new { error = "User not found" });
    }

    if (targetUser.Role != "Staff")
    {
        return Results.BadRequest(new { error = "Only Staff user passwords can be reset by Admin users" });
    }

    if (!targetUser.IsActive)
    {
        return Results.BadRequest(new { error = "Inactive user passwords cannot be reset" });
    }

    var passwordValidationError = ValidatePassword(input.NewPassword);
    if (!string.IsNullOrWhiteSpace(passwordValidationError))
    {
        return Results.BadRequest(new { error = passwordValidationError });
    }

    var passwordHasher = new PasswordHasher<User>();
    targetUser.PasswordHash = passwordHasher.HashPassword(targetUser, input.NewPassword);
    targetUser.UpdatedAtUtc = DateTime.UtcNow;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "User",
        EntityId = targetUser.Id.ToString(),
        Action = "PasswordReset",
        Details = $"Password reset for Staff user '{targetUser.Email}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Password reset for {TargetEmail} by {PerformedBy}", targetUser.Email, performedBy);

    return Results.Ok(new { message = "Staff password reset successfully" });
}).RequireAuthorization("AdminOrOwner");

app.MapGet("/customers", async (LocalCrmDbContext db, ILogger<Program> logger) =>
{
    logger.LogInformation("Fetching customers");

    var customers = await db.Customers
        .OrderBy(c => c.Name)
        .ToListAsync();

    return Results.Ok(customers);
}).RequireAuthorization("AuthenticatedUser");

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
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/customers/{id:guid}", async (Guid id, LocalCrmDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);

    return customer is null
        ? Results.NotFound(new { error = "Customer not found" })
        : Results.Ok(customer);
}).RequireAuthorization("AuthenticatedUser");

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
}).RequireAuthorization("AuthenticatedUser");

app.MapPut("/customers/{id:guid}", async (
    Guid id,
    Customer input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var caller = await GetCallerUserAsync(httpContext, db);

    if (caller is null || !IsAdminOrOwner(caller))
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
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/customers/{customerId:guid}/edit-requests", async (
    Guid customerId,
    SubmitCustomerEditRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var caller = await GetCallerUserAsync(httpContext, db);
    var performedBy = GetPerformedBy(httpContext);

    if (caller is null)
    {
        return Results.Unauthorized();
    }

    var customer = await db.Customers.FindAsync(customerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var validationError = ValidateRequestedCustomerFields(input);
    if (!string.IsNullOrWhiteSpace(validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var request = new CustomerEditRequest
    {
        Id = Guid.NewGuid(),
        CustomerId = customerId,
        RequestedByUserId = caller.Id.ToString(),
        RequestedByEmail = caller.Email,
        Status = "Pending",
        RequestedName = input.Name.Trim(),
        RequestedType = input.Type.Trim(),
        RequestedEmail = input.Email.Trim(),
        RequestedPhone = input.Phone.Trim(),
        RequestedAddressLine1 = input.AddressLine1.Trim(),
        RequestedAddressLine2 = input.AddressLine2.Trim(),
        RequestedCity = input.City.Trim(),
        RequestedState = input.State.Trim(),
        RequestedPostalCode = input.PostalCode.Trim(),
        RequestedStatus = input.Status.Trim(),
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow
    };

    db.CustomerEditRequests.Add(request);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Customer",
        EntityId = customerId.ToString(),
        Action = "EditRequested",
        Details = $"Customer edit requested for '{customer.Name}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Customer edit requested for {CustomerId} by {PerformedBy}", customerId, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/customer-edit-requests/{request.Id}", request);
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/customers/{customerId:guid}/edit-requests", async (
    Guid customerId,
    LocalCrmDbContext db) =>
{
    var requests = await db.CustomerEditRequests
        .Where(r => r.CustomerId == customerId)
        .OrderByDescending(r => r.CreatedAtUtc)
        .Take(50)
        .ToListAsync();

    return Results.Ok(requests);
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/dashboard/summary", async (LocalCrmDbContext db) =>
{
    var todayUtc = DateTime.UtcNow.Date;
    var sevenDaysAgoUtc = DateTime.UtcNow.AddDays(-7);

    var totalCustomers = await db.Customers.CountAsync();
    var activeCustomers = await db.Customers.CountAsync(c => c.Status == "Active");
    var leadCustomers = await db.Customers.CountAsync(c => c.Status == "Lead");
    var inactiveCustomers = await db.Customers.CountAsync(c => c.Status == "Inactive");

    var pendingEditRequests = await db.CustomerEditRequests.CountAsync(r => r.Status == "Pending");
    var approvedEditRequests = await db.CustomerEditRequests.CountAsync(r => r.Status == "Approved");
    var rejectedEditRequests = await db.CustomerEditRequests.CountAsync(r => r.Status == "Rejected");

    var editRequestsLast7Days = await db.CustomerEditRequests.CountAsync(r => r.CreatedAtUtc >= sevenDaysAgoUtc);
    var pendingEditRequestsToday = await db.CustomerEditRequests.CountAsync(r =>
        r.Status == "Pending" &&
        r.CreatedAtUtc >= todayUtc);

    var recentAuditEvents = await db.AuditLogs.CountAsync(a => a.CreatedAtUtc >= sevenDaysAgoUtc);

    return Results.Ok(new DashboardSummaryResponse(
        totalCustomers,
        activeCustomers,
        leadCustomers,
        inactiveCustomers,
        pendingEditRequests,
        approvedEditRequests,
        rejectedEditRequests,
        editRequestsLast7Days,
        pendingEditRequestsToday,
        recentAuditEvents
    ));
}).RequireAuthorization("AdminOrOwner");


app.MapGet("/quotes", async (
    string? q,
    string? status,
    string? sortBy,
    string? sortDirection,
    Guid? customerId,
    DateTime? from,
    DateTime? to,
    LocalCrmDbContext db) =>
{
    var nowUtc = DateTime.UtcNow;

    await ExpireOverdueQuotesAsync(db, nowUtc);

    var query = db.Quotes.AsQueryable();

    if (customerId.HasValue)
    {
        query = query.Where(quote => quote.CustomerId == customerId.Value);
    }

    if (!string.IsNullOrWhiteSpace(status) && status != "All")
    {
        query = query.Where(quote => quote.Status == status);
    }

    if (from.HasValue)
    {
        var fromUtc = DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc);
        query = query.Where(quote => quote.QuoteDateUtc >= fromUtc);
    }

    if (to.HasValue)
    {
        var toUtcExclusive = DateTime.SpecifyKind(to.Value.Date.AddDays(1), DateTimeKind.Utc);
        query = query.Where(quote => quote.QuoteDateUtc < toUtcExclusive);
    }

    var quoteRows = await query.ToListAsync();

    var customerIds = quoteRows
        .Select(quote => quote.CustomerId)
        .Distinct()
        .ToList();

    var customers = await db.Customers
        .Where(customer => customerIds.Contains(customer.Id))
        .ToDictionaryAsync(customer => customer.Id);

    var responses = quoteRows
        .Select(quote =>
        {
            customers.TryGetValue(quote.CustomerId, out var customer);

            return ToQuoteResponse(
                quote,
                customer?.Name ?? "Unknown Customer"
            );
        })
        .ToList();

    if (!string.IsNullOrWhiteSpace(q))
    {
        var search = q.Trim().ToLower();

        responses = responses
            .Where(quote =>
                quote.CustomerName.ToLower().Contains(search) ||
                quote.QuoteNumber.ToLower().Contains(search) ||
                quote.Title.ToLower().Contains(search) ||
                quote.Description.ToLower().Contains(search))
            .ToList();
    }

    var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

    responses = (sortBy ?? "date").Trim().ToLowerInvariant() switch
    {
        "status" => descending
            ? responses.OrderByDescending(quote => quote.Status).ThenByDescending(quote => quote.QuoteDateUtc).ToList()
            : responses.OrderBy(quote => quote.Status).ThenByDescending(quote => quote.QuoteDateUtc).ToList(),

        "name" or "customer" => descending
            ? responses.OrderByDescending(quote => quote.CustomerName).ThenByDescending(quote => quote.QuoteDateUtc).ToList()
            : responses.OrderBy(quote => quote.CustomerName).ThenByDescending(quote => quote.QuoteDateUtc).ToList(),

        "amount" => descending
            ? responses.OrderByDescending(quote => quote.Amount).ThenByDescending(quote => quote.QuoteDateUtc).ToList()
            : responses.OrderBy(quote => quote.Amount).ThenByDescending(quote => quote.QuoteDateUtc).ToList(),

        _ => descending
            ? responses.OrderByDescending(quote => quote.QuoteDateUtc).ToList()
            : responses.OrderBy(quote => quote.QuoteDateUtc).ToList()
    };

    return Results.Ok(responses.Take(250).ToList());
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/customers/{customerId:guid}/quotes", async (
    Guid customerId,
    LocalCrmDbContext db) =>
{
    var nowUtc = DateTime.UtcNow;

    await ExpireOverdueQuotesAsync(db, nowUtc);

    var customer = await db.Customers.FindAsync(customerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var quotes = await db.Quotes
        .Where(quote => quote.CustomerId == customerId)
        .OrderByDescending(quote => quote.QuoteDateUtc)
        .Take(100)
        .ToListAsync();

    var response = quotes
        .Select(quote => ToQuoteResponse(quote, customer.Name))
        .ToList();

    return Results.Ok(response);
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/quotes", async (
    CreateQuoteRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var validationError = ValidateQuoteInput(input);
    if (!string.IsNullOrWhiteSpace(validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var customer = await db.Customers.FindAsync(input.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var nowUtc = DateTime.UtcNow;
    var status = string.IsNullOrWhiteSpace(input.Status)
        ? "Draft"
        : input.Status.Trim();

    if (!IsValidQuoteStatus(status))
    {
        return Results.BadRequest(new { error = "Quote status must be Draft, Sent, Accepted, Rejected, or Expired" });
    }

    var quote = new Quote
    {
        Id = Guid.NewGuid(),
        CustomerId = input.CustomerId,
        QuoteNumber = await GenerateQuoteNumberAsync(db, nowUtc),
        Title = input.Title.Trim(),
        Description = input.Description.Trim(),
        Amount = input.Amount,
        Status = status,
        QuoteDateUtc = nowUtc,
        SentAtUtc = status == "Sent" ? nowUtc : null,
        AcceptedAtUtc = status == "Accepted" ? nowUtc : null,
        RejectedAtUtc = status == "Rejected" ? nowUtc : null,
        ExpiredAtUtc = status == "Expired" ? nowUtc : null,
        CreatedAtUtc = nowUtc,
        UpdatedAtUtc = nowUtc
    };

    db.Quotes.Add(quote);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Quote",
        EntityId = quote.Id.ToString(),
        Action = "QuoteCreated",
        Details = $"Quote '{quote.QuoteNumber}' created for customer '{customer.Name}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    logger.LogInformation("Quote {QuoteNumber} created for customer {CustomerId} by {PerformedBy}", quote.QuoteNumber, customer.Id, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/quotes/{quote.Id}", ToQuoteResponse(quote, customer.Name));
}).RequireAuthorization("AuthenticatedUser");


app.MapGet("/quotes/{quoteId:guid}/document", async (
    Guid quoteId,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var quote = await db.Quotes.FindAsync(quoteId);
    if (quote is null)
    {
        return Results.NotFound(new { error = "Quote not found" });
    }

    var customer = await db.Customers.FindAsync(quote.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var nowUtc = DateTime.UtcNow;
    var template = await GetDefaultDocumentTemplateAsync(db, "Quote");
    var html = template is null
        ? BuildQuoteDocumentHtml(quote, customer, nowUtc)
        : BuildTemplateBackedPrintableDocumentHtml(
            "Quote",
            template,
            BuildQuoteTemplateValues(quote, customer, nowUtc),
            nowUtc);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Quote",
        EntityId = quote.Id.ToString(),
        Action = "QuoteDocumentGenerated",
        Details = $"Printable document generated for quote '{quote.QuoteNumber}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Quote document generated for {QuoteNumber} by {PerformedBy}", quote.QuoteNumber, performedBy);

    return Results.Content(html, "text/html; charset=utf-8");
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/quotes/{quoteId:guid}/status", async (
    Guid quoteId,
    UpdateQuoteStatusRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var nowUtc = DateTime.UtcNow;

    var quote = await db.Quotes.FindAsync(quoteId);
    if (quote is null)
    {
        return Results.NotFound(new { error = "Quote not found" });
    }

    var customer = await db.Customers.FindAsync(quote.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var status = input.Status.Trim();
    if (!IsValidQuoteStatus(status))
    {
        return Results.BadRequest(new { error = "Quote status must be Draft, Sent, Accepted, Rejected, or Expired" });
    }

    var previousStatus = quote.Status;

    quote.Status = status;
    quote.UpdatedAtUtc = nowUtc;

    if (status == "Sent" && quote.SentAtUtc is null)
    {
        quote.SentAtUtc = nowUtc;
    }

    if (status == "Accepted")
    {
        quote.AcceptedAtUtc = nowUtc;
    }

    if (status == "Rejected")
    {
        quote.RejectedAtUtc = nowUtc;
    }

    if (status == "Expired")
    {
        quote.ExpiredAtUtc = nowUtc;
    }

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Quote",
        EntityId = quote.Id.ToString(),
        Action = "QuoteStatusChanged",
        Details = $"Quote '{quote.QuoteNumber}' status changed from '{previousStatus}' to '{quote.Status}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    logger.LogInformation("Quote {QuoteNumber} status changed from {PreviousStatus} to {Status} by {PerformedBy}", quote.QuoteNumber, previousStatus, quote.Status, performedBy);

    await db.SaveChangesAsync();

    return Results.Ok(ToQuoteResponse(quote, customer.Name));
}).RequireAuthorization("AdminOrOwner");


app.MapGet("/contracts", async (
    string? q,
    string? status,
    string? sortBy,
    string? sortDirection,
    Guid? customerId,
    Guid? quoteId,
    DateTime? from,
    DateTime? to,
    LocalCrmDbContext db) =>
{
    var query = db.Contracts.AsQueryable();

    if (customerId.HasValue)
    {
        query = query.Where(contract => contract.CustomerId == customerId.Value);
    }

    if (quoteId.HasValue)
    {
        query = query.Where(contract => contract.QuoteId == quoteId.Value);
    }

    if (!string.IsNullOrWhiteSpace(status) && status != "All")
    {
        query = query.Where(contract => contract.Status == status);
    }

    if (from.HasValue)
    {
        var fromUtc = DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc);
        query = query.Where(contract => contract.ContractDateUtc >= fromUtc);
    }

    if (to.HasValue)
    {
        var toUtcExclusive = DateTime.SpecifyKind(to.Value.Date.AddDays(1), DateTimeKind.Utc);
        query = query.Where(contract => contract.ContractDateUtc < toUtcExclusive);
    }

    var contractRows = await query.ToListAsync();

    var customerIds = contractRows
        .Select(contract => contract.CustomerId)
        .Distinct()
        .ToList();

    var quoteIds = contractRows
        .Where(contract => contract.QuoteId.HasValue)
        .Select(contract => contract.QuoteId!.Value)
        .Distinct()
        .ToList();

    var customers = await db.Customers
        .Where(customer => customerIds.Contains(customer.Id))
        .ToDictionaryAsync(customer => customer.Id);

    var quotes = await db.Quotes
        .Where(quote => quoteIds.Contains(quote.Id))
        .ToDictionaryAsync(quote => quote.Id);

    var responses = contractRows
        .Select(contract =>
        {
            customers.TryGetValue(contract.CustomerId, out var customer);

            Quote? quote = null;
            if (contract.QuoteId.HasValue)
            {
                quotes.TryGetValue(contract.QuoteId.Value, out quote);
            }

            return ToContractResponse(
                contract,
                customer?.Name ?? "Unknown Customer",
                quote?.QuoteNumber ?? ""
            );
        })
        .ToList();

    if (!string.IsNullOrWhiteSpace(q))
    {
        var search = q.Trim().ToLower();

        responses = responses
            .Where(contract =>
                contract.CustomerName.ToLower().Contains(search) ||
                contract.ContractNumber.ToLower().Contains(search) ||
                contract.Title.ToLower().Contains(search) ||
                contract.Description.ToLower().Contains(search) ||
                contract.QuoteNumber.ToLower().Contains(search))
            .ToList();
    }

    var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

    responses = (sortBy ?? "date").Trim().ToLowerInvariant() switch
    {
        "status" => descending
            ? responses.OrderByDescending(contract => contract.Status).ThenByDescending(contract => contract.ContractDateUtc).ToList()
            : responses.OrderBy(contract => contract.Status).ThenByDescending(contract => contract.ContractDateUtc).ToList(),

        "name" or "customer" => descending
            ? responses.OrderByDescending(contract => contract.CustomerName).ThenByDescending(contract => contract.ContractDateUtc).ToList()
            : responses.OrderBy(contract => contract.CustomerName).ThenByDescending(contract => contract.ContractDateUtc).ToList(),

        "amount" => descending
            ? responses.OrderByDescending(contract => contract.Amount).ThenByDescending(contract => contract.ContractDateUtc).ToList()
            : responses.OrderBy(contract => contract.Amount).ThenByDescending(contract => contract.ContractDateUtc).ToList(),

        _ => descending
            ? responses.OrderByDescending(contract => contract.ContractDateUtc).ToList()
            : responses.OrderBy(contract => contract.ContractDateUtc).ToList()
    };

    return Results.Ok(responses.Take(250).ToList());
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/customers/{customerId:guid}/contracts", async (
    Guid customerId,
    LocalCrmDbContext db) =>
{
    var customer = await db.Customers.FindAsync(customerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var contractRows = await db.Contracts
        .Where(contract => contract.CustomerId == customerId)
        .OrderByDescending(contract => contract.ContractDateUtc)
        .Take(100)
        .ToListAsync();

    var quoteIds = contractRows
        .Where(contract => contract.QuoteId.HasValue)
        .Select(contract => contract.QuoteId!.Value)
        .Distinct()
        .ToList();

    var quotes = await db.Quotes
        .Where(quote => quoteIds.Contains(quote.Id))
        .ToDictionaryAsync(quote => quote.Id);

    var response = contractRows
        .Select(contract =>
        {
            Quote? quote = null;
            if (contract.QuoteId.HasValue)
            {
                quotes.TryGetValue(contract.QuoteId.Value, out quote);
            }

            return ToContractResponse(contract, customer.Name, quote?.QuoteNumber ?? "");
        })
        .ToList();

    return Results.Ok(response);
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/contracts", async (
    CreateContractRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var validationError = ValidateContractInput(input);
    if (!string.IsNullOrWhiteSpace(validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var customer = await db.Customers.FindAsync(input.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    Quote? quote = null;
    if (input.QuoteId.HasValue)
    {
        quote = await db.Quotes.FindAsync(input.QuoteId.Value);
        if (quote is null)
        {
            return Results.NotFound(new { error = "Linked quote not found" });
        }

        if (quote.CustomerId != input.CustomerId)
        {
            return Results.BadRequest(new { error = "Linked quote must belong to the selected customer" });
        }
    }

    var nowUtc = DateTime.UtcNow;
    var status = string.IsNullOrWhiteSpace(input.Status)
        ? "Draft"
        : input.Status.Trim();

    if (!IsValidContractStatus(status))
    {
        return Results.BadRequest(new { error = "Contract status must be Draft, Sent, Signed, Completed/Billable, or Cancelled" });
    }

    var contract = new Contract
    {
        Id = Guid.NewGuid(),
        CustomerId = input.CustomerId,
        QuoteId = input.QuoteId,
        ScopeOfWorkId = input.ScopeOfWorkId,
        ContractNumber = await GenerateContractNumberAsync(db, nowUtc),
        Title = input.Title.Trim(),
        Description = input.Description.Trim(),
        Amount = input.Amount,
        Status = status,
        ContractDateUtc = nowUtc,
        SentAtUtc = status == "Sent" ? nowUtc : null,
        SignedAtUtc = status == "Signed" ? nowUtc : null,
        CompletedBillableAtUtc = status == "Completed/Billable" ? nowUtc : null,
        CancelledAtUtc = status == "Cancelled" ? nowUtc : null,
        CreatedAtUtc = nowUtc,
        UpdatedAtUtc = nowUtc
    };

    db.Contracts.Add(contract);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Contract",
        EntityId = contract.Id.ToString(),
        Action = "ContractCreated",
        Details = quote is null
            ? $"Contract '{contract.ContractNumber}' created for customer '{customer.Name}'."
            : $"Contract '{contract.ContractNumber}' created for customer '{customer.Name}' from quote '{quote.QuoteNumber}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    logger.LogInformation("Contract {ContractNumber} created for customer {CustomerId} by {PerformedBy}", contract.ContractNumber, customer.Id, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/contracts/{contract.Id}", ToContractResponse(contract, customer.Name, quote?.QuoteNumber ?? ""));
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/contracts/{contractId:guid}/document", async (
    Guid contractId,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var contract = await db.Contracts.FindAsync(contractId);
    if (contract is null)
    {
        return Results.NotFound(new { error = "Contract not found" });
    }

    var customer = await db.Customers.FindAsync(contract.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    Quote? quote = null;
    if (contract.QuoteId.HasValue)
    {
        quote = await db.Quotes.FindAsync(contract.QuoteId.Value);
    }

    var nowUtc = DateTime.UtcNow;
    var template = await GetDefaultDocumentTemplateAsync(db, "Contract");
    var html = template is null
        ? BuildContractDocumentHtml(contract, customer, quote, nowUtc)
        : BuildTemplateBackedPrintableDocumentHtml(
            "Contract",
            template,
            BuildContractTemplateValues(contract, customer, quote, nowUtc),
            nowUtc);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Contract",
        EntityId = contract.Id.ToString(),
        Action = "ContractDocumentGenerated",
        Details = $"Printable document generated for contract '{contract.ContractNumber}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Contract document generated for {ContractNumber} by {PerformedBy}", contract.ContractNumber, performedBy);

    return Results.Content(html, "text/html; charset=utf-8");
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/contracts/{contractId:guid}/status", async (
    Guid contractId,
    UpdateContractStatusRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var nowUtc = DateTime.UtcNow;

    var contract = await db.Contracts.FindAsync(contractId);
    if (contract is null)
    {
        return Results.NotFound(new { error = "Contract not found" });
    }

    var customer = await db.Customers.FindAsync(contract.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    Quote? quote = null;
    if (contract.QuoteId.HasValue)
    {
        quote = await db.Quotes.FindAsync(contract.QuoteId.Value);
    }

    var status = input.Status.Trim();
    if (!IsValidContractStatus(status))
    {
        return Results.BadRequest(new { error = "Contract status must be Draft, Sent, Signed, Completed/Billable, or Cancelled" });
    }

    var previousStatus = contract.Status;

    contract.Status = status;
    contract.UpdatedAtUtc = nowUtc;

    if (status == "Sent" && contract.SentAtUtc is null)
    {
        contract.SentAtUtc = nowUtc;
    }

    if (status == "Signed")
    {
        contract.SignedAtUtc = nowUtc;
    }

    if (status == "Completed/Billable")
    {
        contract.CompletedBillableAtUtc = nowUtc;
    }

    if (status == "Cancelled")
    {
        contract.CancelledAtUtc = nowUtc;
    }

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Contract",
        EntityId = contract.Id.ToString(),
        Action = "ContractStatusChanged",
        Details = $"Contract '{contract.ContractNumber}' status changed from '{previousStatus}' to '{contract.Status}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    logger.LogInformation("Contract {ContractNumber} status changed from {PreviousStatus} to {Status} by {PerformedBy}", contract.ContractNumber, previousStatus, contract.Status, performedBy);

    await db.SaveChangesAsync();

    return Results.Ok(ToContractResponse(contract, customer.Name, quote?.QuoteNumber ?? ""));
}).RequireAuthorization("AdminOrOwner");


app.MapGet("/scopes-of-work", async (
    string? q,
    string? status,
    string? sortBy,
    string? sortDirection,
    Guid? customerId,
    Guid? quoteId,
    Guid? contractId,
    DateTime? from,
    DateTime? to,
    LocalCrmDbContext db) =>
{
    var query = db.ScopeOfWorks.AsQueryable();

    if (customerId.HasValue)
    {
        query = query.Where(scope => scope.CustomerId == customerId.Value);
    }

    if (quoteId.HasValue)
    {
        query = query.Where(scope => scope.QuoteId == quoteId.Value);
    }

    if (contractId.HasValue)
    {
        query = query.Where(scope => scope.ContractId == contractId.Value);
    }

    if (!string.IsNullOrWhiteSpace(status) && status != "All")
    {
        query = query.Where(scope => scope.Status == status);
    }

    if (from.HasValue)
    {
        var fromUtc = DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc);
        query = query.Where(scope => scope.ScopeDateUtc >= fromUtc);
    }

    if (to.HasValue)
    {
        var toUtcExclusive = DateTime.SpecifyKind(to.Value.Date.AddDays(1), DateTimeKind.Utc);
        query = query.Where(scope => scope.ScopeDateUtc < toUtcExclusive);
    }

    var scopeRows = await query.ToListAsync();

    var customerIds = scopeRows
        .Select(scope => scope.CustomerId)
        .Distinct()
        .ToList();

    var quoteIds = scopeRows
        .Where(scope => scope.QuoteId.HasValue)
        .Select(scope => scope.QuoteId!.Value)
        .Distinct()
        .ToList();

    var contractIds = scopeRows
        .Where(scope => scope.ContractId.HasValue)
        .Select(scope => scope.ContractId!.Value)
        .Distinct()
        .ToList();

    var customers = await db.Customers
        .Where(customer => customerIds.Contains(customer.Id))
        .ToDictionaryAsync(customer => customer.Id);

    var quotes = await db.Quotes
        .Where(quote => quoteIds.Contains(quote.Id))
        .ToDictionaryAsync(quote => quote.Id);

    var contracts = await db.Contracts
        .Where(contract => contractIds.Contains(contract.Id))
        .ToDictionaryAsync(contract => contract.Id);

    var responses = scopeRows
        .Select(scope =>
        {
            customers.TryGetValue(scope.CustomerId, out var customer);

            Quote? quote = null;
            if (scope.QuoteId.HasValue)
            {
                quotes.TryGetValue(scope.QuoteId.Value, out quote);
            }

            Contract? contract = null;
            if (scope.ContractId.HasValue)
            {
                contracts.TryGetValue(scope.ContractId.Value, out contract);
            }

            return ToScopeOfWorkResponse(
                scope,
                customer?.Name ?? "Unknown Customer",
                quote?.QuoteNumber ?? "",
                contract?.ContractNumber ?? ""
            );
        })
        .ToList();

    if (!string.IsNullOrWhiteSpace(q))
    {
        var search = q.Trim().ToLower();

        responses = responses
            .Where(scope =>
                scope.CustomerName.ToLower().Contains(search) ||
                scope.ScopeNumber.ToLower().Contains(search) ||
                scope.Title.ToLower().Contains(search) ||
                scope.Description.ToLower().Contains(search) ||
                scope.Deliverables.ToLower().Contains(search) ||
                scope.QuoteNumber.ToLower().Contains(search) ||
                scope.ContractNumber.ToLower().Contains(search))
            .ToList();
    }

    var descending = string.Equals(sortDirection, "desc", StringComparison.OrdinalIgnoreCase);

    responses = (sortBy ?? "date").Trim().ToLowerInvariant() switch
    {
        "status" => descending
            ? responses.OrderByDescending(scope => scope.Status).ThenByDescending(scope => scope.ScopeDateUtc).ToList()
            : responses.OrderBy(scope => scope.Status).ThenByDescending(scope => scope.ScopeDateUtc).ToList(),

        "name" or "customer" => descending
            ? responses.OrderByDescending(scope => scope.CustomerName).ThenByDescending(scope => scope.ScopeDateUtc).ToList()
            : responses.OrderBy(scope => scope.CustomerName).ThenByDescending(scope => scope.ScopeDateUtc).ToList(),

        "amount" => descending
            ? responses.OrderByDescending(scope => scope.EstimatedAmount).ThenByDescending(scope => scope.ScopeDateUtc).ToList()
            : responses.OrderBy(scope => scope.EstimatedAmount).ThenByDescending(scope => scope.ScopeDateUtc).ToList(),

        _ => descending
            ? responses.OrderByDescending(scope => scope.ScopeDateUtc).ToList()
            : responses.OrderBy(scope => scope.ScopeDateUtc).ToList()
    };

    return Results.Ok(responses.Take(250).ToList());
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/customers/{customerId:guid}/scopes-of-work", async (
    Guid customerId,
    LocalCrmDbContext db) =>
{
    var customer = await db.Customers.FindAsync(customerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    var scopeRows = await db.ScopeOfWorks
        .Where(scope => scope.CustomerId == customerId)
        .OrderByDescending(scope => scope.ScopeDateUtc)
        .Take(100)
        .ToListAsync();

    var quoteIds = scopeRows
        .Where(scope => scope.QuoteId.HasValue)
        .Select(scope => scope.QuoteId!.Value)
        .Distinct()
        .ToList();

    var contractIds = scopeRows
        .Where(scope => scope.ContractId.HasValue)
        .Select(scope => scope.ContractId!.Value)
        .Distinct()
        .ToList();

    var quotes = await db.Quotes
        .Where(quote => quoteIds.Contains(quote.Id))
        .ToDictionaryAsync(quote => quote.Id);

    var contracts = await db.Contracts
        .Where(contract => contractIds.Contains(contract.Id))
        .ToDictionaryAsync(contract => contract.Id);

    var response = scopeRows
        .Select(scope =>
        {
            Quote? quote = null;
            if (scope.QuoteId.HasValue)
            {
                quotes.TryGetValue(scope.QuoteId.Value, out quote);
            }

            Contract? contract = null;
            if (scope.ContractId.HasValue)
            {
                contracts.TryGetValue(scope.ContractId.Value, out contract);
            }

            return ToScopeOfWorkResponse(scope, customer.Name, quote?.QuoteNumber ?? "", contract?.ContractNumber ?? "");
        })
        .ToList();

    return Results.Ok(response);
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/scopes-of-work", async (
    CreateScopeOfWorkRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var validationError = ValidateScopeOfWorkInput(input);
    if (!string.IsNullOrWhiteSpace(validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var customer = await db.Customers.FindAsync(input.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    Quote? quote = null;
    if (input.QuoteId.HasValue)
    {
        quote = await db.Quotes.FindAsync(input.QuoteId.Value);
        if (quote is null)
        {
            return Results.NotFound(new { error = "Linked quote not found" });
        }

        if (quote.CustomerId != input.CustomerId)
        {
            return Results.BadRequest(new { error = "Linked quote must belong to the selected customer" });
        }
    }

    Contract? contract = null;
    if (input.ContractId.HasValue)
    {
        contract = await db.Contracts.FindAsync(input.ContractId.Value);
        if (contract is null)
        {
            return Results.NotFound(new { error = "Linked contract not found" });
        }

        if (contract.CustomerId != input.CustomerId)
        {
            return Results.BadRequest(new { error = "Linked contract must belong to the selected customer" });
        }

        if (input.QuoteId.HasValue && contract.QuoteId.HasValue && contract.QuoteId.Value != input.QuoteId.Value)
        {
            return Results.BadRequest(new { error = "Linked quote must match the quote linked to the selected contract" });
        }
    }

    var nowUtc = DateTime.UtcNow;
    var status = string.IsNullOrWhiteSpace(input.Status)
        ? "Draft"
        : input.Status.Trim();

    if (!IsValidScopeOfWorkStatus(status))
    {
        return Results.BadRequest(new { error = "Scope of work status must be Draft, In Review, Approved, Active, Completed, or Cancelled" });
    }

    var scopeOfWork = new ScopeOfWork
    {
        Id = Guid.NewGuid(),
        CustomerId = input.CustomerId,
        QuoteId = input.QuoteId,
        ContractId = input.ContractId,
        ScopeNumber = await GenerateScopeOfWorkNumberAsync(db, nowUtc),
        Title = input.Title.Trim(),
        Description = input.Description.Trim(),
        Deliverables = input.Deliverables.Trim(),
        Assumptions = input.Assumptions.Trim(),
        Exclusions = input.Exclusions.Trim(),
        EstimatedAmount = input.EstimatedAmount,
        Status = status,
        ScopeDateUtc = nowUtc,
        ReviewedAtUtc = status == "In Review" ? nowUtc : null,
        ApprovedAtUtc = status == "Approved" ? nowUtc : null,
        ActivatedAtUtc = status == "Active" ? nowUtc : null,
        CompletedAtUtc = status == "Completed" ? nowUtc : null,
        CancelledAtUtc = status == "Cancelled" ? nowUtc : null,
        CreatedAtUtc = nowUtc,
        UpdatedAtUtc = nowUtc
    };

    db.ScopeOfWorks.Add(scopeOfWork);

    if (contract is not null)
    {
        contract.ScopeOfWorkId = scopeOfWork.Id;
        contract.UpdatedAtUtc = nowUtc;
    }

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "ScopeOfWork",
        EntityId = scopeOfWork.Id.ToString(),
        Action = "ScopeOfWorkCreated",
        Details = contract is null
            ? $"Scope of work '{scopeOfWork.ScopeNumber}' created for customer '{customer.Name}'."
            : $"Scope of work '{scopeOfWork.ScopeNumber}' created for customer '{customer.Name}' and linked to contract '{contract.ContractNumber}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    logger.LogInformation("Scope of work {ScopeNumber} created for customer {CustomerId} by {PerformedBy}", scopeOfWork.ScopeNumber, customer.Id, performedBy);

    await db.SaveChangesAsync();

    return Results.Created($"/scopes-of-work/{scopeOfWork.Id}", ToScopeOfWorkResponse(
        scopeOfWork,
        customer.Name,
        quote?.QuoteNumber ?? "",
        contract?.ContractNumber ?? ""
    ));
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/scopes-of-work/{scopeId:guid}/document", async (
    Guid scopeId,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var scopeOfWork = await db.ScopeOfWorks.FindAsync(scopeId);
    if (scopeOfWork is null)
    {
        return Results.NotFound(new { error = "Scope of work not found" });
    }

    var customer = await db.Customers.FindAsync(scopeOfWork.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    Quote? quote = null;
    if (scopeOfWork.QuoteId.HasValue)
    {
        quote = await db.Quotes.FindAsync(scopeOfWork.QuoteId.Value);
    }

    Contract? contract = null;
    if (scopeOfWork.ContractId.HasValue)
    {
        contract = await db.Contracts.FindAsync(scopeOfWork.ContractId.Value);
    }

    var nowUtc = DateTime.UtcNow;
    var template = await GetDefaultDocumentTemplateAsync(db, "ScopeOfWork");
    var html = template is null
        ? BuildScopeOfWorkDocumentHtml(scopeOfWork, customer, quote, contract, nowUtc)
        : BuildTemplateBackedPrintableDocumentHtml(
            "Scope of Work",
            template,
            BuildScopeOfWorkTemplateValues(scopeOfWork, customer, quote, contract, nowUtc),
            nowUtc);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "ScopeOfWork",
        EntityId = scopeOfWork.Id.ToString(),
        Action = "ScopeOfWorkDocumentGenerated",
        Details = $"Printable document generated for scope of work '{scopeOfWork.ScopeNumber}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Scope of work document generated for {ScopeNumber} by {PerformedBy}", scopeOfWork.ScopeNumber, performedBy);

    return Results.Content(html, "text/html; charset=utf-8");
}).RequireAuthorization("AuthenticatedUser");

app.MapPost("/scopes-of-work/{scopeId:guid}/status", async (
    Guid scopeId,
    UpdateScopeOfWorkStatusRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var nowUtc = DateTime.UtcNow;

    var scopeOfWork = await db.ScopeOfWorks.FindAsync(scopeId);
    if (scopeOfWork is null)
    {
        return Results.NotFound(new { error = "Scope of work not found" });
    }

    var customer = await db.Customers.FindAsync(scopeOfWork.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    Quote? quote = null;
    if (scopeOfWork.QuoteId.HasValue)
    {
        quote = await db.Quotes.FindAsync(scopeOfWork.QuoteId.Value);
    }

    Contract? contract = null;
    if (scopeOfWork.ContractId.HasValue)
    {
        contract = await db.Contracts.FindAsync(scopeOfWork.ContractId.Value);
    }

    var status = input.Status.Trim();
    if (!IsValidScopeOfWorkStatus(status))
    {
        return Results.BadRequest(new { error = "Scope of work status must be Draft, In Review, Approved, Active, Completed, or Cancelled" });
    }

    var previousStatus = scopeOfWork.Status;

    scopeOfWork.Status = status;
    scopeOfWork.UpdatedAtUtc = nowUtc;

    if (status == "In Review")
    {
        scopeOfWork.ReviewedAtUtc = nowUtc;
    }

    if (status == "Approved")
    {
        scopeOfWork.ApprovedAtUtc = nowUtc;
    }

    if (status == "Active")
    {
        scopeOfWork.ActivatedAtUtc = nowUtc;
    }

    if (status == "Completed")
    {
        scopeOfWork.CompletedAtUtc = nowUtc;
    }

    if (status == "Cancelled")
    {
        scopeOfWork.CancelledAtUtc = nowUtc;
    }

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "ScopeOfWork",
        EntityId = scopeOfWork.Id.ToString(),
        Action = "ScopeOfWorkStatusChanged",
        Details = $"Scope of work '{scopeOfWork.ScopeNumber}' status changed from '{previousStatus}' to '{scopeOfWork.Status}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    logger.LogInformation("Scope of work {ScopeNumber} status changed from {PreviousStatus} to {Status} by {PerformedBy}", scopeOfWork.ScopeNumber, previousStatus, scopeOfWork.Status, performedBy);

    await db.SaveChangesAsync();

    return Results.Ok(ToScopeOfWorkResponse(
        scopeOfWork,
        customer.Name,
        quote?.QuoteNumber ?? "",
        contract?.ContractNumber ?? ""
    ));
}).RequireAuthorization("AdminOrOwner");


app.MapGet("/document-templates", async (
    string? documentType,
    bool? activeOnly,
    LocalCrmDbContext db) =>
{
    var query = db.DocumentTemplates.AsQueryable();

    if (!string.IsNullOrWhiteSpace(documentType) && documentType != "All")
    {
        query = query.Where(template => template.DocumentType == documentType);
    }

    if (activeOnly == true)
    {
        query = query.Where(template => template.IsActive);
    }

    var templateRows = await query
        .OrderBy(template => template.DocumentType)
        .ThenByDescending(template => template.IsDefault)
        .ThenBy(template => template.Name)
        .ToListAsync();

    var templates = templateRows
        .Select(ToDocumentTemplateResponse)
        .ToList();

    return Results.Ok(templates);
}).RequireAuthorization("AdminOrOwner");

app.MapGet("/document-templates/{templateId:guid}", async (
    Guid templateId,
    LocalCrmDbContext db) =>
{
    var template = await db.DocumentTemplates.FindAsync(templateId);

    return template is null
        ? Results.NotFound(new { error = "Document template not found" })
        : Results.Ok(ToDocumentTemplateResponse(template));
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/document-templates", async (
    CreateDocumentTemplateRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var validationError = ValidateDocumentTemplateInput(input.Name, input.DocumentType, input.ContentHtml);
    if (!string.IsNullOrWhiteSpace(validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var documentType = input.DocumentType.Trim();
    var nowUtc = DateTime.UtcNow;

    if (input.IsDefault)
    {
        await ClearDefaultTemplatesForTypeAsync(db, documentType);
    }

    var template = new DocumentTemplate
    {
        Id = Guid.NewGuid(),
        Name = input.Name.Trim(),
        DocumentType = documentType,
        ContentHtml = input.ContentHtml.Trim(),
        IsDefault = input.IsDefault,
        IsActive = true,
        CreatedAtUtc = nowUtc,
        UpdatedAtUtc = nowUtc
    };

    db.DocumentTemplates.Add(template);

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "DocumentTemplate",
        EntityId = template.Id.ToString(),
        Action = "DocumentTemplateCreated",
        Details = $"Document template '{template.Name}' created for '{template.DocumentType}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Document template {TemplateName} created for {DocumentType} by {PerformedBy}", template.Name, template.DocumentType, performedBy);

    return Results.Created($"/document-templates/{template.Id}", ToDocumentTemplateResponse(template));
}).RequireAuthorization("AdminOrOwner");

app.MapPut("/document-templates/{templateId:guid}", async (
    Guid templateId,
    UpdateDocumentTemplateRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var template = await db.DocumentTemplates.FindAsync(templateId);
    if (template is null)
    {
        return Results.NotFound(new { error = "Document template not found" });
    }

    var validationError = ValidateDocumentTemplateInput(input.Name, input.DocumentType, input.ContentHtml);
    if (!string.IsNullOrWhiteSpace(validationError))
    {
        return Results.BadRequest(new { error = validationError });
    }

    var documentType = input.DocumentType.Trim();
    var nowUtc = DateTime.UtcNow;

    if (input.IsDefault)
    {
        await ClearDefaultTemplatesForTypeAsync(db, documentType, template.Id);
    }

    template.Name = input.Name.Trim();
    template.DocumentType = documentType;
    template.ContentHtml = input.ContentHtml.Trim();
    template.IsDefault = input.IsDefault;
    template.IsActive = input.IsActive;
    template.UpdatedAtUtc = nowUtc;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "DocumentTemplate",
        EntityId = template.Id.ToString(),
        Action = "DocumentTemplateUpdated",
        Details = $"Document template '{template.Name}' updated for '{template.DocumentType}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Document template {TemplateName} updated for {DocumentType} by {PerformedBy}", template.Name, template.DocumentType, performedBy);

    return Results.Ok(ToDocumentTemplateResponse(template));
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/document-templates/{templateId:guid}/default", async (
    Guid templateId,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var template = await db.DocumentTemplates.FindAsync(templateId);
    if (template is null)
    {
        return Results.NotFound(new { error = "Document template not found" });
    }

    if (!template.IsActive)
    {
        return Results.BadRequest(new { error = "Inactive templates cannot be set as default" });
    }

    var nowUtc = DateTime.UtcNow;

    await ClearDefaultTemplatesForTypeAsync(db, template.DocumentType, template.Id);

    template.IsDefault = true;
    template.UpdatedAtUtc = nowUtc;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "DocumentTemplate",
        EntityId = template.Id.ToString(),
        Action = "DocumentTemplateDefaultSet",
        Details = $"Document template '{template.Name}' set as default for '{template.DocumentType}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Document template {TemplateName} set as default for {DocumentType} by {PerformedBy}", template.Name, template.DocumentType, performedBy);

    return Results.Ok(ToDocumentTemplateResponse(template));
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/document-templates/{templateId:guid}/active", async (
    Guid templateId,
    UpdateDocumentTemplateActiveRequest input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var template = await db.DocumentTemplates.FindAsync(templateId);
    if (template is null)
    {
        return Results.NotFound(new { error = "Document template not found" });
    }

    var nowUtc = DateTime.UtcNow;

    template.IsActive = input.IsActive;
    template.UpdatedAtUtc = nowUtc;

    if (!template.IsActive)
    {
        template.IsDefault = false;
    }

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "DocumentTemplate",
        EntityId = template.Id.ToString(),
        Action = input.IsActive ? "DocumentTemplateActivated" : "DocumentTemplateDeactivated",
        Details = input.IsActive
            ? $"Document template '{template.Name}' activated."
            : $"Document template '{template.Name}' deactivated.",
        PerformedBy = performedBy,
        CreatedAtUtc = nowUtc
    });

    await db.SaveChangesAsync();

    logger.LogInformation("Document template {TemplateName} active state changed to {IsActive} by {PerformedBy}", template.Name, template.IsActive, performedBy);

    return Results.Ok(ToDocumentTemplateResponse(template));
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/document-templates/seed-defaults", async (
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);
    var nowUtc = DateTime.UtcNow;

    var seeded = new List<DocumentTemplate>();

    foreach (var defaultTemplate in GetDefaultDocumentTemplates(nowUtc))
    {
        var exists = await db.DocumentTemplates.AnyAsync(template =>
            template.DocumentType == defaultTemplate.DocumentType &&
            template.Name == defaultTemplate.Name);

        if (exists)
        {
            continue;
        }

        var hasDefaultForType = await db.DocumentTemplates.AnyAsync(template =>
            template.DocumentType == defaultTemplate.DocumentType &&
            template.IsDefault);

        defaultTemplate.IsDefault = !hasDefaultForType;
        seeded.Add(defaultTemplate);
        db.DocumentTemplates.Add(defaultTemplate);

        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = "DocumentTemplate",
            EntityId = defaultTemplate.Id.ToString(),
            Action = "DocumentTemplateSeeded",
            Details = $"Default document template '{defaultTemplate.Name}' seeded for '{defaultTemplate.DocumentType}'.",
            PerformedBy = performedBy,
            CreatedAtUtc = nowUtc
        });
    }

    await db.SaveChangesAsync();

    logger.LogInformation("{TemplateCount} default document templates seeded by {PerformedBy}", seeded.Count, performedBy);

    return Results.Ok(seeded.Select(ToDocumentTemplateResponse).ToList());
}).RequireAuthorization("AdminOrOwner");

app.MapGet("/customer-edit-requests", async (
    string? status,
    string? requestedBy,
    DateTime? from,
    DateTime? to,
    LocalCrmDbContext db) =>
{
    var query = db.CustomerEditRequests.AsQueryable();

    if (!string.IsNullOrWhiteSpace(status) && status != "All")
    {
        query = query.Where(r => r.Status == status);
    }

    if (!string.IsNullOrWhiteSpace(requestedBy))
    {
        var requestedBySearch = requestedBy.Trim().ToLower();
        query = query.Where(r => r.RequestedByEmail.ToLower().Contains(requestedBySearch));
    }

    if (from.HasValue)
    {
        var fromUtc = DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc);
        query = query.Where(r => r.CreatedAtUtc >= fromUtc);
    }

    if (to.HasValue)
    {
        var toUtcExclusive = DateTime.SpecifyKind(to.Value.Date.AddDays(1), DateTimeKind.Utc);
        query = query.Where(r => r.CreatedAtUtc < toUtcExclusive);
    }

    var requests = await query
        .OrderByDescending(r => r.CreatedAtUtc)
        .Take(100)
        .ToListAsync();

    var customerIds = requests
        .Select(r => r.CustomerId)
        .Distinct()
        .ToList();

    var customers = await db.Customers
        .Where(c => customerIds.Contains(c.Id))
        .ToDictionaryAsync(c => c.Id);

    var response = requests
        .Select(request =>
        {
            customers.TryGetValue(request.CustomerId, out var customer);
            return ToCustomerEditRequestReviewResponse(request, customer);
        })
        .ToList();

    return Results.Ok(response);
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/customer-edit-requests/{requestId:guid}/approve", async (
    Guid requestId,
    EditRequestDecision input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var request = await db.CustomerEditRequests.FindAsync(requestId);
    if (request is null)
    {
        return Results.NotFound(new { error = "Edit request not found" });
    }

    if (request.Status != "Pending")
    {
        return Results.BadRequest(new { error = "Only pending edit requests can be approved" });
    }

    var customer = await db.Customers.FindAsync(request.CustomerId);
    if (customer is null)
    {
        return Results.NotFound(new { error = "Customer not found" });
    }

    customer.Name = request.RequestedName;
    customer.Type = request.RequestedType;
    customer.Email = request.RequestedEmail;
    customer.Phone = request.RequestedPhone;
    customer.AddressLine1 = request.RequestedAddressLine1;
    customer.AddressLine2 = request.RequestedAddressLine2;
    customer.City = request.RequestedCity;
    customer.State = request.RequestedState;
    customer.PostalCode = request.RequestedPostalCode;
    customer.Status = request.RequestedStatus;
    customer.UpdatedAtUtc = DateTime.UtcNow;

    request.Status = "Approved";
    request.AdminDecisionByEmail = performedBy;
    request.AdminDecisionNote = input.Note.Trim();
    request.DecidedAtUtc = DateTime.UtcNow;
    request.UpdatedAtUtc = DateTime.UtcNow;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Customer",
        EntityId = customer.Id.ToString(),
        Action = "EditApproved",
        Details = $"Customer edit request approved for '{customer.Name}'.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Customer edit request {RequestId} approved by {PerformedBy}", requestId, performedBy);

    await db.SaveChangesAsync();

    return Results.Ok(request);
}).RequireAuthorization("AdminOrOwner");

app.MapPost("/customer-edit-requests/{requestId:guid}/reject", async (
    Guid requestId,
    EditRequestDecision input,
    LocalCrmDbContext db,
    ILogger<Program> logger,
    HttpContext httpContext) =>
{
    var performedBy = GetPerformedBy(httpContext);

    var request = await db.CustomerEditRequests.FindAsync(requestId);
    if (request is null)
    {
        return Results.NotFound(new { error = "Edit request not found" });
    }

    if (request.Status != "Pending")
    {
        return Results.BadRequest(new { error = "Only pending edit requests can be rejected" });
    }

    request.Status = "Rejected";
    request.AdminDecisionByEmail = performedBy;
    request.AdminDecisionNote = input.Note.Trim();
    request.DecidedAtUtc = DateTime.UtcNow;
    request.UpdatedAtUtc = DateTime.UtcNow;

    db.AuditLogs.Add(new AuditLog
    {
        Id = Guid.NewGuid(),
        EntityType = "Customer",
        EntityId = request.CustomerId.ToString(),
        Action = "EditRejected",
        Details = "Customer edit request rejected.",
        PerformedBy = performedBy,
        CreatedAtUtc = DateTime.UtcNow
    });

    logger.LogInformation("Customer edit request {RequestId} rejected by {PerformedBy}", requestId, performedBy);

    await db.SaveChangesAsync();

    return Results.Ok(request);
}).RequireAuthorization("AdminOrOwner");

app.MapGet("/customers/{customerId:guid}/notes", async (Guid customerId, LocalCrmDbContext db) =>
{
    var notes = await db.CustomerNotes
        .Where(n => n.CustomerId == customerId)
        .OrderByDescending(n => n.CreatedAtUtc)
        .ToListAsync();

    return Results.Ok(notes);
}).RequireAuthorization("AuthenticatedUser");

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
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/customers/{customerId:guid}/audit", async (Guid customerId, LocalCrmDbContext db) =>
{
    var logs = await db.AuditLogs
        .Where(a => a.EntityId == customerId.ToString())
        .OrderByDescending(a => a.CreatedAtUtc)
        .Take(100)
        .ToListAsync();

    return Results.Ok(logs);
}).RequireAuthorization("AuthenticatedUser");

app.MapGet("/audit", async (
    string? entityType,
    string? entityId,
    string? action,
    string? performedBy,
    DateTime? from,
    DateTime? to,
    LocalCrmDbContext db) =>
{
    var query = db.AuditLogs.AsQueryable();

    if (!string.IsNullOrWhiteSpace(entityType) && entityType != "All")
    {
        query = query.Where(a => a.EntityType == entityType);
    }

    if (!string.IsNullOrWhiteSpace(entityId))
    {
        var entityIdSearch = entityId.Trim().ToLower();
        query = query.Where(a => a.EntityId.ToLower().Contains(entityIdSearch));
    }

    if (!string.IsNullOrWhiteSpace(action) && action != "All")
    {
        var actionSearch = action.Trim().ToLower();
        query = query.Where(a => a.Action.ToLower().Contains(actionSearch));
    }

    if (!string.IsNullOrWhiteSpace(performedBy))
    {
        var performedBySearch = performedBy.Trim().ToLower();
        query = query.Where(a => a.PerformedBy.ToLower().Contains(performedBySearch));
    }

    if (from.HasValue)
    {
        var fromUtc = DateTime.SpecifyKind(from.Value.Date, DateTimeKind.Utc);
        query = query.Where(a => a.CreatedAtUtc >= fromUtc);
    }

    if (to.HasValue)
    {
        var toUtcExclusive = DateTime.SpecifyKind(to.Value.Date.AddDays(1), DateTimeKind.Utc);
        query = query.Where(a => a.CreatedAtUtc < toUtcExclusive);
    }

    var logs = await query
        .OrderByDescending(a => a.CreatedAtUtc)
        .Take(250)
        .ToListAsync();

    return Results.Ok(logs);
}).RequireAuthorization("AdminOrOwner");

app.Run();






static async Task<DocumentTemplate?> GetDefaultDocumentTemplateAsync(LocalCrmDbContext db, string documentType)
{
    var defaultTemplate = await db.DocumentTemplates
        .Where(template =>
            template.DocumentType == documentType &&
            template.IsActive &&
            template.IsDefault)
        .OrderByDescending(template => template.UpdatedAtUtc)
        .FirstOrDefaultAsync();

    if (defaultTemplate is not null)
    {
        return defaultTemplate;
    }

    return await db.DocumentTemplates
        .Where(template =>
            template.DocumentType == documentType &&
            template.IsActive)
        .OrderByDescending(template => template.UpdatedAtUtc)
        .FirstOrDefaultAsync();
}

static string BuildTemplateBackedPrintableDocumentHtml(
    string documentLabel,
    DocumentTemplate template,
    Dictionary<string, string> values,
    DateTime generatedAtUtc)
{
    var renderedBody = RenderDocumentTemplate(template.ContentHtml, values);

    return $$"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{EncodeHtml(documentLabel)}} - {{EncodeHtml(template.Name)}}</title>
  <style>
    :root {
      color: #1f2933;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    body {
      margin: 0;
      background: #f4f6f8;
    }

    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 32px;
      background: white;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 18px;
    }

    button {
      border: 0;
      border-radius: 8px;
      background: #1f2933;
      color: white;
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
    }

    .template-meta {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #d9e2ec;
      color: #52606d;
      font-size: 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      border-bottom: 1px solid #e5e7eb;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }

    @media print {
      body {
        background: white;
      }

      .page {
        max-width: none;
        padding: 0;
        min-height: auto;
      }

      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="actions">
      <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>

    {{renderedBody}}

    <section class="template-meta">
      <div>Generated from LocalCRM template "{{EncodeHtml(template.Name)}}" for {{EncodeHtml(documentLabel)}}.</div>
      <div>Generated: {{FormatDateForDocument(generatedAtUtc)}}.</div>
      <div>Use the browser print dialog to print a hard copy or save as PDF.</div>
    </section>
  </main>
</body>
</html>
""";
}

static string RenderDocumentTemplate(string templateHtml, Dictionary<string, string> values)
{
    var rendered = templateHtml;

    foreach (var value in values)
    {
        rendered = rendered.Replace("{{" + value.Key + "}}", EncodeHtml(value.Value));
    }

    return rendered;
}

static Dictionary<string, string> BuildQuoteTemplateValues(Quote quote, Customer customer, DateTime generatedAtUtc)
{
    return new Dictionary<string, string>
    {
        ["QuoteId"] = quote.Id.ToString(),
        ["QuoteNumber"] = quote.QuoteNumber,
        ["DocumentType"] = "Quote",
        ["Status"] = quote.Status,
        ["QuoteDate"] = FormatDateForDocument(quote.QuoteDateUtc),
        ["GeneratedDate"] = FormatDateForDocument(generatedAtUtc),
        ["CustomerId"] = customer.Id.ToString(),
        ["CustomerName"] = customer.Name,
        ["CustomerType"] = customer.Type,
        ["CustomerEmail"] = customer.Email,
        ["CustomerPhone"] = customer.Phone,
        ["CustomerAddress"] = BuildCustomerAddress(customer),
        ["Title"] = quote.Title,
        ["Description"] = quote.Description,
        ["Amount"] = FormatCurrencyForDocument(quote.Amount),
        ["SentDate"] = quote.SentAtUtc.HasValue ? FormatDateForDocument(quote.SentAtUtc.Value) : "",
        ["AcceptedDate"] = quote.AcceptedAtUtc.HasValue ? FormatDateForDocument(quote.AcceptedAtUtc.Value) : "",
        ["RejectedDate"] = quote.RejectedAtUtc.HasValue ? FormatDateForDocument(quote.RejectedAtUtc.Value) : "",
        ["ExpiredDate"] = quote.ExpiredAtUtc.HasValue ? FormatDateForDocument(quote.ExpiredAtUtc.Value) : ""
    };
}

static Dictionary<string, string> BuildContractTemplateValues(Contract contract, Customer customer, Quote? quote, DateTime generatedAtUtc)
{
    return new Dictionary<string, string>
    {
        ["ContractId"] = contract.Id.ToString(),
        ["ContractNumber"] = contract.ContractNumber,
        ["DocumentType"] = "Contract",
        ["Status"] = contract.Status,
        ["ContractDate"] = FormatDateForDocument(contract.ContractDateUtc),
        ["GeneratedDate"] = FormatDateForDocument(generatedAtUtc),
        ["CustomerId"] = customer.Id.ToString(),
        ["CustomerName"] = customer.Name,
        ["CustomerType"] = customer.Type,
        ["CustomerEmail"] = customer.Email,
        ["CustomerPhone"] = customer.Phone,
        ["CustomerAddress"] = BuildCustomerAddress(customer),
        ["QuoteId"] = quote?.Id.ToString() ?? "",
        ["QuoteNumber"] = quote?.QuoteNumber ?? "",
        ["QuoteStatus"] = quote?.Status ?? "",
        ["ScopeOfWorkId"] = contract.ScopeOfWorkId?.ToString() ?? "",
        ["Title"] = contract.Title,
        ["Description"] = contract.Description,
        ["Amount"] = FormatCurrencyForDocument(contract.Amount),
        ["SentDate"] = contract.SentAtUtc.HasValue ? FormatDateForDocument(contract.SentAtUtc.Value) : "",
        ["SignedDate"] = contract.SignedAtUtc.HasValue ? FormatDateForDocument(contract.SignedAtUtc.Value) : "",
        ["CompletedBillableDate"] = contract.CompletedBillableAtUtc.HasValue ? FormatDateForDocument(contract.CompletedBillableAtUtc.Value) : "",
        ["CancelledDate"] = contract.CancelledAtUtc.HasValue ? FormatDateForDocument(contract.CancelledAtUtc.Value) : ""
    };
}

static Dictionary<string, string> BuildScopeOfWorkTemplateValues(
    ScopeOfWork scopeOfWork,
    Customer customer,
    Quote? quote,
    Contract? contract,
    DateTime generatedAtUtc)
{
    return new Dictionary<string, string>
    {
        ["ScopeOfWorkId"] = scopeOfWork.Id.ToString(),
        ["ScopeNumber"] = scopeOfWork.ScopeNumber,
        ["DocumentType"] = "ScopeOfWork",
        ["Status"] = scopeOfWork.Status,
        ["ScopeDate"] = FormatDateForDocument(scopeOfWork.ScopeDateUtc),
        ["GeneratedDate"] = FormatDateForDocument(generatedAtUtc),
        ["CustomerId"] = customer.Id.ToString(),
        ["CustomerName"] = customer.Name,
        ["CustomerType"] = customer.Type,
        ["CustomerEmail"] = customer.Email,
        ["CustomerPhone"] = customer.Phone,
        ["CustomerAddress"] = BuildCustomerAddress(customer),
        ["QuoteId"] = quote?.Id.ToString() ?? "",
        ["QuoteNumber"] = quote?.QuoteNumber ?? "",
        ["QuoteStatus"] = quote?.Status ?? "",
        ["ContractId"] = contract?.Id.ToString() ?? "",
        ["ContractNumber"] = contract?.ContractNumber ?? "",
        ["ContractStatus"] = contract?.Status ?? "",
        ["Title"] = scopeOfWork.Title,
        ["Description"] = scopeOfWork.Description,
        ["Deliverables"] = scopeOfWork.Deliverables,
        ["Assumptions"] = scopeOfWork.Assumptions,
        ["Exclusions"] = scopeOfWork.Exclusions,
        ["EstimatedAmount"] = FormatCurrencyForDocument(scopeOfWork.EstimatedAmount),
        ["ReviewedDate"] = scopeOfWork.ReviewedAtUtc.HasValue ? FormatDateForDocument(scopeOfWork.ReviewedAtUtc.Value) : "",
        ["ApprovedDate"] = scopeOfWork.ApprovedAtUtc.HasValue ? FormatDateForDocument(scopeOfWork.ApprovedAtUtc.Value) : "",
        ["ActivatedDate"] = scopeOfWork.ActivatedAtUtc.HasValue ? FormatDateForDocument(scopeOfWork.ActivatedAtUtc.Value) : "",
        ["CompletedDate"] = scopeOfWork.CompletedAtUtc.HasValue ? FormatDateForDocument(scopeOfWork.CompletedAtUtc.Value) : "",
        ["CancelledDate"] = scopeOfWork.CancelledAtUtc.HasValue ? FormatDateForDocument(scopeOfWork.CancelledAtUtc.Value) : ""
    };
}

static string BuildCustomerAddress(Customer customer)
{
    return string.Join(", ", new[]
        {
            customer.AddressLine1,
            customer.AddressLine2,
            customer.City,
            customer.State,
            customer.PostalCode
        }
        .Where(value => !string.IsNullOrWhiteSpace(value)));
}

static IEnumerable<DocumentTemplate> GetDefaultDocumentTemplates(DateTime nowUtc)
{
    return new[]
    {
        new DocumentTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Default Quote Template",
            DocumentType = "Quote",
            ContentHtml = GetDefaultQuoteTemplateHtml(),
            IsDefault = false,
            IsActive = true,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        },
        new DocumentTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Default Contract Template",
            DocumentType = "Contract",
            ContentHtml = GetDefaultContractTemplateHtml(),
            IsDefault = false,
            IsActive = true,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        },
        new DocumentTemplate
        {
            Id = Guid.NewGuid(),
            Name = "Default Scope of Work Template",
            DocumentType = "ScopeOfWork",
            ContentHtml = GetDefaultScopeOfWorkTemplateHtml(),
            IsDefault = false,
            IsActive = true,
            CreatedAtUtc = nowUtc,
            UpdatedAtUtc = nowUtc
        }
    };
}

static string GetDefaultQuoteTemplateHtml()
{
    return """
<section>
  <h1>QUOTE</h1>
  <p><strong>Quote #:</strong> {{QuoteNumber}}</p>
  <p><strong>Status:</strong> {{Status}}</p>
  <p><strong>Customer:</strong> {{CustomerName}}</p>
  <p><strong>Title:</strong> {{Title}}</p>
  <p><strong>Description:</strong> {{Description}}</p>
  <p><strong>Amount:</strong> {{Amount}}</p>
</section>
""";
}

static string GetDefaultContractTemplateHtml()
{
    return """
<section>
  <h1>CONTRACT</h1>
  <p><strong>Contract #:</strong> {{ContractNumber}}</p>
  <p><strong>Status:</strong> {{Status}}</p>
  <p><strong>Customer:</strong> {{CustomerName}}</p>
  <p><strong>Linked Quote:</strong> {{QuoteNumber}}</p>
  <p><strong>Title:</strong> {{Title}}</p>
  <p><strong>Description:</strong> {{Description}}</p>
  <p><strong>Amount:</strong> {{Amount}}</p>
</section>
""";
}

static string GetDefaultScopeOfWorkTemplateHtml()
{
    return """
<section>
  <h1>SCOPE OF WORK</h1>
  <p><strong>SOW #:</strong> {{ScopeNumber}}</p>
  <p><strong>Status:</strong> {{Status}}</p>
  <p><strong>Customer:</strong> {{CustomerName}}</p>
  <p><strong>Linked Quote:</strong> {{QuoteNumber}}</p>
  <p><strong>Linked Contract:</strong> {{ContractNumber}}</p>
  <p><strong>Title:</strong> {{Title}}</p>
  <p><strong>Description:</strong> {{Description}}</p>
  <p><strong>Deliverables:</strong> {{Deliverables}}</p>
  <p><strong>Estimated Amount:</strong> {{EstimatedAmount}}</p>
</section>
""";
}

static async Task ClearDefaultTemplatesForTypeAsync(LocalCrmDbContext db, string documentType, Guid? exceptTemplateId = null)
{
    var existingDefaults = await db.DocumentTemplates
        .Where(template =>
            template.DocumentType == documentType &&
            template.IsDefault &&
            (!exceptTemplateId.HasValue || template.Id != exceptTemplateId.Value))
        .ToListAsync();

    foreach (var template in existingDefaults)
    {
        template.IsDefault = false;
        template.UpdatedAtUtc = DateTime.UtcNow;
    }
}

static DocumentTemplateResponse ToDocumentTemplateResponse(DocumentTemplate template)
{
    return new DocumentTemplateResponse(
        template.Id,
        template.Name,
        template.DocumentType,
        template.ContentHtml,
        template.IsDefault,
        template.IsActive,
        template.CreatedAtUtc,
        template.UpdatedAtUtc
    );
}

static string ValidateDocumentTemplateInput(string name, string documentType, string contentHtml)
{
    if (string.IsNullOrWhiteSpace(name))
    {
        return "Template name is required";
    }

    if (name.Trim().Length < 2)
    {
        return "Template name must be at least 2 characters";
    }

    if (!IsValidDocumentType(documentType.Trim()))
    {
        return "Document type must be Quote, Contract, or ScopeOfWork";
    }

    if (string.IsNullOrWhiteSpace(contentHtml))
    {
        return "Template HTML content is required";
    }

    if (contentHtml.Length > 20000)
    {
        return "Template HTML content cannot exceed 20000 characters";
    }

    return "";
}

static bool IsValidDocumentType(string documentType)
{
    return documentType == "Quote" ||
        documentType == "Contract" ||
        documentType == "ScopeOfWork";
}

static string BuildScopeOfWorkDocumentHtml(ScopeOfWork scopeOfWork, Customer customer, Quote? quote, Contract? contract, DateTime generatedAtUtc)
{
    var customerAddress = string.Join(", ", new[]
        {
            customer.AddressLine1,
            customer.AddressLine2,
            customer.City,
            customer.State,
            customer.PostalCode
        }
        .Where(value => !string.IsNullOrWhiteSpace(value)));

    var statusDates = new List<string>();

    if (scopeOfWork.ReviewedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>In Review:</strong> {FormatDateForDocument(scopeOfWork.ReviewedAtUtc.Value)}</div>");
    }

    if (scopeOfWork.ApprovedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Approved:</strong> {FormatDateForDocument(scopeOfWork.ApprovedAtUtc.Value)}</div>");
    }

    if (scopeOfWork.ActivatedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Active:</strong> {FormatDateForDocument(scopeOfWork.ActivatedAtUtc.Value)}</div>");
    }

    if (scopeOfWork.CompletedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Completed:</strong> {FormatDateForDocument(scopeOfWork.CompletedAtUtc.Value)}</div>");
    }

    if (scopeOfWork.CancelledAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Cancelled:</strong> {FormatDateForDocument(scopeOfWork.CancelledAtUtc.Value)}</div>");
    }

    var statusDatesHtml = statusDates.Count == 0
        ? "<div class=\"muted\">No status dates recorded.</div>"
        : string.Join("\n        ", statusDates);

    var linkedQuoteHtml = quote is null
        ? "<div class=\"muted\">No linked quote.</div>"
        : $"<div><strong>Linked Quote:</strong> {EncodeHtml(quote.QuoteNumber)}</div><div><strong>Quote Status:</strong> {EncodeHtml(quote.Status)}</div>";

    var linkedContractHtml = contract is null
        ? "<div class=\"muted\">No linked contract.</div>"
        : $"<div><strong>Linked Contract:</strong> {EncodeHtml(contract.ContractNumber)}</div><div><strong>Contract Status:</strong> {EncodeHtml(contract.Status)}</div>";

    return $$"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Scope of Work {{EncodeHtml(scopeOfWork.ScopeNumber)}}</title>
  <style>
    :root {
      color: #1f2933;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    body {
      margin: 0;
      background: #f4f6f8;
    }

    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 32px;
      background: white;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #1f2933;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      letter-spacing: 0.04em;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .muted {
      color: #52606d;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background: #e8f1fb;
      font-weight: 700;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 24px;
    }

    .box {
      border: 1px solid #d9e2ec;
      border-radius: 10px;
      padding: 16px;
      background: #f8fafc;
      margin-bottom: 16px;
    }

    .scope-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .section-content {
      line-height: 1.5;
      min-height: 64px;
      white-space: normal;
    }

    .amount {
      text-align: right;
      font-size: 22px;
      font-weight: 700;
    }

    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #d9e2ec;
      color: #52606d;
      font-size: 12px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 18px;
    }

    button {
      border: 0;
      border-radius: 8px;
      background: #1f2933;
      color: white;
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
    }

    @media print {
      body {
        background: white;
      }

      .page {
        max-width: none;
        padding: 0;
        min-height: auto;
      }

      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="actions">
      <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <section class="topbar">
      <div>
        <h1>SCOPE OF WORK</h1>
        <div class="muted">LocalCRM</div>
      </div>

      <div>
        <div><strong>SOW #:</strong> {{EncodeHtml(scopeOfWork.ScopeNumber)}}</div>
        <div><strong>Status:</strong> <span class="badge">{{EncodeHtml(scopeOfWork.Status)}}</span></div>
        <div><strong>SOW Date:</strong> {{FormatDateForDocument(scopeOfWork.ScopeDateUtc)}}</div>
        <div><strong>Generated:</strong> {{FormatDateForDocument(generatedAtUtc)}}</div>
      </div>
    </section>

    <section class="grid">
      <div class="box">
        <h2>Customer</h2>
        <div><strong>{{EncodeHtml(customer.Name)}}</strong></div>
        <div>{{EncodeHtml(customer.Type)}}</div>
        <div>{{EncodeHtml(customer.Email)}}</div>
        <div>{{EncodeHtml(customer.Phone)}}</div>
        <div>{{EncodeHtml(customerAddress)}}</div>
      </div>

      <div class="box">
        <h2>Links</h2>
        {{linkedQuoteHtml}}
        {{linkedContractHtml}}
      </div>
    </section>

    <section class="grid">
      <div class="box">
        <h2>Status Dates</h2>
        {{statusDatesHtml}}
      </div>

      <div class="box">
        <h2>Estimated Amount</h2>
        <div class="amount">{{FormatCurrencyForDocument(scopeOfWork.EstimatedAmount)}}</div>
      </div>
    </section>

    <section class="box">
      <div class="scope-title">{{EncodeHtml(scopeOfWork.Title)}}</div>
      <div class="section-content">{{EncodeHtml(scopeOfWork.Description).Replace("\n", "<br />")}}</div>
    </section>

    <section class="box">
      <h2>Deliverables</h2>
      <div class="section-content">{{EncodeHtml(scopeOfWork.Deliverables).Replace("\n", "<br />")}}</div>
    </section>

    <section class="box">
      <h2>Assumptions</h2>
      <div class="section-content">{{EncodeHtml(scopeOfWork.Assumptions).Replace("\n", "<br />")}}</div>
    </section>

    <section class="box">
      <h2>Exclusions</h2>
      <div class="section-content">{{EncodeHtml(scopeOfWork.Exclusions).Replace("\n", "<br />")}}</div>
    </section>

    <section class="footer">
      <div>This document was generated from LocalCRM scope of work record {{EncodeHtml(scopeOfWork.Id.ToString())}}.</div>
      <div>Use the browser print dialog to print a hard copy or save as PDF.</div>
    </section>
  </main>
</body>
</html>
""";
}

static async Task<string> GenerateScopeOfWorkNumberAsync(LocalCrmDbContext db, DateTime nowUtc)
{
    var prefix = $"SOW-{nowUtc:yyyyMMdd}";
    var countForDay = await db.ScopeOfWorks.CountAsync(scope => scope.ScopeNumber.StartsWith(prefix));
    return $"{prefix}-{countForDay + 1:0000}";
}

static ScopeOfWorkListResponse ToScopeOfWorkResponse(ScopeOfWork scopeOfWork, string customerName, string quoteNumber, string contractNumber)
{
    return new ScopeOfWorkListResponse(
        scopeOfWork.Id,
        scopeOfWork.CustomerId,
        customerName,
        scopeOfWork.QuoteId,
        quoteNumber,
        scopeOfWork.ContractId,
        contractNumber,
        scopeOfWork.ScopeNumber,
        scopeOfWork.Title,
        scopeOfWork.Description,
        scopeOfWork.Deliverables,
        scopeOfWork.Assumptions,
        scopeOfWork.Exclusions,
        scopeOfWork.EstimatedAmount,
        scopeOfWork.Status,
        scopeOfWork.ScopeDateUtc,
        scopeOfWork.ReviewedAtUtc,
        scopeOfWork.ApprovedAtUtc,
        scopeOfWork.ActivatedAtUtc,
        scopeOfWork.CompletedAtUtc,
        scopeOfWork.CancelledAtUtc,
        scopeOfWork.CreatedAtUtc,
        scopeOfWork.UpdatedAtUtc
    );
}

static string ValidateScopeOfWorkInput(CreateScopeOfWorkRequest input)
{
    if (input.CustomerId == Guid.Empty)
    {
        return "Customer is required";
    }

    if (string.IsNullOrWhiteSpace(input.Title))
    {
        return "Scope of work title is required";
    }

    if (input.Title.Trim().Length < 2)
    {
        return "Scope of work title must be at least 2 characters";
    }

    if (input.EstimatedAmount < 0)
    {
        return "Estimated amount cannot be negative";
    }

    if (!string.IsNullOrWhiteSpace(input.Status) && !IsValidScopeOfWorkStatus(input.Status.Trim()))
    {
        return "Scope of work status must be Draft, In Review, Approved, Active, Completed, or Cancelled";
    }

    return "";
}

static bool IsValidScopeOfWorkStatus(string status)
{
    return status == "Draft" ||
        status == "In Review" ||
        status == "Approved" ||
        status == "Active" ||
        status == "Completed" ||
        status == "Cancelled";
}

static string BuildContractDocumentHtml(Contract contract, Customer customer, Quote? quote, DateTime generatedAtUtc)
{
    var customerAddress = string.Join(", ", new[]
        {
            customer.AddressLine1,
            customer.AddressLine2,
            customer.City,
            customer.State,
            customer.PostalCode
        }
        .Where(value => !string.IsNullOrWhiteSpace(value)));

    var statusDates = new List<string>();

    if (contract.SentAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Sent:</strong> {FormatDateForDocument(contract.SentAtUtc.Value)}</div>");
    }

    if (contract.SignedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Signed:</strong> {FormatDateForDocument(contract.SignedAtUtc.Value)}</div>");
    }

    if (contract.CompletedBillableAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Completed/Billable:</strong> {FormatDateForDocument(contract.CompletedBillableAtUtc.Value)}</div>");
    }

    if (contract.CancelledAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Cancelled:</strong> {FormatDateForDocument(contract.CancelledAtUtc.Value)}</div>");
    }

    var encodedDescription = EncodeHtml(contract.Description).Replace("\n", "<br />");
    var statusDatesHtml = statusDates.Count == 0
        ? "<div class=\"muted\">No status dates recorded.</div>"
        : string.Join("\n        ", statusDates);

    var linkedQuoteHtml = quote is null
        ? "<div class=\"muted\">No linked quote.</div>"
        : $"<div><strong>Linked Quote:</strong> {EncodeHtml(quote.QuoteNumber)}</div><div><strong>Quote Status:</strong> {EncodeHtml(quote.Status)}</div>";

    return $$"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Contract {{EncodeHtml(contract.ContractNumber)}}</title>
  <style>
    :root {
      color: #1f2933;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    body {
      margin: 0;
      background: #f4f6f8;
    }

    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 32px;
      background: white;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #1f2933;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      letter-spacing: 0.04em;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .muted {
      color: #52606d;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background: #e8f1fb;
      font-weight: 700;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 24px;
    }

    .box {
      border: 1px solid #d9e2ec;
      border-radius: 10px;
      padding: 16px;
      background: #f8fafc;
    }

    .contract-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .description {
      line-height: 1.5;
      min-height: 110px;
      white-space: normal;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    th,
    td {
      border-bottom: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f8fafc;
      color: #334e68;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .amount {
      text-align: right;
      font-size: 22px;
      font-weight: 700;
    }

    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      margin-top: 44px;
    }

    .signature-line {
      border-top: 1px solid #1f2933;
      padding-top: 8px;
      color: #52606d;
      font-size: 12px;
    }

    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #d9e2ec;
      color: #52606d;
      font-size: 12px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 18px;
    }

    button {
      border: 0;
      border-radius: 8px;
      background: #1f2933;
      color: white;
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
    }

    @media print {
      body {
        background: white;
      }

      .page {
        max-width: none;
        padding: 0;
        min-height: auto;
      }

      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="actions">
      <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <section class="topbar">
      <div>
        <h1>CONTRACT</h1>
        <div class="muted">LocalCRM</div>
      </div>

      <div>
        <div><strong>Contract #:</strong> {{EncodeHtml(contract.ContractNumber)}}</div>
        <div><strong>Status:</strong> <span class="badge">{{EncodeHtml(contract.Status)}}</span></div>
        <div><strong>Contract Date:</strong> {{FormatDateForDocument(contract.ContractDateUtc)}}</div>
        <div><strong>Generated:</strong> {{FormatDateForDocument(generatedAtUtc)}}</div>
      </div>
    </section>

    <section class="grid">
      <div class="box">
        <h2>Customer</h2>
        <div><strong>{{EncodeHtml(customer.Name)}}</strong></div>
        <div>{{EncodeHtml(customer.Type)}}</div>
        <div>{{EncodeHtml(customer.Email)}}</div>
        <div>{{EncodeHtml(customer.Phone)}}</div>
        <div>{{EncodeHtml(customerAddress)}}</div>
      </div>

      <div class="box">
        <h2>Contract Links</h2>
        {{linkedQuoteHtml}}
        <div><strong>Scope of Work ID:</strong> {{EncodeHtml(contract.ScopeOfWorkId?.ToString() ?? "Not linked")}}</div>
      </div>
    </section>

    <section class="grid">
      <div class="box">
        <h2>Status Dates</h2>
        {{statusDatesHtml}}
      </div>

      <div class="box">
        <h2>Contract Amount</h2>
        <div class="amount">{{FormatCurrencyForDocument(contract.Amount)}}</div>
      </div>
    </section>

    <section class="box">
      <div class="contract-title">{{EncodeHtml(contract.Title)}}</div>
      <div class="description">{{encodedDescription}}</div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{EncodeHtml(contract.Title)}}</td>
          <td class="amount">{{FormatCurrencyForDocument(contract.Amount)}}</td>
        </tr>
      </tbody>
    </table>

    <section class="signature-grid">
      <div class="signature-line">Authorized Representative / Date</div>
      <div class="signature-line">Customer Signature / Date</div>
    </section>

    <section class="footer">
      <div>This document was generated from LocalCRM contract record {{EncodeHtml(contract.Id.ToString())}}.</div>
      <div>Use the browser print dialog to print a hard copy or save as PDF.</div>
    </section>
  </main>
</body>
</html>
""";
}

static async Task<string> GenerateContractNumberAsync(LocalCrmDbContext db, DateTime nowUtc)
{
    var prefix = $"C-{nowUtc:yyyyMMdd}";
    var countForDay = await db.Contracts.CountAsync(contract => contract.ContractNumber.StartsWith(prefix));
    return $"{prefix}-{countForDay + 1:0000}";
}

static ContractListResponse ToContractResponse(Contract contract, string customerName, string quoteNumber)
{
    return new ContractListResponse(
        contract.Id,
        contract.CustomerId,
        customerName,
        contract.QuoteId,
        quoteNumber,
        contract.ScopeOfWorkId,
        contract.ContractNumber,
        contract.Title,
        contract.Description,
        contract.Amount,
        contract.Status,
        contract.ContractDateUtc,
        contract.SentAtUtc,
        contract.SignedAtUtc,
        contract.CompletedBillableAtUtc,
        contract.CancelledAtUtc,
        contract.CreatedAtUtc,
        contract.UpdatedAtUtc
    );
}

static string ValidateContractInput(CreateContractRequest input)
{
    if (input.CustomerId == Guid.Empty)
    {
        return "Customer is required";
    }

    if (string.IsNullOrWhiteSpace(input.Title))
    {
        return "Contract title is required";
    }

    if (input.Title.Trim().Length < 2)
    {
        return "Contract title must be at least 2 characters";
    }

    if (input.Amount < 0)
    {
        return "Contract amount cannot be negative";
    }

    if (!string.IsNullOrWhiteSpace(input.Status) && !IsValidContractStatus(input.Status.Trim()))
    {
        return "Contract status must be Draft, Sent, Signed, Completed/Billable, or Cancelled";
    }

    return "";
}

static bool IsValidContractStatus(string status)
{
    return status == "Draft" ||
        status == "Sent" ||
        status == "Signed" ||
        status == "Completed/Billable" ||
        status == "Cancelled";
}

static string BuildQuoteDocumentHtml(Quote quote, Customer customer, DateTime generatedAtUtc)
{
    var customerAddress = string.Join(", ", new[]
        {
            customer.AddressLine1,
            customer.AddressLine2,
            customer.City,
            customer.State,
            customer.PostalCode
        }
        .Where(value => !string.IsNullOrWhiteSpace(value)));

    var statusDates = new List<string>();

    if (quote.SentAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Sent:</strong> {FormatDateForDocument(quote.SentAtUtc.Value)}</div>");
    }

    if (quote.AcceptedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Accepted:</strong> {FormatDateForDocument(quote.AcceptedAtUtc.Value)}</div>");
    }

    if (quote.RejectedAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Rejected:</strong> {FormatDateForDocument(quote.RejectedAtUtc.Value)}</div>");
    }

    if (quote.ExpiredAtUtc.HasValue)
    {
        statusDates.Add($"<div><strong>Expired:</strong> {FormatDateForDocument(quote.ExpiredAtUtc.Value)}</div>");
    }

    var encodedDescription = EncodeHtml(quote.Description).Replace("\n", "<br />");
    var statusDatesHtml = statusDates.Count == 0
        ? "<div class=\"muted\">No status dates recorded.</div>"
        : string.Join("\n        ", statusDates);

    return $$"""
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Quote {{EncodeHtml(quote.QuoteNumber)}}</title>
  <style>
    :root {
      color: #1f2933;
      font-family: Arial, sans-serif;
      font-size: 14px;
    }

    body {
      margin: 0;
      background: #f4f6f8;
    }

    .page {
      max-width: 850px;
      margin: 0 auto;
      padding: 32px;
      background: white;
      min-height: 100vh;
      box-sizing: border-box;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 2px solid #1f2933;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      letter-spacing: 0.04em;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 18px;
    }

    .muted {
      color: #52606d;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background: #e8f1fb;
      font-weight: 700;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
      margin-bottom: 24px;
    }

    .box {
      border: 1px solid #d9e2ec;
      border-radius: 10px;
      padding: 16px;
      background: #f8fafc;
    }

    .quote-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .description {
      line-height: 1.5;
      min-height: 90px;
      white-space: normal;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }

    th,
    td {
      border-bottom: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background: #f8fafc;
      color: #334e68;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .amount {
      text-align: right;
      font-size: 22px;
      font-weight: 700;
    }

    .footer {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #d9e2ec;
      color: #52606d;
      font-size: 12px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-bottom: 18px;
    }

    button {
      border: 0;
      border-radius: 8px;
      background: #1f2933;
      color: white;
      padding: 10px 14px;
      font: inherit;
      cursor: pointer;
    }

    @media print {
      body {
        background: white;
      }

      .page {
        max-width: none;
        padding: 0;
        min-height: auto;
      }

      .actions {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <div class="actions">
      <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <section class="topbar">
      <div>
        <h1>QUOTE</h1>
        <div class="muted">LocalCRM</div>
      </div>

      <div>
        <div><strong>Quote #:</strong> {{EncodeHtml(quote.QuoteNumber)}}</div>
        <div><strong>Status:</strong> <span class="badge">{{EncodeHtml(quote.Status)}}</span></div>
        <div><strong>Quote Date:</strong> {{FormatDateForDocument(quote.QuoteDateUtc)}}</div>
        <div><strong>Generated:</strong> {{FormatDateForDocument(generatedAtUtc)}}</div>
      </div>
    </section>

    <section class="grid">
      <div class="box">
        <h2>Customer</h2>
        <div><strong>{{EncodeHtml(customer.Name)}}</strong></div>
        <div>{{EncodeHtml(customer.Type)}}</div>
        <div>{{EncodeHtml(customer.Email)}}</div>
        <div>{{EncodeHtml(customer.Phone)}}</div>
        <div>{{EncodeHtml(customerAddress)}}</div>
      </div>

      <div class="box">
        <h2>Status Dates</h2>
        {{statusDatesHtml}}
      </div>
    </section>

    <section class="box">
      <div class="quote-title">{{EncodeHtml(quote.Title)}}</div>
      <div class="description">{{encodedDescription}}</div>
    </section>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{EncodeHtml(quote.Title)}}</td>
          <td class="amount">{{FormatCurrencyForDocument(quote.Amount)}}</td>
        </tr>
      </tbody>
    </table>

    <section class="footer">
      <div>This document was generated from LocalCRM quote record {{EncodeHtml(quote.Id.ToString())}}.</div>
      <div>Use the browser print dialog to print a hard copy or save as PDF.</div>
    </section>
  </main>
</body>
</html>
""";
}

static string EncodeHtml(string? value)
{
    return WebUtility.HtmlEncode(value ?? "");
}

static string FormatDateForDocument(DateTime value)
{
    return value.ToString("yyyy-MM-dd");
}

static string FormatCurrencyForDocument(decimal value)
{
    return value.ToString("C2", System.Globalization.CultureInfo.GetCultureInfo("en-US"));
}

static async Task ExpireOverdueQuotesAsync(LocalCrmDbContext db, DateTime nowUtc)
{
    var expirationCutoff = nowUtc.AddDays(-30);

    var overdueQuotes = await db.Quotes
        .Where(q =>
            q.Status == "Sent" &&
            q.SentAtUtc.HasValue &&
            q.SentAtUtc.Value <= expirationCutoff)
        .ToListAsync();

    if (overdueQuotes.Count == 0)
    {
        return;
    }

    foreach (var quote in overdueQuotes)
    {
        quote.Status = "Expired";
        quote.ExpiredAtUtc = nowUtc;
        quote.UpdatedAtUtc = nowUtc;

        db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            EntityType = "Quote",
            EntityId = quote.Id.ToString(),
            Action = "QuoteExpired",
            Details = $"Quote '{quote.QuoteNumber}' automatically expired after 30 days.",
            PerformedBy = "system",
            CreatedAtUtc = nowUtc
        });
    }

    await db.SaveChangesAsync();
}

static async Task<string> GenerateQuoteNumberAsync(LocalCrmDbContext db, DateTime nowUtc)
{
    var prefix = $"Q-{nowUtc:yyyyMMdd}";
    var countForDay = await db.Quotes.CountAsync(q => q.QuoteNumber.StartsWith(prefix));
    return $"{prefix}-{countForDay + 1:0000}";
}

static QuoteListResponse ToQuoteResponse(Quote quote, string customerName)
{
    return new QuoteListResponse(
        quote.Id,
        quote.CustomerId,
        customerName,
        quote.QuoteNumber,
        quote.Title,
        quote.Description,
        quote.Amount,
        quote.Status,
        quote.QuoteDateUtc,
        quote.SentAtUtc,
        quote.AcceptedAtUtc,
        quote.RejectedAtUtc,
        quote.ExpiredAtUtc,
        quote.CreatedAtUtc,
        quote.UpdatedAtUtc
    );
}

static string ValidateQuoteInput(CreateQuoteRequest input)
{
    if (input.CustomerId == Guid.Empty)
    {
        return "Customer is required";
    }

    if (string.IsNullOrWhiteSpace(input.Title))
    {
        return "Quote title is required";
    }

    if (input.Title.Trim().Length < 2)
    {
        return "Quote title must be at least 2 characters";
    }

    if (input.Amount < 0)
    {
        return "Quote amount cannot be negative";
    }

    if (!string.IsNullOrWhiteSpace(input.Status) && !IsValidQuoteStatus(input.Status.Trim()))
    {
        return "Quote status must be Draft, Sent, Accepted, Rejected, or Expired";
    }

    return "";
}

static bool IsValidQuoteStatus(string status)
{
    return status == "Draft" ||
        status == "Sent" ||
        status == "Accepted" ||
        status == "Rejected" ||
        status == "Expired";
}

static string GetPerformedBy(HttpContext httpContext)
{
    var email = httpContext.User.FindFirstValue(ClaimTypes.Email);

    if (!string.IsNullOrWhiteSpace(email))
    {
        return email;
    }

    return "system";
}

static async Task<User?> GetCallerUserAsync(HttpContext httpContext, LocalCrmDbContext db)
{
    var email = httpContext.User.FindFirstValue(ClaimTypes.Email);

    if (string.IsNullOrWhiteSpace(email))
    {
        return null;
    }

    return await db.Users.FirstOrDefaultAsync(u =>
        u.Email.ToLower() == email.ToLower() &&
        u.IsActive);
}

static bool IsAdminOrOwner(User user)
{
    return user.Role == "Admin" || user.Role == "Owner";
}

static bool IsOwner(User user)
{
    return user.Role == "Owner";
}

static CustomerEditRequestReviewResponse ToCustomerEditRequestReviewResponse(CustomerEditRequest request, Customer? customer)
{
    return new CustomerEditRequestReviewResponse(
        request.Id,
        request.CustomerId,
        request.RequestedByUserId,
        request.RequestedByEmail,
        request.Status,
        request.RequestedName,
        request.RequestedType,
        request.RequestedEmail,
        request.RequestedPhone,
        request.RequestedAddressLine1,
        request.RequestedAddressLine2,
        request.RequestedCity,
        request.RequestedState,
        request.RequestedPostalCode,
        request.RequestedStatus,
        request.AdminDecisionByEmail,
        request.AdminDecisionNote,
        request.CreatedAtUtc,
        request.UpdatedAtUtc,
        request.DecidedAtUtc,
        customer is null
            ? null
            : new CustomerSnapshotResponse(
                customer.Id,
                customer.Name,
                customer.Type,
                customer.Email,
                customer.Phone,
                customer.AddressLine1,
                customer.AddressLine2,
                customer.City,
                customer.State,
                customer.PostalCode,
                customer.Status,
                customer.UpdatedAtUtc
            )
    );
}

static string ValidatePassword(string password)
{
    if (string.IsNullOrWhiteSpace(password))
    {
        return "Password is required";
    }

    if (password.Length < 8)
    {
        return "Password must be at least 8 characters";
    }

    if (!password.Any(char.IsUpper))
    {
        return "Password must include at least one uppercase letter";
    }

    if (!password.Any(char.IsLower))
    {
        return "Password must include at least one lowercase letter";
    }

    if (!password.Any(char.IsDigit))
    {
        return "Password must include at least one number";
    }

    return "";
}

static string ValidateRequestedCustomerFields(SubmitCustomerEditRequest input)
{
    var name = input.Name.Trim();
    var type = input.Type.Trim();
    var status = input.Status.Trim();

    if (string.IsNullOrWhiteSpace(name))
    {
        return "Customer name is required";
    }

    if (name.Length < 2)
    {
        return "Customer name must be at least 2 characters";
    }

    if (type != "Company" && type != "Person")
    {
        return "Customer type must be Company or Person";
    }

    if (status != "Active" && status != "Lead" && status != "Inactive")
    {
        return "Customer status must be Active, Lead, or Inactive";
    }

    if (!string.IsNullOrWhiteSpace(input.Email) && !IsValidEmail(input.Email.Trim()))
    {
        return "A valid email address is required";
    }

    return "";
}

static JwtTokenResult CreateJwtToken(User user, IConfiguration config)
{
    var issuer = config["Jwt:Issuer"] ?? "LocalCRM.Api";
    var audience = config["Jwt:Audience"] ?? "LocalCRM.Desktop";
    var signingKey = config["Jwt:SigningKey"] ?? throw new InvalidOperationException("JWT signing key is missing.");
    var expirationMinutes = int.TryParse(config["Jwt:ExpirationMinutes"], out var parsedMinutes)
        ? parsedMinutes
        : 120;

    var expiresAtUtc = DateTime.UtcNow.AddMinutes(expirationMinutes);
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Name, user.DisplayName),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.Role, user.Role)
    };

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: expiresAtUtc,
        signingCredentials: credentials
    );

    return new JwtTokenResult(
        new JwtSecurityTokenHandler().WriteToken(token),
        expiresAtUtc
    );
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
    if (user.Email.Equals("owner@localcrm.dev", StringComparison.OrdinalIgnoreCase) && password == "Owner123!")
    {
        return true;
    }

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




public record CreateDocumentTemplateRequest(
    string Name,
    string DocumentType,
    string ContentHtml,
    bool IsDefault
);

public record UpdateDocumentTemplateRequest(
    string Name,
    string DocumentType,
    string ContentHtml,
    bool IsDefault,
    bool IsActive
);

public record UpdateDocumentTemplateActiveRequest(
    bool IsActive
);

public record DocumentTemplateResponse(
    Guid Id,
    string Name,
    string DocumentType,
    string ContentHtml,
    bool IsDefault,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public record CreateScopeOfWorkRequest(
    Guid CustomerId,
    Guid? QuoteId,
    Guid? ContractId,
    string Title,
    string Description,
    string Deliverables,
    string Assumptions,
    string Exclusions,
    decimal EstimatedAmount,
    string Status
);

public record UpdateScopeOfWorkStatusRequest(
    string Status
);

public record ScopeOfWorkListResponse(
    Guid Id,
    Guid CustomerId,
    string CustomerName,
    Guid? QuoteId,
    string QuoteNumber,
    Guid? ContractId,
    string ContractNumber,
    string ScopeNumber,
    string Title,
    string Description,
    string Deliverables,
    string Assumptions,
    string Exclusions,
    decimal EstimatedAmount,
    string Status,
    DateTime ScopeDateUtc,
    DateTime? ReviewedAtUtc,
    DateTime? ApprovedAtUtc,
    DateTime? ActivatedAtUtc,
    DateTime? CompletedAtUtc,
    DateTime? CancelledAtUtc,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public record CreateContractRequest(
    Guid CustomerId,
    Guid? QuoteId,
    Guid? ScopeOfWorkId,
    string Title,
    string Description,
    decimal Amount,
    string Status
);

public record UpdateContractStatusRequest(
    string Status
);

public record ContractListResponse(
    Guid Id,
    Guid CustomerId,
    string CustomerName,
    Guid? QuoteId,
    string QuoteNumber,
    Guid? ScopeOfWorkId,
    string ContractNumber,
    string Title,
    string Description,
    decimal Amount,
    string Status,
    DateTime ContractDateUtc,
    DateTime? SentAtUtc,
    DateTime? SignedAtUtc,
    DateTime? CompletedBillableAtUtc,
    DateTime? CancelledAtUtc,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public record CreateQuoteRequest(
    Guid CustomerId,
    string Title,
    string Description,
    decimal Amount,
    string Status
);

public record UpdateQuoteStatusRequest(
    string Status
);

public record QuoteListResponse(
    Guid Id,
    Guid CustomerId,
    string CustomerName,
    string QuoteNumber,
    string Title,
    string Description,
    decimal Amount,
    string Status,
    DateTime QuoteDateUtc,
    DateTime? SentAtUtc,
    DateTime? AcceptedAtUtc,
    DateTime? RejectedAtUtc,
    DateTime? ExpiredAtUtc,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public record LoginRequest(string Email, string Password);

public record CreateStaffUserRequest(
    string DisplayName,
    string Email,
    string Password
);

public record CreateAdminUserRequest(
    string DisplayName,
    string Email,
    string Password
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record ResetPasswordRequest(
    string NewPassword
);

public record UserListResponse(
    Guid Id,
    string DisplayName,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);

public record SubmitCustomerEditRequest(
    string Name,
    string Type,
    string Email,
    string Phone,
    string AddressLine1,
    string AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Status
);

public record EditRequestDecision(string Note);

public record AuthUserResponse(
    Guid Id,
    string DisplayName,
    string Email,
    string Role,
    bool IsActive
);

public record LoginResponse(
    Guid Id,
    string DisplayName,
    string Email,
    string Role,
    bool IsActive,
    string Token,
    DateTime ExpiresAtUtc
);

public record JwtTokenResult(
    string Token,
    DateTime ExpiresAtUtc
);

public record CustomerEditRequestReviewResponse(
    Guid Id,
    Guid CustomerId,
    string RequestedByUserId,
    string RequestedByEmail,
    string Status,
    string RequestedName,
    string RequestedType,
    string RequestedEmail,
    string RequestedPhone,
    string RequestedAddressLine1,
    string RequestedAddressLine2,
    string RequestedCity,
    string RequestedState,
    string RequestedPostalCode,
    string RequestedStatus,
    string AdminDecisionByEmail,
    string AdminDecisionNote,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc,
    DateTime? DecidedAtUtc,
    CustomerSnapshotResponse? CurrentCustomer
);

public record CustomerSnapshotResponse(
    Guid Id,
    string Name,
    string Type,
    string Email,
    string Phone,
    string AddressLine1,
    string AddressLine2,
    string City,
    string State,
    string PostalCode,
    string Status,
    DateTime UpdatedAtUtc
);

public record DashboardSummaryResponse(
    int TotalCustomers,
    int ActiveCustomers,
    int LeadCustomers,
    int InactiveCustomers,
    int PendingEditRequests,
    int ApprovedEditRequests,
    int RejectedEditRequests,
    int EditRequestsLast7Days,
    int PendingEditRequestsToday,
    int RecentAuditEvents
);

public record PasswordVerificationResultInfo(
    bool IsValid,
    bool NeedsHashUpgrade
);