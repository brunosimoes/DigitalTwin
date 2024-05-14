namespace MicroService;

public class ServiceOptions
{
	#region Public Properties

	/// <summary>
	/// Gets or sets the backend API URL.
	/// </summary>
	public string? BaseUrlOpenAPI { get; set; }

	/// <summary>
	/// Gets or sets the time before setting a task done.
	/// </summary>
	public int WaitFor { get; set; }

	#endregion Public Properties
}