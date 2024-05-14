using AutoMapper;

namespace DigitalTwinApi
{
#pragma warning disable CA1506
	public partial class DigitalTwinApiClient
	{
		#region Private Fields

		/// <summary>
		/// Gets the mapper.
		/// </summary>
		private IMapper _mapper;

		#endregion Private Fields

		#region Public Properties

		/// <summary>
		/// Gets the mapper
		/// </summary>
		public IMapper Mapper
		{
			get
			{
				if (_mapper == null)
				{
					//Initialize mapper
					MapperConfiguration config = new(cfg =>
					{
						// cfg.CreateMap<ShopfloorWithId, Shopfloor>();
					});

					_mapper = config.CreateMapper();
				}
				return _mapper;
			}
		}

		#endregion Public Properties
	}
#pragma warning restore CA1506

}