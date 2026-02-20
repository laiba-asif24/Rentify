using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace online_bus_ticket.Models
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }
        public string PaymentMode { get; set; }


        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }

        public int BookingId { get; set; }
        public Booking Booking { get; set; }
    }
}
