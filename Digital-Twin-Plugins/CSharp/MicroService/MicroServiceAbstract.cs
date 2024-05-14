using ServiceAPI;

namespace MicroService;

public abstract class MicroServiceAbstract<TSfcxWorker, TSfcxOptions> : IHostedService
	where TSfcxWorker : IHostedService
	where TSfcxOptions : ServiceOptions
{
	#region Protected Fields

	/// <summary>
	/// Gets the DigitalTwin client.
	/// </summary>
	protected readonly ServiceClientAPI _apiClient;

	/// <summary>
	/// Gets the logger.
	/// </summary>
	protected readonly ILogger<TSfcxWorker> _logger;

	/// <summary>
	/// Gets the cancelationToken;
	/// </summary>
	protected CancellationToken _cancellationToken;

	#endregion Protected Fields

	#region Protected Constructors

	protected MicroServiceAbstract(ServiceClientAPI apiClient, ILogger<TSfcxWorker> logger)
	{
		_apiClient = apiClient ?? throw new ArgumentNullException(nameof(_apiClient));
		_logger = logger ?? throw new ArgumentNullException(nameof(logger));
	}

	#endregion Protected Constructors

	#region Public Methods

	public async Task RestartAsync() { }

	public async Task StartAsync(CancellationToken cancellationToken)
	{
		_logger.LogInformation("Worker started at: {time}", DateTimeOffset.Now);
		_cancellationToken = cancellationToken;
		await TearUp();
		await UpdateLifeCycle();
	}

	public async Task StopAsync(CancellationToken cancellationToken)
	{
		_logger.LogInformation("Worker stopped at: {time}", DateTimeOffset.Now);
		await TearDown();
	}

	#endregion Public Methods

	#region Protected Methods

	protected abstract Task TearUp();
	protected abstract Task TearDown();
	protected abstract Task UpdateLifeCycle();

	#endregion Protected Methods
}