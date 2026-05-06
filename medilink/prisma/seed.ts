import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding Medilink database…");

  // Admin
  const adminPwd = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@medilink.fr" },
    update: {},
    create: {
      email: "admin@medilink.fr",
      password: adminPwd,
      firstName: "Admin",
      lastName: "Medilink",
      role: "admin",
    },
  });
  console.log("✅ Admin créé:", admin.email);

  // Sites
  const sites = await Promise.all([
    prisma.site.upsert({
      where: { id: "site-1" },
      update: {},
      create: {
        id: "site-1",
        name: "Clinique Saint-Jean",
        address: "15 avenue de la République",
        city: "Paris",
        zipCode: "75011",
        phone: "01 23 45 67 89",
        description: "Clinique pluridisciplinaire – Plateau technique complet",
      },
    }),
    prisma.site.upsert({
      where: { id: "site-2" },
      update: {},
      create: {
        id: "site-2",
        name: "Cabinet de Radiologie Lumière",
        address: "8 rue du Docteur Schweitzer",
        city: "Lyon",
        zipCode: "69003",
        phone: "04 72 11 22 33",
        description: "Cabinet spécialisé en imagerie médicale",
      },
    }),
    prisma.site.upsert({
      where: { id: "site-3" },
      update: {},
      create: {
        id: "site-3",
        name: "Hôpital Privé du Midi",
        address: "23 boulevard Victor Hugo",
        city: "Marseille",
        zipCode: "13001",
        phone: "04 91 50 60 70",
        description: "Établissement de chirurgie et médecine",
      },
    }),
  ]);
  console.log("✅ Sites créés:", sites.map((s) => s.name).join(", "));

  // Users
  const pwd = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "marie.dupont@email.fr" },
      update: {},
      create: {
        email: "marie.dupont@email.fr",
        password: pwd,
        firstName: "Marie",
        lastName: "Dupont",
        phone: "06 12 34 56 78",
        role: "secretaire",
      },
    }),
    prisma.user.upsert({
      where: { email: "thomas.martin@email.fr" },
      update: {},
      create: {
        email: "thomas.martin@email.fr",
        password: pwd,
        firstName: "Thomas",
        lastName: "Martin",
        phone: "07 98 76 54 32",
        role: "manip_radio",
        rppsNumber: "1234567890",
      },
    }),
    prisma.user.upsert({
      where: { email: "sophie.leroy@email.fr" },
      update: {},
      create: {
        email: "sophie.leroy@email.fr",
        password: pwd,
        firstName: "Sophie",
        lastName: "Leroy",
        phone: "06 55 44 33 22",
        role: "medecin",
        speciality: "Radiologue",
        rppsNumber: "9876543210",
      },
    }),
    prisma.user.upsert({
      where: { email: "jean.bernard@email.fr" },
      update: {},
      create: {
        email: "jean.bernard@email.fr",
        password: pwd,
        firstName: "Jean",
        lastName: "Bernard",
        phone: "06 11 22 33 44",
        role: "medecin",
        speciality: "Médecin généraliste",
        rppsNumber: "1122334455",
      },
    }),
    prisma.user.upsert({
      where: { email: "claire.petit@email.fr" },
      update: {},
      create: {
        email: "claire.petit@email.fr",
        password: pwd,
        firstName: "Claire",
        lastName: "Petit",
        phone: "07 00 11 22 33",
        role: "secretaire",
      },
    }),
  ]);
  console.log("✅ Utilisateurs créés:", users.map((u) => u.email).join(", "));

  // Site preferences for all users on all sites
  for (const user of users) {
    for (const site of sites) {
      await prisma.userSitePreference.upsert({
        where: { userId_siteId: { userId: user.id, siteId: site.id } },
        update: {},
        create: { userId: user.id, siteId: site.id, enabled: true },
      });
    }
  }
  console.log("✅ Préférences de sites configurées");

  // Vacations
  const now = new Date();
  const d = (daysFromNow: number, hour: number) => {
    const dt = new Date(now);
    dt.setDate(dt.getDate() + daysFromNow);
    dt.setHours(hour, 0, 0, 0);
    return dt;
  };

  const vacations = await Promise.all([
    prisma.vacation.create({
      data: {
        title: "Vacation secrétariat – Accueil patients",
        description: "Accueil, prise de RDV, gestion administrative",
        siteId: "site-1",
        requiredRole: "secretaire",
        startDate: d(2, 8),
        endDate: d(2, 17),
        hourlyRate: 18,
        status: "available",
        notes: "Formation courte sur le logiciel Doctolib nécessaire",
      },
    }),
    prisma.vacation.create({
      data: {
        title: "Vacation Manip Radio – Scanner & IRM",
        description: "Realisation examens scanner et IRM, positionnement patients",
        siteId: "site-2",
        requiredRole: "manip_radio",
        startDate: d(3, 7),
        endDate: d(3, 15),
        hourlyRate: 32,
        status: "available",
      },
    }),
    prisma.vacation.create({
      data: {
        title: "Remplacement médecin – Consultations",
        description: "Consultations de médecine générale, suivi patients chroniques",
        siteId: "site-3",
        requiredRole: "medecin",
        speciality: "Médecin généraliste",
        startDate: d(4, 9),
        endDate: d(4, 18),
        hourlyRate: 75,
        status: "available",
        notes: "Accès au dossier médical partagé via Apicrypt",
      },
    }),
    prisma.vacation.create({
      data: {
        title: "Vacation radiologie interventionnelle",
        description: "Assistance aux actes de radiologie interventionnelle",
        siteId: "site-2",
        requiredRole: "manip_radio",
        startDate: d(5, 8),
        endDate: d(5, 16),
        hourlyRate: 35,
        status: "available",
      },
    }),
    prisma.vacation.create({
      data: {
        title: "Secrétariat médical – Urgences",
        description: "Gestion administrative aux urgences, frappe comptes-rendus",
        siteId: "site-1",
        requiredRole: "secretaire",
        startDate: d(1, 20),
        endDate: d(2, 8),
        hourlyRate: 22,
        status: "available",
        notes: "Vacation de nuit – majoration incluse dans le taux",
      },
    }),
    prisma.vacation.create({
      data: {
        title: "Remplacement radiologue – Interprétation",
        description: "Lecture et compte-rendu d'examens d'imagerie",
        siteId: "site-2",
        requiredRole: "medecin",
        speciality: "Radiologue",
        startDate: d(7, 8),
        endDate: d(7, 18),
        hourlyRate: 120,
        status: "available",
      },
    }),
    // Taken vacation
    prisma.vacation.create({
      data: {
        title: "Vacation secrétariat – Cabinet Lyon",
        siteId: "site-2",
        requiredRole: "secretaire",
        startDate: d(1, 9),
        endDate: d(1, 17),
        hourlyRate: 18,
        status: "taken",
        takenById: users[0].id, // Marie Dupont
        takenAt: new Date(),
      },
    }),
  ]);
  console.log("✅ Vacations créées:", vacations.length);

  console.log("\n🎉 Base de données initialisée !");
  console.log("\n📝 Comptes de démonstration:");
  console.log("   Admin   : admin@medilink.fr / admin123");
  console.log("   Secrét. : marie.dupont@email.fr / password123");
  console.log("   Manip   : thomas.martin@email.fr / password123");
  console.log("   Médecin : sophie.leroy@email.fr / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
