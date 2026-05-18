using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase13cDocumentTemplateImportExport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ImportedAtUtc",
                table: "DocumentTemplates",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalContentType",
                table: "DocumentTemplates",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<byte[]>(
                name: "OriginalFileBytes",
                table: "DocumentTemplates",
                type: "bytea",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalFileName",
                table: "DocumentTemplates",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SourceFormat",
                table: "DocumentTemplates",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_ImportedAtUtc",
                table: "DocumentTemplates",
                column: "ImportedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentTemplates_SourceFormat",
                table: "DocumentTemplates",
                column: "SourceFormat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DocumentTemplates_ImportedAtUtc",
                table: "DocumentTemplates");

            migrationBuilder.DropIndex(
                name: "IX_DocumentTemplates_SourceFormat",
                table: "DocumentTemplates");

            migrationBuilder.DropColumn(
                name: "ImportedAtUtc",
                table: "DocumentTemplates");

            migrationBuilder.DropColumn(
                name: "OriginalContentType",
                table: "DocumentTemplates");

            migrationBuilder.DropColumn(
                name: "OriginalFileBytes",
                table: "DocumentTemplates");

            migrationBuilder.DropColumn(
                name: "OriginalFileName",
                table: "DocumentTemplates");

            migrationBuilder.DropColumn(
                name: "SourceFormat",
                table: "DocumentTemplates");
        }
    }
}
