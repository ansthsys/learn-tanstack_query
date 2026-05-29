import fs from "fs";
import { nanoid } from "nanoid";

const userIds = Array.from({ length: 5 }, () => nanoid(11));

const users = [
  { id: userIds[0], name: "Budi Santoso", email: "budi@mail.com", role: "admin", active: true },
  { id: userIds[1], name: "Sari Dewi", email: "sari@mail.com", role: "editor", active: true },
  { id: userIds[2], name: "Andi Pratama", email: "andi@mail.com", role: "viewer", active: false },
  { id: userIds[3], name: "Rina Kusuma", email: "rina@mail.com", role: "editor", active: true },
  { id: userIds[4], name: "Doni Herlambang", email: "doni@mail.com", role: "viewer", active: true },
];

const postTitles = [
  "Belajar React Dasar", "TanStack Query Itu Mudah", "Tips Vite untuk Pemula",
  "State Management 2024", "CSS Modern dengan Tailwind", "TypeScript untuk React Dev",
  "Deploy ke Vercel", "Testing dengan Vitest", "Memahami useQuery Lebih Dalam",
  "Optimasi Performa React", "Membuat Custom Hooks", "Server Components di React",
  "Error Handling di React Query", "React 19 Fitur Baru", "Styling dengan Tailwind v4",
  "Caching Strategy di Frontend", "Membangun REST API dengan JSON Server",
  "React Router v7 Guide", "Form Handling di React", "Authentication dengan JWT",
  "Lazy Loading di React", "Mengelola Loading State", "Pola Infinite Scroll",
  "React Suspense", "Data Fetching Pattern", "Mengenal useMutation",
  "Optimistic Update Pattern", "Membuat Dashboard Sederhana", "Testing E2E dengan Cypress",
  "React Query DevTools Tips", "Migration ke Vite", "Bundle Size Optimization",
  "Web Vitals Optimization", "Membuat Design System", "Atomic Design di React",
  "Responsive Layout Pattern", "Dark Mode Implementation", "Accessibility di React",
  "Membuat Komponen Reusable", "State Machine dengan XState", "Mengenal Zod Validation",
  "Form Validation Pattern", "Toast Notification System", "Membuat Search Feature",
  "Filter dan Sorting Data", "Export Data ke CSV", "Membuat Fitur Pagination",
  "Chart dengan Recharts", "Drag and Drop Pattern", "Real-time dengan WebSocket",
];

const commentBodies = [
  "Artikel yang sangat bagus!", "Terima kasih, sangat membantu!",
  "Penjelasannya mudah dipahami.", "Mantap, langsung saya coba.",
  "Tutorial yang lengkap sekali.", "Sudah saya praktekan dan berhasil.",
  "Mohon dibuatkan part 2 nya.", "Keren banget, lanjutkan!",
  "Ada contoh kode yang lebih kompleks?", "Saya baru tahu fitur ini, thanks!",
  "Wah ini yang saya cari-cari.", "Ditunggu tutorial selanjutnya.",
  "Sangat direkomendasikan untuk pemula.", "Penjelasan yang detail dan jelas.",
  "Akhirnya paham juga konsep ini.", "Tolong bahas lebih dalam lagi.",
  "Berguna banget untuk project saya.", "Saya share ke teman-teman.",
  "Bisa dibuatkan versi videonya?", "Step by step-nya rapi sekali.",
];

const now = new Date("2024-06-30T00:00:00Z");
const posts = [];
const comments = [];

for (let i = 0; i < 50; i++) {
  const postDate = new Date(now);
  postDate.setDate(postDate.getDate() - Math.floor(Math.random() * 180));
  const userId = userIds[Math.floor(Math.random() * 5)];

  posts.push({
    id: nanoid(11),
    title: postTitles[i],
    body: "Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    userId,
    likes: Math.floor(Math.random() * 96) + 5,
    published: Math.random() < 0.7,
    createdAt: postDate.toISOString().split("T")[0],
  });

  for (let j = 0; j < 15; j++) {
    const commentUserId = userIds[Math.floor(Math.random() * 5)];
    const commentDate = new Date(postDate);
    commentDate.setHours(commentDate.getHours() + Math.floor(Math.random() * 168) + 1);

    comments.push({
      id: nanoid(11),
      postId: posts[i].id,
      userId: commentUserId,
      body: commentBodies[Math.floor(Math.random() * commentBodies.length)],
      createdAt: commentDate.toISOString().split("T")[0],
    });
  }
}

const categories = [
  { id: nanoid(11), name: "Frontend", slug: "frontend" },
  { id: nanoid(11), name: "Backend", slug: "backend" },
  { id: nanoid(11), name: "DevOps", slug: "devops" },
  { id: nanoid(11), name: "Mobile", slug: "mobile" },
];

const notificationIds = Array.from({ length: 3 }, () => nanoid(11));

const notifications = [
  { id: notificationIds[0], userId: userIds[0], message: "Post kamu mendapat 10 likes!", read: false, createdAt: "2024-02-20" },
  { id: notificationIds[1], userId: userIds[0], message: "Sari mengomentari postmu", read: false, createdAt: "2024-02-21" },
  { id: notificationIds[2], userId: userIds[0], message: "Selamat datang kembali!", read: true, createdAt: "2024-02-18" },
];

const db = {
  users,
  posts,
  comments,
  categories,
  notifications,
  $schema: "./node_modules/json-server/schema.json",
};

fs.writeFileSync("api/db.json", JSON.stringify(db, null, 2), "utf-8");
console.log(`Generated: ${users.length} users, ${posts.length} posts, ${comments.length} comments`);
console.log(`First user ID: ${users[0].id}`);
