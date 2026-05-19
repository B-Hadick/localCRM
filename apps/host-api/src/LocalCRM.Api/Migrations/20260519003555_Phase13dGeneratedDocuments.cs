using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LocalCRM.Api.Migrations
{
    /// <inheritdoc />
    public partial class Phase13dGeneratedDocuments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GeneratedDocuments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DocumentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SourceEntityType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    SourceEntityId = table.Column<Guid>(type: "uuid", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uuid", nullable: true),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    FileBytes = table.Column<byte[]>(type: "bytea", nullable: false),
                    GeneratedBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    GeneratedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneratedDocuments", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_DocumentType",
                table: "GeneratedDocuments",
                column: "DocumentType");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_GeneratedAtUtc",
                table: "GeneratedDocuments",
                column: "GeneratedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_GeneratedBy",
                table: "GeneratedDocuments",
                column: "GeneratedBy");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_SourceEntityId",
                table: "GeneratedDocuments",
                column: "SourceEntityId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_SourceEntityType",
                table: "GeneratedDocuments",
                column: "SourceEntityType");

            migrationBuilder.CreateIndex(
                name: "IX_GeneratedDocuments_TemplateId",
                table: "GeneratedDocuments",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GeneratedDocuments");
        }
    }
}
