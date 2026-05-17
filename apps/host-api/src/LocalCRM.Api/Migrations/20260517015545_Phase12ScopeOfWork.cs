using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase12ScopeOfWork : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ScopeOfWorks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuoteId = table.Column<Guid>(type: "uuid", nullable: true),
                    ContractId = table.Column<Guid>(type: "uuid", nullable: true),
                    ScopeNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Deliverables = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Assumptions = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    Exclusions = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    EstimatedAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ScopeDateUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CancelledAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ScopeOfWorks", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ScopeOfWorks_ContractId",
                table: "ScopeOfWorks",
                column: "ContractId");

            migrationBuilder.CreateIndex(
                name: "IX_ScopeOfWorks_CustomerId",
                table: "ScopeOfWorks",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ScopeOfWorks_QuoteId",
                table: "ScopeOfWorks",
                column: "QuoteId");

            migrationBuilder.CreateIndex(
                name: "IX_ScopeOfWorks_ScopeDateUtc",
                table: "ScopeOfWorks",
                column: "ScopeDateUtc");

            migrationBuilder.CreateIndex(
                name: "IX_ScopeOfWorks_ScopeNumber",
                table: "ScopeOfWorks",
                column: "ScopeNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ScopeOfWorks_Status",
                table: "ScopeOfWorks",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ScopeOfWorks");
        }
    }
}
