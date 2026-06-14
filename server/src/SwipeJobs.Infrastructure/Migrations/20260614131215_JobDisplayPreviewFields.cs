using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwipeJobs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class JobDisplayPreviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DisplayCompany",
                table: "Jobs",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayLocation",
                table: "Jobs",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplaySalary",
                table: "Jobs",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplaySkillsJson",
                table: "Jobs",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplaySummary",
                table: "Jobs",
                type: "character varying(180)",
                maxLength: 180,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayTitle",
                table: "Jobs",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayCompany",
                table: "JobCandidates",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayLocation",
                table: "JobCandidates",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplaySalary",
                table: "JobCandidates",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplaySkillsJson",
                table: "JobCandidates",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplaySummary",
                table: "JobCandidates",
                type: "character varying(180)",
                maxLength: 180,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisplayTitle",
                table: "JobCandidates",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DisplayCompany",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DisplayLocation",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DisplaySalary",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DisplaySkillsJson",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DisplaySummary",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DisplayTitle",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "DisplayCompany",
                table: "JobCandidates");

            migrationBuilder.DropColumn(
                name: "DisplayLocation",
                table: "JobCandidates");

            migrationBuilder.DropColumn(
                name: "DisplaySalary",
                table: "JobCandidates");

            migrationBuilder.DropColumn(
                name: "DisplaySkillsJson",
                table: "JobCandidates");

            migrationBuilder.DropColumn(
                name: "DisplaySummary",
                table: "JobCandidates");

            migrationBuilder.DropColumn(
                name: "DisplayTitle",
                table: "JobCandidates");
        }
    }
}
