using System.ComponentModel.DataAnnotations;

namespace online_bus_ticket.Models
{
    public class BusRoute
    {
        [Key]
        public int RouteId { get; set; }
        public string SourceCity { get; set; }
        public string DestinationCity { get; set; }
        public int DistanceKM { get; set; }

        public ICollection<BusSchedule> BusSchedules { get; set; }
    }
}
