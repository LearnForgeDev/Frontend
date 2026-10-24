using LearnForge.Domain.Default.Models;
using LearnForge.Infrastructure.Persistence.DBContexts;
using LearnForge.Infrastructure.Services;
using LearnForge.Infrastructure.Services.AuthServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();
var connection = configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Не задана тестовая БД");
if (new Npgsql.NpgsqlConnectionStringBuilder(connection).Database != "LearnForge_CI")
    throw new InvalidOperationException("Начальные данные разрешены только в LearnForge_CI");

await using var master = new DataBaseContext(new DbContextOptionsBuilder<DataBaseContext>()
    .UseNpgsql(connection).Options);
await master.Database.MigrateAsync();
if (await master.Users.AnyAsync())
    throw new InvalidOperationException("Для прогона нужна пустая тестовая БД");

var password = new PasswordService().Generate("CI-password-2026!");
var owner = new User("ci-owner", password);
var teacher = new User("ci-teacher", password);
var student = new User("ci-student", password);
var secondStudent = new User("ci-second-student", password);
var outsider = new User("ci-outsider", password);
master.Users.AddRange(owner, teacher, student, secondStudent, outsider);
await master.SaveChangesAsync();
var school = await new SchoolProvisioningService(master, configuration)
    .ProvisionSchoolAsync("CI School", owner);
school.PublicId = Guid.Parse("11111111-1111-4111-8111-111111111111");
master.UserRoles.AddRange(
    new UserRole { User = teacher, School = school, Role = Role.Teacher },
    new UserRole { User = student, School = school, Role = Role.Student },
    new UserRole { User = secondStudent, School = school, Role = Role.Student });
await master.SaveChangesAsync();
await using var tenant = new SchoolDbContext(new DbContextOptionsBuilder<SchoolDbContext>()
    .UseNpgsql(school.ConnectionString).Options);
tenant.SchoolUsers.AddRange(new[] { owner, teacher, student, secondStudent }.Select(user => new SchoolUser
{
    UserId = user.Id, Name = user.Name, PublicId = user.PublicId
}));
tenant.Breanches.Add(new Breanch
{
    PublicId = Guid.Parse("22222222-2222-4222-8222-222222222222"),
    Name = "Общий чат CI", Description = "Тестовый канал"
});
await tenant.SaveChangesAsync();
var otherSchool = await new SchoolProvisioningService(master, configuration)
    .ProvisionSchoolAsync("CI Other School", outsider);
otherSchool.PublicId = Guid.Parse("33333333-3333-4333-8333-333333333333");
master.UserRoles.Add(new UserRole { User = teacher, School = otherSchool, Role = Role.Student });
await master.SaveChangesAsync();
await using var otherTenant = new SchoolDbContext(new DbContextOptionsBuilder<SchoolDbContext>()
    .UseNpgsql(otherSchool.ConnectionString).Options);
otherTenant.SchoolUsers.AddRange(new[] { outsider, teacher }.Select(user => new SchoolUser
{
    UserId = user.Id, Name = user.Name, PublicId = user.PublicId
}));
await otherTenant.SaveChangesAsync();
Console.WriteLine("Тестовые аккаунты, школа и чат готовы");
