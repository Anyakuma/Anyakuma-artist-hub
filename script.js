"use strict";

/*
  ANYAKUMA ARTIST HUB
  Front-end demonstration.
  Replace sample music links and contact email before launch.
*/

const CONFIG = {
  // Replace with Anyakuma's actual booking email.
  bookingEmail: "YOUR_BOOKING_EMAIL@example.com",
  // Replace these demo releases with verified catalogue details.
  releases: [
    { title: "NO HOOKS", type: "single", year: "2026", description: "Bars, energy, and unfiltered expression.", symbol: "NH", link: "" },
    { title: "Next Release", type: "single", year: "Coming soon", description: "The next chapter of the Anyakuma story.", symbol: "A.", link: "" },
    { title: "Future Project", type: "ep", year: "Coming soon", description: "More music. More stories. More evolution.", symbol: "AP", link: "" }
  ]
};

const $ = (selector) => document.querySelector(selector);

const storage = {
  read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

// Mobile navigation
const menuToggle = $("#menuToggle");
const navigation = $("#navigation");

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Music catalogue
const musicGrid = $("#musicGrid");
const musicSearch = $("#musicSearch");
const musicFilter = $("#musicFilter");

function renderMusic() {
  const query = musicSearch.value.trim().toLowerCase();
  const filter = musicFilter.value;

  const results = CONFIG.releases.filter((release) => {
    const searchable = `${release.title} ${release.description} ${release.type}`.toLowerCase();
    return searchable.includes(query) && (filter === "all" || release.type === filter);
  });

  musicGrid.replaceChildren();
  $("#musicEmpty").hidden = results.length > 0;

  results.forEach((release) => {
    const card = makeElement("article", "music-card");
    const cover = makeElement("div", "cover-art");
    cover.setAttribute("aria-label", `${release.title} cover artwork`);
    cover.append(makeElement("span", "", release.symbol));

    card.append(
      cover,
      makeElement("span", "release-type", release.type.toUpperCase()),
      makeElement("h3", "", release.title),
      makeElement("p", "", release.description),
      makeElement("p", "", release.year)
    );

    if (release.link) {
      try {
        const url = new URL(release.link);
        if (url.protocol === "https:" || url.protocol === "http:") {
          const link = makeElement("a", "track-link", "Listen now ↗");
          link.href = url.href;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          card.append(link);
        }
      } catch {
        // Ignore invalid or missing URLs.
      }
    } else {
      card.append(makeElement("p", "track-link", "Music link coming soon"));
    }

    musicGrid.append(card);
  });
}

musicSearch.addEventListener("input", renderMusic);
musicFilter.addEventListener("change", renderMusic);
renderMusic();

// Fan community sign-up — local demo storage only
$("#joinForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#fanName").value.trim();
  const email = $("#fanEmail").value.trim().toLowerCase();
  const message = $("#joinMessage");

  if (!name || !email) {
    message.textContent = "Please provide your name and email.";
    return;
  }

  const fans = storage.read("anyakuma_fans", []);
  if (fans.some((fan) => fan.email === email)) {
    message.textContent = "This email is already registered on this device.";
    return;
  }

  fans.push({ name, email, joinedAt: new Date().toISOString() });

  if (!storage.write("anyakuma_fans", fans)) {
    message.textContent = "Storage is unavailable. Please try again in this browser.";
    return;
  }

  message.textContent = "Welcome to the community! Your demo sign-up is saved on this device.";
  event.target.reset();
});

// Community wall — local demo storage only
const postFeed = $("#postFeed");
const MAX_POSTS = 30;

function renderPosts() {
  const posts = storage.read("anyakuma_posts", []);
  postFeed.replaceChildren();

  if (!posts.length) {
    postFeed.append(makeElement("p", "muted", "Your community starts here. Be the first to post."));
    return;
  }

  posts.slice(0, MAX_POSTS).forEach((post) => {
    const article = makeElement("article", "post");
    const meta = makeElement("div", "post-meta");
    const name = makeElement("span", "", post.name);
    const date = new Date(post.createdAt);
    const time = makeElement("time", "", Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric"
    }));

    if (!Number.isNaN(date.getTime())) time.dateTime = date.toISOString();
    meta.append(name, time);
    article.append(meta, makeElement("p", "", post.text));
    postFeed.append(article);
  });
}

$("#postForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = $("#postName").value.trim();
  const text = $("#postText").value.trim();
  const message = $("#postMessage");

  if (!name || !text) {
    message.textContent = "Enter your name and a message.";
    return;
  }

  const posts = storage.read("anyakuma_posts", []);
  posts.unshift({
    name: name.slice(0, 50),
    text: text.slice(0, 400),
    createdAt: new Date().toISOString()
  });

  if (!storage.write("anyakuma_posts", posts.slice(0, MAX_POSTS))) {
    message.textContent = "Could not save your post. Please try again.";
    return;
  }

  renderPosts();
  message.textContent = "Message posted on this device.";
  $("#postText").value = "";
});

renderPosts();

// Booking and sponsorship enquiries — opens a prefilled email draft
$("#bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const message = $("#bookingMessage");

  if (!form.reportValidity()) return;

  if (
    CONFIG.bookingEmail.includes("YOUR_BOOKING_EMAIL") ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONFIG.bookingEmail)
  ) {
    message.textContent = "The booking email has not been configured yet. Update CONFIG.bookingEmail in script.js.";
    return;
  }

  const subject = `Anyakuma Enquiry: ${data.get("type")}`;
  const body = [
    "ANYAKUMA ARTIST HUB — BOOKING ENQUIRY",
    "",
    `Contact / Organisation: ${data.get("contactName")}`,
    `Email: ${data.get("contactEmail")}`,
    `Enquiry type: ${data.get("type")}`,
    `Proposed date: ${data.get("eventDate") || "Not specified"}`,
    `Location: ${data.get("location") || "Not specified"}`,
    `Budget: ${data.get("budget") || "Not specified"}`,
    "",
    "Opportunity details:",
    data.get("brief")
  ].join("\n");

  const mailto = new URL(`mailto:${CONFIG.bookingEmail}`);
  mailto.searchParams.set("subject", subject);
  mailto.searchParams.set("body", body);

  message.textContent = "Opening your email app. Please review and send the enquiry there.";
  window.location.href = mailto.href;
});

// Footer year
$("#year").textContent = new Date().getFullYear();
