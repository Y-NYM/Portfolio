const THEME_STORAGE_KEY = "portfolio-theme-mode";
const rootElement = document.documentElement;
const themeSelects = document.querySelectorAll("[data-theme-select]");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function normalizeTheme(value) {
    if (value === "light" || value === "dark" || value === "auto") {
        return value;
    }

    return "auto";
}

function getStoredTheme() {
    try {
        return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
    } catch {
        return "auto";
    }
}

function setColorScheme(mode) {
    const resolvedMode = mode === "auto" ? (systemThemeQuery.matches ? "dark" : "light") : mode;
    rootElement.style.colorScheme = resolvedMode;
}

function syncThemeSelects(mode) {
    themeSelects.forEach((select) => {
        if (select.value !== mode) {
            select.value = mode;
        }
    });
}

function applyTheme(mode, persist = true) {
    const normalizedMode = normalizeTheme(mode);

    if (normalizedMode === "auto") {
        rootElement.removeAttribute("data-theme");
    } else {
        rootElement.setAttribute("data-theme", normalizedMode);
    }

    setColorScheme(normalizedMode);
    syncThemeSelects(normalizedMode);

    if (persist) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, normalizedMode);
        } catch {
            // Ignore localStorage errors in restricted environments.
        }
    }
}

applyTheme(getStoredTheme(), false);

themeSelects.forEach((select) => {
    select.addEventListener("change", () => {
        applyTheme(select.value, true);
    });
});

const handleSystemThemeChange = () => {
    if (!rootElement.hasAttribute("data-theme")) {
        setColorScheme("auto");
    }
};

if (typeof systemThemeQuery.addEventListener === "function") {
    systemThemeQuery.addEventListener("change", handleSystemThemeChange);
} else if (typeof systemThemeQuery.addListener === "function") {
    systemThemeQuery.addListener(handleSystemThemeChange);
}

const menu = document.querySelector(".menu-links");
const hamburgerButton = document.querySelector(".hamburger-icon");

function closeMenu() {
    if (!menu || !hamburgerButton) {
        return;
    }

    menu.classList.remove("open");
    hamburgerButton.classList.remove("open");
    hamburgerButton.setAttribute("aria-expanded", "false");
}

if (menu && hamburgerButton) {
    hamburgerButton.addEventListener("click", () => {
        const isOpen = menu.classList.toggle("open");
        hamburgerButton.classList.toggle("open", isOpen);
        hamburgerButton.setAttribute("aria-expanded", String(isOpen));
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
        if (!menu.classList.contains("open")) {
            return;
        }

        const target = event.target;
        if (!(target instanceof Node)) {
            return;
        }

        if (!menu.contains(target) && !hamburgerButton.contains(target)) {
            closeMenu();
        }
    });
}

const galleryButtons = document.querySelectorAll("[data-open-gallery]");
const galleryModals = document.querySelectorAll(".gallery-modal");
let activeModal = null;
let lastFocusedElement = null;

function closeGallery(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = true;
    document.body.style.overflow = "";

    if (lastFocusedElement instanceof HTMLElement) {
        lastFocusedElement.focus();
    }

    activeModal = null;
}

function openGallery(modalId, triggerButton) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }

    lastFocusedElement = triggerButton;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    activeModal = modal;

    const closeButton = modal.querySelector("[data-close-gallery]");
    if (closeButton instanceof HTMLElement) {
        closeButton.focus();
    }
}

galleryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const modalId = button.getAttribute("data-open-gallery");
        if (modalId) {
            openGallery(modalId, button);
        }
    });
});

galleryModals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeGallery(modal);
        }
    });

    const closeButton = modal.querySelector("[data-close-gallery]");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            closeGallery(modal);
        });
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (activeModal) {
            closeGallery(activeModal);
            return;
        }

        closeMenu();
    }
});
