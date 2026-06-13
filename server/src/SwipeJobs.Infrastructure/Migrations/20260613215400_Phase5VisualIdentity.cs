using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwipeJobs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase5VisualIdentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Jobs_SourceId",
                table: "Jobs");

            migrationBuilder.AddColumn<string>(
                name: "LogoUrl",
                table: "Sources",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TrustScore",
                table: "Sources",
                type: "integer",
                nullable: false,
                defaultValue: 50);

            migrationBuilder.AddColumn<string>(
                name: "AiGeneratedImageUrl",
                table: "Jobs",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContentFingerprint",
                table: "Jobs",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalSourceKey",
                table: "Jobs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "JobImageUrl",
                table: "Jobs",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_ContentFingerprint",
                table: "Jobs",
                column: "ContentFingerprint");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_SourceId_ExternalSourceKey",
                table: "Jobs",
                columns: new[] { "SourceId", "ExternalSourceKey" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Jobs_ContentFingerprint",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_SourceId_ExternalSourceKey",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LogoUrl",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "TrustScore",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "AiGeneratedImageUrl",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ContentFingerprint",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ExternalSourceKey",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "JobImageUrl",
                table: "Jobs");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_SourceId",
                table: "Jobs",
                column: "SourceId");
        }
    }
}
