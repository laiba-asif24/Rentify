using System.ComponentModel.DataAnnotations;

namespace online_bus_ticket.Models
{
    public class Enquiry
    {
        [Key]
        public int EnquiryId { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }
    }
}
