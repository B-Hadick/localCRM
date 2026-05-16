using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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