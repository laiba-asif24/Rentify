using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_bus_ticket.Models;
using onlinebusticket.Data;

namespace onlinebusticket.Controllers
{
    [Authorize(Roles = "Employee")]
    public class EmployeeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public EmployeeController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ========== DASHBOARD ==========
        public async Task<IActionResult> Dashboard()
        {
            ViewBag.TotalSchedules = await _context.BusSchedules.CountAsync();
            ViewBag.TotalBookings = await _context.Bookings.CountAsync();
            ViewBag.TotalBuses = await _context.Buses.CountAsync();
            ViewBag.TotalRoutes = await _context.Routes.CountAsync();
            return View();
        }

        // ========== SCHEDULES ==========
        public async Task<IActionResult> Schedules()
        {
            var schedules = await _context.BusSchedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .ToListAsync();
            return View(schedules);
        }

        public async Task<IActionResult> ScheduleCreate()
        {
            ViewBag.Buses = await _context.Buses.ToListAsync();
            ViewBag.Routes = await _context.Routes.ToListAsync();
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ScheduleCreate(BusSchedule schedule)
        {
            ModelState.Remove("Bus");
            ModelState.Remove("Route");
            ModelState.Remove("Bookings");
            if (ModelState.IsValid)
            {
                _context.BusSchedules.Add(schedule);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Schedule added successfully!";
                return RedirectToAction("Schedules");
            }
            ViewBag.Buses = await _context.Buses.ToListAsync();
            ViewBag.Routes = await _context.Routes.ToListAsync();
            return View(schedule);
        }

        public async Task<IActionResult> ScheduleDelete(int id)
        {
            var schedule = await _context.BusSchedules.FindAsync(id);
            if (schedule != null)
            {
                _context.BusSchedules.Remove(schedule);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Schedule deleted successfully!";
            }
            return RedirectToAction("Schedules");
        }
        // ========== BOOKINGS ==========
        public async Task<IActionResult> Bookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.BusSchedule)
                .ThenInclude(s => s.Bus)
                .ToListAsync();
            return View(bookings);
        }
    }
}