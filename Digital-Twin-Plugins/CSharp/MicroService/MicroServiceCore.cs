using ServiceAPI;
using ServiceSchema;

namespace MicroService;

public partial class MicroServiceCore : MicroServiceAbstract<MicroServiceCore, ServiceOptions>
{
	#region Private Fields

	private readonly ServiceOptions _options;

	#endregion Private Fields

	public string Name => "TestService";

	#region Public Constructors

	public MicroServiceCore(ServiceClientAPI apiClient, ILogger<MicroServiceCore> logger, ServiceOptions options) :
		base(apiClient, logger)
	{
		_options = options;
	}

	#endregion Public Constructors

	#region Protected Methods

	protected override async Task TearUp()
	{
		_logger.LogInformation("Preparing tear up...");
		// ICollection<AgvJobWithId> jobs = await this._apiClient.GetAgvJobsAsync();
		// _logger.LogInformation("jobs: " + jobs.Count);
	}

	protected override async Task UpdateLifeCycle()
	{
		// TODO: Update your data
		await Task.Delay(2000);
	}

	protected override async Task TearDown()
	{
		_logger.LogInformation("Tear down...");
		await Task.Delay(1, _cancellationToken);
		Environment.Exit(0);
	}

	#endregion Protected Methods
}