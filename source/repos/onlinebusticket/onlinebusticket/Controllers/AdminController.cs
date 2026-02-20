using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_bus_ticket.Models;
using onlinebusticket.Data;

namespace onlinebusticket.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;

        public AdminController(ApplicationDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // ========== DASHBOARD ==========
        public async Task<IActionResult> Dashboard()
        {
            ViewBag.TotalBuses = await _context.Buses.CountAsync();
            ViewBag.TotalBookings = await _context.Bookings.CountAsync();
            ViewBag.TotalEmployees = await _userManager.GetUsersInRoleAsync("Employee");
            ViewBag.TotalRevenue = await _context.Payments.SumAsync(p => p.Amount);
            return View();
        }

        // ========== BUS CRUD ==========
        public async Task<IActionResult> Buses()
        {
            var buses = await _context.Buses.ToListAsync();
            return View(buses);
        }

        public IActionResult BusCreate()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> BusCreate(Bus bus)
        {
            // ModelState se BusSchedules aur Seats ignore karo
            ModelState.Remove("BusSchedules");
            ModelState.Remove("Seats");

            if (ModelState.IsValid)
            {
                bus.IsActive = true;
                _context.Buses.Add(bus);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Bus added successfully!";
                return RedirectToAction("Buses");
            }
            return View(bus);
        }

        public async Task<IActionResult> BusEdit(int id)
        {
            var bus = await _context.Buses.FindAsync(id);
            if (bus == null) return NotFound();
            return View(bus);
        }
        [HttpPost]
        public async Task<IActionResult> BusEdit(Bus bus)
        {
            ModelState.Remove("BusSchedules");
            ModelState.Remove("Seats");

            if (ModelState.IsValid)
            {
                _context.Buses.Update(bus);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Bus updated successfully!";
                return RedirectToAction("Buses");
            }
            return View(bus);
        }

        public async Task<IActionResult> BusDelete(int id)
        {
            var bus = await _context.Buses.FindAsync(id);
            if (bus != null)
            {
                _context.Buses.Remove(bus);
                await _context.SaveChangesAsync();
                TempData["Success"] = "Bus deleted successfully!";
            }
            return RedirectToAction("Buses");
        }
    }
}