using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_bus_ticket.Models
{
    public class BusSchedule
    {
        [Key]
        public int ScheduleId { get; set; }
        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal Fare { get; set; }

        public int BusId { get; set; }
        public Bus Bus { get; set; }

        public int RouteId { get; set; }
        public BusRoute Route { get; set; }

        public ICollection<Booking> Bookings { get; set; }
    }
}
