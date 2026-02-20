using System.ComponentModel.DataAnnotations;

namespace online_bus_ticket.Models
{

    public class Bus
    {
        [Key]
        public int BusId { get; set; }

        [Required]
        public string BusNumber { get; set; }

        [Required]
        public string BusType { get; set; }

        [Required]
        public int TotalSeats { get; set; }

        public bool IsActive { get; set; } = true;

        public ICollection<BusSchedule> BusSchedules { get; set; }
        public ICollection<Seat> Seats { get; set; }
    }
}
