using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase13DocumentTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContentHtml = table.Column<string>(type: "character varying(20000)", maxLength: 20000, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentTemplates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_DocumentType",
                table: "DocumentTemplates",
                column: "DocumentType");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_IsActive",
                table: "DocumentTemplates",
                column: "IsActive");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_IsDefault",
                table: "DocumentTemplates",
                column: "IsDefault");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DocumentTemplates");
        }
    }
}
