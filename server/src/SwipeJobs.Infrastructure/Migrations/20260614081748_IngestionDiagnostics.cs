using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwipeJobs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IngestionDiagnostics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastIngestionError",
                table: "Sources",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastScannedTelegramMessageId",
                table: "Sources",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastSuccessfulIngestionAt",
                table: "Sources",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastSyncStatus",
                table: "Sources",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SourceIngestionLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Stage = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Level = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Details = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SourceIngestionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SourceIngestionLogs_Sources_SourceId",
                        column: x => x.SourceId,
                        principalTable: "Sources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sources_ChannelUrl",
                table: "Sources",
                column: "ChannelUrl");

            migrationBuilder.CreateIndex(
                name: "IX_SourceIngestionLogs_SourceId_CreatedAt",
                table: "SourceIngestionLogs",
                columns: new[] { "SourceId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SourceIngestionLogs");

            migrationBuilder.DropIndex(
                name: "IX_Sources_ChannelUrl",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "LastIngestionError",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "LastScannedTelegramMessageId",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "LastSuccessfulIngestionAt",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "LastSyncStatus",
                table: "Sources");
        }
    }
}
