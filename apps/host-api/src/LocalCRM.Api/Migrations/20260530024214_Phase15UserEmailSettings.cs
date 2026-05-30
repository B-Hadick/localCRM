using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase15UserEmailSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserEmailSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SmtpHost = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    SmtpPort = table.Column<int>(type: "integer", nullable: false),
                    UseTls = table.Column<bool>(type: "boolean", nullable: false),
                    FromEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    FromDisplayName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Username = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    EncryptedPassword = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    IsConfigured = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedByEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UpdatedByEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastTestedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastTestSucceeded = table.Column<bool>(type: "boolean", nullable: false),
                    LastTestMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserEmailSettings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserEmailSettings_FromEmail",
                table: "UserEmailSettings",
                column: "FromEmail");

            migrationBuilder.CreateIndex(
                name: "IX_UserEmailSettings_IsActive",
                table: "UserEmailSettings",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_UserEmailSettings_IsConfigured",
                table: "UserEmailSettings",
                column: "IsConfigured");

            migrationBuilder.CreateIndex(
                name: "IX_UserEmailSettings_UserId",
                table: "UserEmailSettings",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserEmailSettings");
        }
    }
}
