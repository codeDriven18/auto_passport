using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwipeJobs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EmployerPipelineArchitecture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "CompanyMembers",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Owner");

            migrationBuilder.AddColumn<string>(
                name: "InterviewPhase",
                table: "Applications",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "None");

            migrationBuilder.AddColumn<DateTime>(
                name: "InterviewScheduledAtUtc",
                table: "Applications",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Applications_InterviewScheduledAtUtc",
                table: "Applications",
                column: "InterviewScheduledAtUtc");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Applications_InterviewScheduledAtUtc",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "CompanyMembers");

            migrationBuilder.DropColumn(
                name: "InterviewPhase",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "InterviewScheduledAtUtc",
                table: "Applications");
        }
    }
}
