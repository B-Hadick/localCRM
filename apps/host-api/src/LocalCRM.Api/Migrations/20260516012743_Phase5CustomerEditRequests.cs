using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase5CustomerEditRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerEditRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestedByUserId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RequestedByEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequestedName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RequestedType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequestedEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    RequestedPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequestedAddressLine1 = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    RequestedAddressLine2 = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    RequestedCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RequestedState = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RequestedPostalCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RequestedStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AdminDecisionByEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AdminDecisionNote = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DecidedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerEditRequests", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEditRequests_CustomerId",
                table: "CustomerEditRequests",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEditRequests_RequestedByEmail",
                table: "CustomerEditRequests",
                column: "RequestedByEmail");

            migrationBuilder.CreateIndex(
                name: "IX_CustomerEditRequests_Status",
                table: "CustomerEditRequests",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerEditRequests");
        }
    }
}
