/**
 * shared.js - The Unified Ecosystem Script (v2.0)
 * Handles: Header/Footer Injection, Grid Menu, Theme Toggle, Link Correction
 */

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';

    // --- A. CONFIGURATION & UTILS ---
    
    // 1. Path Resolver: Handles 'ukhona/html/' vs '../html/'
    const getPath = (filename) => {
        const isSubDir = window.location.pathname.includes('/ukhona/html/');
        const prefix = isSubDir ? '../html/' : 'ukhona/html/';
        return `${prefix}${filename}`;
    };

    // 2. Base Path Detector (for GitHub Pages subfolders)
    const REPO_NAME = '/repos-00'; // CHANGE THIS if your repo name changes
    const BASE = window.location.pathname.startsWith(REPO_NAME) ? REPO_NAME : '';

    // 3. Link Rewriter: Fixes '/assets/...' links to include repo folder
    const fixLinks = (container) => {
        if (!container || !BASE) return;
        const links = container.querySelectorAll('a[href^="/"]');
        links.forEach(a => {
            const href = a.getAttribute('href');
            // If link is absolute and doesn't already have the base, add it
            if (!href.startsWith(BASE)) {
                a.setAttribute('href', `${BASE}${href}`);
            }
        });
    };

    // 4. The Injection Engine
    async function inject(id, filename) {
        const placeholder = document.getElementById(id);
        if (!placeholder) return;

        try {
            const response = await fetch(getPath(filename));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.text();
            placeholder.innerHTML = data;
            
            // Fix links immediately after injection
            fixLinks(placeholder);
            console.log(`[System] Injected: ${filename}`);
        } catch (err) {
            console.warn(`[System] Failed to inject ${filename}:`, err);
        }
    }

    // --- B. LOAD PARTIALS ---
    // [ID in index.html, Filename in ukhona/html/]
    const PARTIALS = [
        ['header', 'header.html'],          // <--- FIXED: Matches your ID="header"
        ['footer-placeholder', 'footer.html']
    ];

    // Wait for content before running UI logic
    await Promise.all(PARTIALS.map(([id, file]) => inject(id, file)));


    // --- C. INITIALIZATION (Runs ONLY after HTML is ready) ---

    initGridMenu();
    initThemeToggle();
    initScrollProgress();
    initFooterChorus(); 

    // --- D. COMPONENT LOGIC ---

    function initGridMenu() {
        // Now looks inside the injected header
        const menuBtn = document.getElementById('menuIcon');
        const menuGrid = document.getElementById('gridMenu');

        if (menuBtn && menuGrid) {
            // Fix Grid Links too (in case they weren't caught earlier)
            fixLinks(menuGrid);

            menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = menuGrid.classList.toggle('active');
                
                if (isActive) {
                    menuGrid.style.display = 'grid';
                    menuGrid.style.opacity = '1';
                    menuGrid.style.visibility = 'visible';
                    menuGrid.style.pointerEvents = 'auto';
                    menuGrid.style.transform = 'translateY(0)';
                    menuBtn.setAttribute('aria-expanded', 'true');
                } else {
                    menuGrid.style.opacity = '0';
                    menuGrid.style.visibility = 'hidden';
                    menuGrid.style.pointerEvents = 'none';
                    menuGrid.style.transform = 'translateY(-10px)';
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!menuGrid.contains(e.target) && !menuBtn.contains(e.target)) {
                    menuGrid.classList.remove('active');
                    menuGrid.style.opacity = '0';
                    menuGrid.style.visibility = 'hidden';
                }
            });
        }
    }

    function initThemeToggle() {
        const themeBtn = document.getElementById('toggle-theme');
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        if (themeBtn) {
            themeBtn.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
            themeBtn.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                themeBtn.textContent = newTheme === 'dark' ? '🌙' : '☀️';
            });
        }
    }

    function initScrollProgress() {
        const progress = document.querySelector('.scroll-progress');
        if (progress) {
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progress.style.width = scrolled + "%";
            });
        }
    }

    function initFooterChorus() {
        const box = document.querySelector('.rotating-chorus');
        if (!box) return;
        const chips = Array.from(box.querySelectorAll('.chip'));
        if (chips.length === 0) return;

        let currentIndex = 0;
        chips.forEach((chip, idx) => chip.style.display = idx === 0 ? 'inline' : 'none');

        if (window.chorusInterval) clearInterval(window.chorusInterval);
        window.chorusInterval = setInterval(() => {
            chips[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % chips.length;
            chips[currentIndex].style.display = 'inline';
        }, 5000);
    }
});