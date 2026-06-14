using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwipeJobs.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Phase7TelegramIngestion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ChannelName",
                table: "Sources",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChannelUrl",
                table: "Sources",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DefaultExpirationDays",
                table: "Sources",
                type: "integer",
                nullable: false,
                defaultValue: 30);

            migrationBuilder.AddColumn<bool>(
                name: "IngestionEnabled",
                table: "Sources",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MonitorStatus",
                table: "Sources",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "SourceLastCheckedAt",
                table: "Sources",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ApprovedByUserId",
                table: "Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CandidateJobId",
                table: "Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LifecycleStatus",
                table: "Jobs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "PostedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PublishedByUserId",
                table: "Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "IngestionMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalSourceKey = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TelegramMessageId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    TelegramMessageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ChannelName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ChannelUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PostedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RawMessageText = table.Column<string>(type: "text", nullable: false),
                    RawMediaUrlsJson = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ProcessingError = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IngestionMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_IngestionMessages_Sources_SourceId",
                        column: x => x.SourceId,
                        principalTable: "Sources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobCandidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    IsRemote = table.Column<bool>(type: "boolean", nullable: false),
                    SalaryMin = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    SalaryMax = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    EmploymentType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    SkillsJson = table.Column<string>(type: "text", nullable: true),
                    ApplyMethod = table.Column<int>(type: "integer", nullable: false),
                    ApplyUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ApplyEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ApplyTelegram = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ApplyPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    ExtractionConfidence = table.Column<int>(type: "integer", nullable: false),
                    CompletenessScore = table.Column<int>(type: "integer", nullable: false),
                    TrustScore = table.Column<int>(type: "integer", nullable: false),
                    SpamScore = table.Column<int>(type: "integer", nullable: false),
                    ContentFingerprint = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    DuplicateGroupId = table.Column<Guid>(type: "uuid", nullable: false),
                    PublishedJobId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectedReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    PublishedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    PublishedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCandidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCandidates_Jobs_PublishedJobId",
                        column: x => x.PublishedJobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_JobCandidates_Sources_SourceId",
                        column: x => x.SourceId,
                        principalTable: "Sources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Reason = table.Column<int>(type: "integer", nullable: false),
                    Details = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ResolvedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobReports_Jobs_JobId",
                        column: x => x.JobId,
                        principalTable: "Jobs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobReports_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "JobCandidateMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    JobCandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    IngestionMessageId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsPrimary = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobCandidateMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobCandidateMessages_IngestionMessages_IngestionMessageId",
                        column: x => x.IngestionMessageId,
                        principalTable: "IngestionMessages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_JobCandidateMessages_JobCandidates_JobCandidateId",
                        column: x => x.JobCandidateId,
                        principalTable: "JobCandidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sources_ExternalIdentifier",
                table: "Sources",
                column: "ExternalIdentifier");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_ExpiresAt",
                table: "Jobs",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_LifecycleStatus",
                table: "Jobs",
                column: "LifecycleStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_PostedAt",
                table: "Jobs",
                column: "PostedAt");

            migrationBuilder.CreateIndex(
                name: "IX_IngestionMessages_SourceId_ExternalSourceKey",
                table: "IngestionMessages",
                columns: new[] { "SourceId", "ExternalSourceKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidateMessages_IngestionMessageId",
                table: "JobCandidateMessages",
                column: "IngestionMessageId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidateMessages_JobCandidateId_IngestionMessageId",
                table: "JobCandidateMessages",
                columns: new[] { "JobCandidateId", "IngestionMessageId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidates_ContentFingerprint",
                table: "JobCandidates",
                column: "ContentFingerprint");

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidates_DuplicateGroupId",
                table: "JobCandidates",
                column: "DuplicateGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidates_PublishedJobId",
                table: "JobCandidates",
                column: "PublishedJobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidates_SourceId",
                table: "JobCandidates",
                column: "SourceId");

            migrationBuilder.CreateIndex(
                name: "IX_JobCandidates_Status",
                table: "JobCandidates",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_JobReports_JobId",
                table: "JobReports",
                column: "JobId");

            migrationBuilder.CreateIndex(
                name: "IX_JobReports_Status",
                table: "JobReports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_JobReports_UserId",
                table: "JobReports",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobCandidateMessages");

            migrationBuilder.DropTable(
                name: "JobReports");

            migrationBuilder.DropTable(
                name: "IngestionMessages");

            migrationBuilder.DropTable(
                name: "JobCandidates");

            migrationBuilder.DropIndex(
                name: "IX_Sources_ExternalIdentifier",
                table: "Sources");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_ExpiresAt",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_LifecycleStatus",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_PostedAt",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ChannelName",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "ChannelUrl",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "DefaultExpirationDays",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "IngestionEnabled",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "MonitorStatus",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "SourceLastCheckedAt",
                table: "Sources");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "ApprovedByUserId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "CandidateJobId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "LifecycleStatus",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "PostedAt",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "PublishedByUserId",
                table: "Jobs");
        }
    }
}
