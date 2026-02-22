using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using online_bus_ticket.Models;
using onlinebusticket.Data;
using onlinebusticket.Models;
using System.Diagnostics;

namespace onlinebusticket.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public HomeController(ApplicationDbContext context, UserManager<User> userManager, SignInManager<User> signInManager)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult About()
        {
            return View();
        }

        public IActionResult Routes()
        {
            return View();
        }

        public IActionResult Features()
        {
            return View();
        }

        public async Task<IActionResult> Search(string from, string to, string date)
        {
            ViewBag.From = from;
            ViewBag.To = to;
            ViewBag.Date = date;

            var schedules = await _context.BusSchedules
                .Include(s => s.Bus)
                .Include(s => s.Route)
                .Where(s => s.Route.SourceCity == from &&
                            s.Route.DestinationCity == to)
                .ToListAsync();

            return View(schedules);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}