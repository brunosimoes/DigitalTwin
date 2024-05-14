using ServiceAPI;

namespace MicroService;

public class App
{
	#region Public Methods

	public static void Main(string[] args)
	{
		CreateHostBuilder(args).Build().Run();
	}

	#endregion Public Methods

	#region Private Methods

	private static IHostBuilder CreateHostBuilder(string[] args)
	{
		return Host.CreateDefaultBuilder(args)
				.ConfigureWebHostDefaults(webBuilder =>
				{
					webBuilder.UseUrls("http://*:8088");
					webBuilder.Configure(ConfigureWebHost);
				})
				.ConfigureServices(ConfigureServices)
				.UseContentRoot(AppContext.BaseDirectory)
				.UseWindowsService(options =>
				{
					options.ServiceName = "MicroServiceWindowsService";
				});
	}

	private static void ConfigureWebHost(IApplicationBuilder app)
	{
		app.UseRouting();
		app.UseEndpoints(endpoints =>
		{
			endpoints.MapGet("/", async context =>
			{
				var logger = context.RequestServices.GetService<ILogger<App>>();
				string filePathConfig = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "index.html");
				using (StreamReader r = new StreamReader(filePathConfig))
				{
					await context.Response.WriteAsync(r.ReadToEnd());
				}
			});

			endpoints.MapGet("/settings", async context =>
			{
				var logger = context.RequestServices.GetService<ILogger<App>>();
				string filePathConfig = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appsettings.json");
				using (StreamReader r = new StreamReader(filePathConfig))
				{
					await context.Response.WriteAsync(r.ReadToEnd());
				}
			});

			endpoints.MapPost("/settings", async context =>
			{
				try
				{
					var logger = context.RequestServices.GetService<ILogger<App>>();
					string filePathConfig = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "appsettings.json");

					// Read the content from the request body
					string requestBodyContent = await new StreamReader(context.Request.Body).ReadToEndAsync();

					// Update the appsettings.json file with the new content
					File.WriteAllText(filePathConfig, requestBodyContent);

					context.Response.StatusCode = 200;
				}
				catch (Exception ex)
				{
					var logger = context.RequestServices.GetService<ILogger<App>>();
					logger?.LogError($"Error while updating appsettings.json: {ex}");
					context.Response.StatusCode = 500;
				}
			});
		});
	}

	private static void ConfigureServices(HostBuilderContext hostContext, IServiceCollection services)
	{
		IConfiguration configuration = hostContext.Configuration;
		ServiceOptions digitalTwinOptions = configuration.GetSection("MicroService").Get<ServiceOptions>();

		// Now create a client handler which uses that proxy
		HttpClientHandler httpClientHandler = new()
		{
			Proxy = null,
		};
		HttpClient httpClient = new(httpClientHandler);
		ServiceClientAPI digitalTwinApiClient = new(httpClient)
		{
			BaseUrl = digitalTwinOptions.BaseUrlOpenAPI
		};
		services.AddSingleton(digitalTwinApiClient);
		services.AddSingleton(digitalTwinOptions);
		services.AddHostedService<MicroServiceCore>();
	}

	#endregion Private Methods
}
