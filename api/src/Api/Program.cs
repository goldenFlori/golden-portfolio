using Api.Options;
using Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks();

builder.Services
    .AddOptions<DatabricksOptions>()
    .Bind(builder.Configuration.GetSection(DatabricksOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<PipelineOptions>()
    .Bind(builder.Configuration.GetSection(PipelineOptions.SectionName));

builder.Services
    .AddHttpClient<IDatabricksJobsService, DatabricksJobsService>()
    .AddStandardResilienceHandler();

// Origins come from config, not a hardcoded string — a future custom domain
// (already on the roadmap) shouldn't require a code change here.
const string CorsPolicy = "Frontend";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

app.UseCors(CorsPolicy);

app.MapHealthChecks("/healthz");
app.MapControllers();

app.Run();
