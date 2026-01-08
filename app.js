/* app.js */
const URLS = {
  regionsTopo: "https://raw.githubusercontent.com/soundous1104/geojson_maroc_hcp/main/morocco_regions.topojson",
  provincesTopo: "https://raw.githubusercontent.com/soundous1104/geojson_maroc_hcp/main/morocco_provinces.topojson",
  communesTopo: "https://raw.githubusercontent.com/soundous1104/geojson_maroc_hcp/main/morocco_communes.topojson",
  moroccoBoundaryGeoJSON: "https://raw.githubusercontent.com/ZakariaMahmoud/morocco-complete-map-geojson-topojson/main/morocco_map.geojson",
};

const SECTOR_CONFIG = {
  emploi: { label: "Emploi", hex: "#f97316", icon: "fa-briefcase" },
  sante: { label: "Santé", hex: "#ef4444", icon: "fa-heart-pulse" },
  education: { label: "Éducation", hex: "#3b82f6", icon: "fa-graduation-cap" },
  education: { label: "Éducation", hex: "#3b82f6", icon: "fa-graduation-cap" },
  eau: { label: "Eau", hex: "#06b6d4", icon: "fa-droplet" },
  man: { label: "MAN", hex: "#8b5cf6", icon: "fa-city" },
  emploi: { label: "Emploi", hex: "#f97316", icon: "fa-briefcase" }
};

const EMPLOI_CONFIG = {
  "Peche_maritime": { label: "Pêche", icon: "fa-ship", hex: "#0ea5e9" },
  "Energies_renouvelables": { label: "Énergie", icon: "fa-wind", hex: "#84cc16" },
  "Services_publics": { label: "Service Public", icon: "fa-building-columns", hex: "#6366f1" },
  "Commerce_et_services_prives": { label: "Commerce", icon: "fa-shop", hex: "#f59e0b" },
  "BTP_et_infrastructures": { label: "BTP", icon: "fa-trowel-bricks", hex: "#78716c" },
  "energie_renouvelable": { label: "Projet Structurant", icon: "fa-solar-panel", hex: "#10b981" }
};

const EAU_CONFIG = {
  "dessalement_monobloc": { label: "Dessalement", icon: "fa-faucet-drip", hex: "#0ea5e9" },
  "dessalement_haute_capacite": { label: "Station Majeure", icon: "fa-water", hex: "#0284c7" }
};

const EDUCATION_CONFIG = {
  "prescolaire": { label: "Préscolaire", icon: "fa-baby", hex: "#60a5fa" },        // Light blue
  "primaire": { label: "Primaire", icon: "fa-child-reaching", hex: "#3b82f6" },    // Medium blue
  "college": { label: "Collège", icon: "fa-school", hex: "#2563eb" },              // Darker blue
  "lycee": { label: "Lycée", icon: "fa-graduation-cap", hex: "#1e40af" }           // Deep blue
};

const SANTE_CONFIG = {
  essp: {
    Dispensaire: { label: "Dispensaire", hex: "#22c55e", icon: "fa-house-medical" },
    "CSR 1": { label: "CSR 1", hex: "#3b82f6", icon: "fa-hospital" },
    "CSR 2": { label: "CSR 2", hex: "#2563eb", icon: "fa-hospital" },
    "CSU 1": { label: "CSU 1", hex: "#a855f7", icon: "fa-hospital-user" },
    UMP: { label: "UMP", hex: "#f59e0b", icon: "fa-kit-medical" }
  },
  ambulance: { label: "Ambulance", hex: "#ef4444", icon: "fa-truck-medical" }
};

const PANEL_THEME = {
  default: { accent: [59, 130, 246], accent2: [168, 85, 247], border: [255, 255, 255] },
  emploi: { accent: [249, 115, 22], accent2: [245, 158, 11], border: [255, 255, 255] },
  sante: { accent: [239, 68, 68], accent2: [244, 63, 94], border: [255, 255, 255] },
  education: { accent: [59, 130, 246], accent2: [37, 99, 235], border: [255, 255, 255] },
  eau: { accent: [6, 182, 212], accent2: [20, 184, 166], border: [255, 255, 255] },
  man: { accent: [139, 92, 246], accent2: [168, 85, 247], border: [255, 255, 255] },
};

function applyPanelTheme(sectorKey) {
  const t = PANEL_THEME[sectorKey] || PANEL_THEME.default;
  document.documentElement.style.setProperty("--p-accent", t.accent.join(","));
  document.documentElement.style.setProperty("--p-accent2", t.accent2.join(","));
  document.documentElement.style.setProperty("--p-border", t.border.join(","));
}

const REGION_STATS = {
  name: "Laâyoune-Sakia El Hamra",
  population_2025: 451028,
  urbanisation_2025: 92.4,
  women_share: 49.0,
  under15_share: 26.5,
  households_2025: 106751,
  area_km2: 140018,
  density_hab_km2: 3.2,
  prefectures: 0,
  provinces: 4,
  communes_total: 25,
  communes_urbaines: 4,
  communes_rurales: 21
};

const SANTE_INDICATORS = {
  taux_couverture_sanitaire: 90,
  medecins_par_10000: 8,
  infirmiers_par_10000: 20,
  taux_accouchement_surveilles: 88,
  mortalite_maternelle: 72
};

const COMMUNE_DIAGNOSTIC = {
  "tarfaya": {
    img: "assets/commune.jpeg",
    problems: [
      "Concentration des services à Laâyoune (déplacements nécessaires)",
      "Ensablement fréquent perturbant l'accès aux services",
      "Dépendance économique à la pêche et aux projets structurants"
    ]
  },
  "agadir": {
    img: "assets/communes/agadir.jpg",
    problems: [
      "Manque d’ESSP dans certains quartiers",
      "Surcharge des structures existantes",
      "Temps d’intervention ambulance élevé"
    ]
  }
};

function fichePopupHTML(d) {
  const img = d.img || "assets/fiche-default.jpg";
  const nom = d.nom || d.title || "Sans nom";
  const capacite = (d.capacite_accueil ?? "-");
  const med = (d.nb_medecins ?? "-");
  const inf = (d.nb_infirmiers ?? "-");
  const sageFemmes = (d.nb_sage_femmes ?? 0);
  const commune = d.commune || "";
  const constat = d.constat || "—";

  if (d.kind === "essp") {
    return `
      <div class="text-white" style="min-width:320px; max-width:420px;">
        <div class="font-semibold text-[16px] mb-3 flex items-center gap-2">
          <i class="fa-solid fa-hospital text-red-400"></i>
          ${nom}
        </div>

        <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img src="${img}" alt="${nom}"
            style="width:100%; height:250px; object-fit:cover; display:block;"
            onerror="this.src='assets/fiche-default.jpg'"/>
        </div>

        ${commune ? `<div class="mt-3 text-center text-white/70 text-sm">
          <i class="fa-solid fa-location-dot mr-1"></i>
          ${commune}
        </div>` : ''}
      </div>
    `;
  }

  // Ambulance popup - simplified
  if (d.kind === "ambulance") {
    return `
      <div class="text-white" style="min-width:320px; max-width:420px;">
        <div class="font-semibold text-[16px] mb-3 flex items-center gap-2">
          <i class="fa-solid fa-truck-medical text-red-400"></i>
          ${nom}
        </div>

        <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img src="${img}" alt="${nom}"
            style="width:100%; height:250px; object-fit:cover; display:block;"
            onerror="this.src='assets/ambulance.jpg'"/>
        </div>

        ${commune ? `<div class="mt-3 text-center text-white/70 text-sm">
          <i class="fa-solid fa-location-dot mr-1"></i>
          ${commune}
        </div>` : ''}
      </div>
    `;
  }

  // Special handling for employment (emploi) markers
  if (d.sector === "emploi" || d.kind === "emploi") {
    return `
      <div class="text-white" style="min-width:280px; max-width:350px;">
        <div class="font-semibold text-[14px] mb-2 flex items-center gap-2">
          <i class="fa-solid fa-briefcase text-orange-400"></i>
          Centre Emploi - ${commune}
        </div>

        <div class="space-y-2">
          <div class="p-2 rounded-lg" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.3);">
            <div class="flex items-center justify-between mb-1">
              <span class="text-white/70 text-xs">💼 Taux d'activité</span>
              <span class="text-lg font-bold text-green-300">${d.tauxActivite}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-1.5">
              <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full" style="width: ${d.tauxActivite}%"></div>
            </div>
          </div>

          <div class="p-2 rounded-lg" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)); border: 1px solid rgba(239, 68, 68, 0.3);">
            <div class="flex items-center justify-between mb-1">
              <span class="text-white/70 text-xs">📉 Taux de chômage</span>
              <span class="text-lg font-bold text-red-300">${d.tauxChomage}%</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-1.5">
              <div class="bg-gradient-to-r from-red-500 to-rose-500 h-1.5 rounded-full" style="width: ${d.tauxChomage}%"></div>
            </div>
          </div>

          <div class="p-2 rounded-lg bg-white/5 border border-white/10">
            <div class="flex items-center justify-between">
              <span class="text-white/70 text-xs">👥 Population active</span>
              <span class="text-base font-bold text-white">${d.popActive ? d.popActive.toLocaleString() : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (d.sector === "emploi" || d.sector === "education" || d.sector === "eau") {
    // Special handling for education markers with student counts
    if (d.sector === "education") {
      const total = (d.filles || 0) + (d.garcons || 0);
      return `
        <div class="text-white" style="min-width:300px; max-width:380px;">
          <div class="font-semibold text-[16px] mb-3 flex items-center gap-2">
            <i class="fa-solid ${d.icon} text-white/80"></i>
            ${d.title}
          </div>
          
          <div class="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4">
            <div class="text-center mb-3">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full" style="background:${d.hex}">
                <i class="fa-solid ${d.icon} text-white text-2xl"></i>
              </div>
            </div>
            
            <div class="text-center mb-2">
              <div class="text-white/70 text-xs mb-1">Type d'établissement</div>
              <div class="font-bold text-lg">${d.title}</div>
            </div>
            
            ${total > 0 ? `
            <div class="mt-4 space-y-2">
              <div class="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <span class="text-white/70 text-sm flex items-center gap-2">
                  <i class="fa-solid fa-users text-white/60"></i>
                  Total élèves
                </span>
                <span class="font-bold text-lg">${total}</span>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div class="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  <div class="text-pink-300 text-xs mb-1">♀ Filles</div>
                  <div class="font-bold text-pink-100">${d.filles || 0}</div>
                </div>
                <div class="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div class="text-blue-300 text-xs mb-1">♂ Garçons</div>
                  <div class="font-bold text-blue-100">${d.garcons || 0}</div>
                </div>
              </div>
            </div>
            ` : `
            <div class="mt-3 text-center text-white/50 text-sm">
              <i class="fa-solid fa-info-circle mr-1"></i>
              Données élèves non disponibles
            </div>
            `}
          </div>
        </div>
      `;
    }

    // Special handling for water (eau) markers
    if (d.sector === "eau" || d.kind === "eau") {
      return `
        <div class="text-white" style="min-width:320px; max-width:420px;">
          <div class="font-semibold text-[16px] mb-3 flex items-center gap-2">
            <i class="fa-solid fa-faucet-drip text-cyan-400"></i>
            Station de Dessalement
          </div>

          <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5 mb-3">
            <img src="${d.img || img}" alt="${nom}"
              style="width:100%; height:200px; object-fit:cover; display:block;"
              onerror="this.src='assets/fiche-default.jpg'"/>
          </div>

          <div class="space-y-2 text-[12px]">
            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">Commune</span>
              <span class="font-semibold text-right">${commune}</span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">💧 Capacité de production</span>
              <span class="font-semibold text-cyan-300">${d.capacite || '—'}</span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">🔌 Branchements EP</span>
              <span class="font-semibold">${d.branchements || 0}</span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">🏠 Raccordements réseau</span>
              <span class="font-semibold">${d.raccordements || 0}</span>
            </div>

            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">📊 Taux couverture</span>
              <span class="font-semibold text-green-300">${d.tauxCouverture || '0%'}</span>
            </div>
          </div>

          <div class="mt-3 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10">
            <div class="text-cyan-300 text-xs font-semibold mb-1">Infrastructure</div>
            <div class="text-white/90 text-xs leading-relaxed">${d.desc || 'Station de dessalement d\'eau'}</div>
          </div>
        </div>
      `;
    }

    // Generic popup for emploi and other sectors
    return `
      <div class="text-white" style="min-width:300px; max-width:380px;">
        <div class="font-semibold text-[16px] mb-3 flex items-center gap-2">
          <i class="fa-solid fa-circle-info text-white/80"></i>
          Détails
        </div>
         <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
           <img src="${img}" alt="${nom}" style="width:100%; height:140px; object-fit:cover; display:block;" onerror="this.src='assets/fiche-default.jpg'"/>
         </div>
         <div class="mt-3 space-y-2 text-[12px]">
            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">Nom</span>
              <span class="font-semibold text-right">${nom}</span>
            </div>
            ${d.type ? `
            <div class="flex items-center justify-between gap-3">
              <span class="text-white/70">Type</span>
              <span class="font-semibold text-right">${d.type}</span>
            </div>` : ""}
            ${d.desc ? `
            <div class="mt-3 p-3 rounded-xl border border-white/10 bg-white/5">
              <div class="text-white/70 mb-1">Info</div>
              <div class="text-white/90 leading-relaxed">${d.desc}</div>
            </div>` : ""}
         </div>
      </div>
    `;
  }

  return `
    <div class="text-white" style="min-width:260px; max-width:340px;">
      <div class="font-semibold text-[16px] mb-3 flex items-center gap-2">
        <i class="fa-solid fa-clipboard-list text-white/80"></i>
        Fiche technique
      </div>

      <div class="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
        <img src="${img}" alt="${nom}"
             style="width:100%; height:140px; object-fit:cover; display:block;"
             onerror="this.src='assets/fiche-default.jpg'"/>
      </div>

      <div class="mt-3 space-y-2 text-[12px]">
        <div class="flex items-center justify-between gap-3">
          <span class="text-white/70">Nom</span>
          <span class="font-semibold text-right">${nom}</span>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-white/70">Capacité d’accueil</span>
          <span class="font-semibold">${capacite}</span>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-white/70">Nombre médecins</span>
          <span class="font-semibold">${med}</span>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-white/70">Nombre infirmiers</span>
          <span class="font-semibold">${inf}</span>
        </div>

        <div class="mt-3 p-3 rounded-xl border border-white/10 bg-white/5">
          <div class="text-white/70 mb-1">Constat</div>
          <div class="text-white/90 leading-relaxed">${constat}</div>
        </div>
      </div>
    </div>
  `;
}

function getCommuneDiagnosticData(communeName) {
  const key = normalizeName(communeName);
  return COMMUNE_DIAGNOSTIC[key] || {
    img: "assets/commune.jpeg",
    problems: [
      "Couverture sanitaire insuffisante",
      "Besoin de renforcement en ambulances",
      "Déficit en personnel médical"
    ]
  };
}

function showCommuneDiagnosticPopup(communeName) {
  const d = getCommuneDiagnosticData(communeName);

  const html = `
    <div class="text-white h-full flex flex-col">
      <div class="flex items-center justify-between mb-3 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-300/20 flex items-center justify-center">
            <i class="fa-solid fa-stethoscope text-red-300"></i>
          </div>
          <div>
            <div class="font-extrabold text-[18px] leading-tight">Diagnostic sanitaire</div>
            <div class="text-white/70 text-[12px] -mt-0.5">Commune de ${communeName}</div>
          </div>
        </div>
        <div class="text-[11px] text-white/60">Contexte et recommandations</div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div class="rounded-3xl overflow-hidden border border-white/10 bg-white/5 min-h-0 relative">
          <img src="${d.img}"
               alt="${communeName}"
               class="w-full h-full object-cover object-center block"
               onerror="this.src='assets/commune.jpeg'"/>

          <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/55 to-transparent">
            <div class="text-[11px] text-white/80">Contexte territorial</div>
          </div>
        </div>

        <div class="flex flex-col gap-3 min-h-0">
          <div class="rounded-3xl border border-red-400/25 bg-red-500/10 p-4 shadow-[0_18px_40px_rgba(239,68,68,0.12)]">
            <div class="flex items-center gap-2 mb-2 text-red-200 font-extrabold text-[13px]">
              <span class="w-8 h-8 rounded-2xl bg-red-500/15 border border-red-300/20 flex items-center justify-center">
                <i class="fa-solid fa-triangle-exclamation text-[12px]"></i>
              </span>
              Diagnostic
            </div>

            <ul class="space-y-2 text-[12px] text-white/90 leading-snug">
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0"></span> Nbre habitants par infirmier élevé</li>
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0"></span> Absence de médecin dans certains quartiers</li>
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0"></span> Distance moyenne importante au centre de santé</li>
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0"></span> Offre de soins de proximité limitée</li>
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 shrink-0"></span> Croissance démographique soutenue</li>
            </ul>
          </div>

          <div class="rounded-3xl border border-emerald-400/25 bg-emerald-500/10 p-4 shadow-[0_18px_40px_rgba(16,185,129,0.10)]">
            <div class="flex items-center gap-2 mb-2 text-emerald-200 font-extrabold text-[13px]">
              <span class="w-8 h-8 rounded-2xl bg-emerald-500/15 border border-emerald-300/20 flex items-center justify-center">
                <i class="fa-solid fa-bullseye text-[12px]"></i>
              </span>
              Ciblage
            </div>

            <ul class="space-y-2 text-[12px] text-white/90 leading-snug">
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"></span> Renforcement des ressources humaines</li>
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"></span> Amélioration de l’accueil et de la qualité</li>
              <li class="flex gap-2"><span class="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-300 shrink-0"></span> Amélioration de l’accessibilité aux services</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  `;

  const modal = document.getElementById("diagModal");
  const content = document.getElementById("diagModalContent");
  const closeBtn = document.getElementById("diagClose");
  const backdrop = document.getElementById("diagBackdrop");

  content.innerHTML = html;
  modal.classList.remove("hidden");

  const close = () => modal.classList.add("hidden");
  closeBtn.onclick = close;
  backdrop.onclick = close;

  window.addEventListener("keydown", function escHandler(ev) {
    if (ev.key === "Escape") {
      close();
      window.removeEventListener("keydown", escHandler);
    }
  });
}

function fmtInt(n) { return (n ?? 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function normalizeName(x) {
  return (x || "")
    .toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\-]/g, "")
    .replace(/\s+/g, " ");
}

function featureName(f) {
  const p = f?.properties || {};
  const candidates = [
    p.nom_region, p.nom_province, p.nom_prefecture, p.nom_commune,
    p.nom, p.NOM, p.name, p.NAME, p.Name,
    p.region, p.REGION, p.province, p.PROVINCE,
    p.prefecture, p.PREFECTURE, p.commune, p.COMMUNE
  ].filter(v => typeof v === "string" && v.trim().length);

  if (candidates.length) return candidates[0].trim();

  for (const [k, v] of Object.entries(p)) {
    if (typeof v === "string" && v.trim().length && /arabe|arab|nom_arabe|arabic/i.test(k) === false) {
      return v.trim();
    }
  }
  return String(f?.id ?? "Sans nom");
}

function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = v; }

function updateUIVisibility() {
  const panelsWrap = document.getElementById("panelsWrap");
  const sectorsWrap = document.getElementById("sectorsWrap");
  const showPanels = (AppState.level !== "country");
  const showSectors = (AppState.level === "province" || AppState.level === "commune");
  if (panelsWrap) panelsWrap.style.display = showPanels ? "block" : "none";
  if (sectorsWrap) sectorsWrap.style.display = showSectors ? "block" : "none";
  updateBackButton();
}

let labelsLayer = null;

function ensureLabelPane() {
  if (!map.getPane("labelPane")) map.createPane("labelPane");
  map.getPane("labelPane").style.zIndex = 420;
  map.getPane("labelPane").style.pointerEvents = "none";
}

function clearLabels() {
  if (labelsLayer) labelsLayer.clearLayers();
}

function getPolyCenterLatLng(feature) {
  try {
    const cm = turf.centerOfMass(feature);
    const c = cm?.geometry?.coordinates;
    if (c && c.length === 2) return [c[1], c[0]];
  } catch (e) { }

  try {
    const p = turf.pointOnFeature(feature);
    const c = p?.geometry?.coordinates;
    if (c && c.length === 2) return [c[1], c[0]];
  } catch (e) { }

  try {
    return L.geoJSON(feature).getBounds().getCenter();
  } catch (e) { }

  return null;
}

function addCenterLabel(feature, text) {
  if (!labelsLayer || !feature || !text) return;

  const center = getPolyCenterLatLng(feature);
  if (!center) return;

  const html = `
    <div class="map-label-inline">
      <span class="lbl-ico"><i class="fa-solid fa-location-dot"></i></span>
      <span>${text}</span>
    </div>
  `;

  const icon = L.divIcon({
    className: "label-pane-icon",
    html,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });

  L.marker(center, {
    icon,
    interactive: false,
    keyboard: false,
    pane: "labelPane"
  }).addTo(labelsLayer);
}

function setSanteFilter(v) {
  AppState.santeFilter = v;
  if (AppState.selectedSector === "sante") {
    renderSectorPanels("sante");
    renderSanteMarkers();
  }
}

function countSantePointsInFeature(polyFeature) {
  const pts = AppState.santePoints || [];
  if (!polyFeature) return 0;
  let c = 0;
  for (const p of pts) {
    try {
      if (turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), polyFeature)) c++;
    } catch (e) { }
  }
  return c;
}

function refreshCommunesDiagnosticStyles() {
  if (!adminLayer) return;

  adminLayer.eachLayer(layer => {
    const f = layer.feature;
    if (!f || !f.geometry) return;

    let style = { weight: 1, color: "#94a3b8", fillColor: "#ffffff", fillOpacity: 0.05 };

    if (AppState.selectedSector === "sante" && AppState.diagnosticMode && (AppState.level === "province" || AppState.level === "commune")) {
      const n = countSantePointsInFeature(f);
      if (n > 1) {
        style = { weight: 1.5, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.35 };
      }
    }

    layer.setStyle(style);
  });
}

function openDiagnostic() {
  if (!(AppState.level === "province" || AppState.level === "commune") || !AppState.selectedProvince) {
    alert("Veuillez d'abord naviguer jusqu'à la province de Tarfaya.");
    return;
  }
  if (AppState.selectedSector !== "sante") {
    alert("Veuillez sélectionner le secteur Santé d'abord.");
    return;
  }

  if (!AppState.santePoints || !AppState.santePoints.length) {
    AppState.santePoints = generateRandomSantePointsForProvince(AppState.selectedProvince, 35, 10);
  }

  AppState.diagnosticMode = !AppState.diagnosticMode;
  refreshCommunesDiagnosticStyles();
}

function renderSectorPanels(sectorKey) {
  const leftPanel = document.getElementById("leftPanel");
  const rightPanel = document.getElementById("rightPanel");

  applyPanelTheme(sectorKey || "default");

  if (sectorKey === "sante") {
    let pts = AppState.santePoints || [];

    if (AppState.selectedCommune) {
      pts = pts.filter(p => {
        try { return turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), AppState.selectedCommune); }
        catch (e) { return false; }
      });
    }

    const totalAmb = pts.filter(x => x.kind === "ambulance").length;
    const esspPts = pts.filter(x => x.kind === "essp");

    const counts = {
      all: pts.length,
      "Dispensaire": esspPts.filter(x => x.subtype === "Dispensaire").length,
      "CSR 1": esspPts.filter(x => x.subtype === "CSR 1").length,
      "CSR 2": esspPts.filter(x => x.subtype === "CSR 2").length,
      "CSU 1": esspPts.filter(x => x.subtype === "CSU 1").length,
      "UMP": esspPts.filter(x => x.subtype === "UMP").length,
      ambulance: totalAmb
    };

    const totalEssp = esspPts.length;

    const btnClass = (k) => {
      const active = (AppState.santeFilter || "all") === k;
      return `px-3 py-2 rounded-xl text-[11px] border border-white/10 transition ${active ? "bg-white/15 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
        }`;
    };

    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs — Santé</div>
            <div class="panel-sub">ESSP et ambulances</div>
          </div>
          <span class="badge-chip">
            <span class="badge-dot"></span>
            ${SECTOR_CONFIG.sante.label}
          </span>
        </div>

        <div class="panel-body">
          <div class="flex flex-wrap gap-2 mb-3">
            <button class="${btnClass("all")}" onclick="setSanteFilter('all')">${counts.all} Tous</button>
            <button class="${btnClass("Dispensaire")}" onclick="setSanteFilter('Dispensaire')">${counts["Dispensaire"]} Dispensaire</button>
            <button class="${btnClass("CSR 1")}" onclick="setSanteFilter('CSR 1')">${counts["CSR 1"]} CSR 1</button>
            <button class="${btnClass("CSR 2")}" onclick="setSanteFilter('CSR 2')">${counts["CSR 2"]} CSR 2</button>
            <button class="${btnClass("CSU 1")}" onclick="setSanteFilter('CSU 1')">${counts["CSU 1"]} CSU 1</button>
            <button class="${btnClass("UMP")}" onclick="setSanteFilter('UMP')">${counts["UMP"]} UMP</button>
            <button class="${btnClass("ambulance")}" onclick="setSanteFilter('ambulance')">${counts.ambulance} Ambulances</button>
          </div>

          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">ESSP (total)</div>
                  <div class="kpi-value">${totalEssp}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-hospital"></i></div>
              </div>
              <div class="kpi-note">Structures de santé publiques.</div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Ambulances</div>
                  <div class="kpi-value">${totalAmb}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-truck-medical"></i></div>
              </div>
              <div class="kpi-note">Couverture d’intervention.</div>
            </div>
          </div>

          ${AppState.diagnosticMode
        ? `<div class="hint mt-3" style="border-color: rgba(239,68,68,0.28); background: rgba(239,68,68,0.08); color: rgba(254,202,202,0.92);">
                Mode diagnostic actif : cliquez sur une commune surlignée pour ouvrir le détail.
              </div>`
        : `<div class="hint mt-3">
                Utilisez le bouton Diagnostic pour colorer les communes et afficher les détails.
              </div>`
      }
        </div>
      </div>
    `;

    if (rightPanel) rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs</div>
          </div>
          <button onclick="openDiagnostic()" class="cta-diagnostic">
            <i class="fa-solid fa-stethoscope"></i>
            Diagnostic
          </button>
        </div>

        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Taux de couverture sanitaire</div>
                  <div class="kpi-value">${SANTE_INDICATORS.taux_couverture_sanitaire}%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-shield-heart"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Médecins / 10 000 hab</div>
                  <div class="kpi-value">${SANTE_INDICATORS.medecins_par_10000}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-user-doctor"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Infirmiers / 10 000 hab</div>
                  <div class="kpi-value">${SANTE_INDICATORS.infirmiers_par_10000}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-user-nurse"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Accouchements surveillés</div>
                  <div class="kpi-value">${SANTE_INDICATORS.taux_accouchement_surveilles}%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-baby"></i></div>
              </div>
            </div>
          </div>

          <div class="kpi mt-3">
            <div class="kpi-top">
              <div>
                <div class="kpi-label">Mortalité maternelle</div>
                <div class="kpi-value">${SANTE_INDICATORS.mortalite_maternelle}</div>
              </div>
              <div class="kpi-ico"><i class="fa-solid fa-chart-line"></i></div>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }



  if (sectorKey === "education") {
    // COMMUNE-SPECIFIC LOGIC - Check if a commune is selected
    if (AppState.selectedCommune) {
      const communeName = featureName(AppState.selectedCommune);
      console.log("Commune selected:", communeName);
      const communeData = getCommuneEducationData(communeName);
      console.log("Commune data found:", communeData);

      if (communeData) {
        // Calculate totals
        const totalEtab =
          (communeData["Nombre d'établissements préscolaires"] || 0) +
          (communeData["Nombre d'établissements Primaire"] || 0) +
          (communeData["Nombre d'établissements collège"] || 0) +
          (communeData["Nombre d'établissements Lycée"] || 0);

        const prescoF = communeData["Nombre des élèves Préscolaire -Fille-"] || 0;
        const prescoG = communeData["Nombre des élèves Préscolaire -Garçon-"] || 0;
        const primF = communeData["Nombre des élèves Primaire -Fille-"] || 0;
        const primG = communeData["Nombre des élèves Primaire -Garçon-"] || 0;
        const collF = communeData["Nombre des élèves collège -Fille-"] || 0;
        const collG = communeData["Nombre des élèves collège -Garçon-"] || 0;
        const lycF = communeData["Nombre des élèves Lycée -Fille-"] || 0;
        const lycG = communeData["Nombre des élèves Lycée -Garçon-"] || 0;

        const totalFilles = prescoF + primF + collF + lycF;
        const totalGarcons = prescoG + primG + collG + lycG;
        const totalEleves = totalFilles + totalGarcons;

        const percFilles = totalEleves > 0 ? ((totalFilles / totalEleves) * 100).toFixed(1) : 0;
        const percGarcons = totalEleves > 0 ? ((totalGarcons / totalEleves) * 100).toFixed(1) : 0;
        const avgPerEtab = totalEtab > 0 ? Math.round(totalEleves / totalEtab) : 0;

        if (leftPanel) leftPanel.innerHTML = `
          <div class="panel-card text-white">
            <div class="panel-header">
              <div>
                <div class="panel-title">Indicateurs — Éducation</div>
                <div class="panel-sub">${communeName}</div>
              </div>
              <span class="badge-chip"><span class="badge-dot" style="background:#3b82f6;"></span> Éducation</span>
            </div>
            <div class="panel-body">
              <div class="kpi-grid">
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Établissements</div>
                      <div class="kpi-value">${totalEtab}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-school"></i></div>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Écoles Primaires</div>
                      <div class="kpi-value">${communeData["Nombre d'établissements Primaire"] || 0}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-child-reaching"></i></div>
                  </div>
                </div>
              </div>
              <div class="kpi-grid mt-3">
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Collèges</div>
                      <div class="kpi-value">${communeData["Nombre d'établissements collège"] || 0}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-book-open"></i></div>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Lycées</div>
                      <div class="kpi-value">${communeData["Nombre d'établissements Lycée"] || 0}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-graduation-cap"></i></div>
                  </div>
                </div>
              </div>
              
              <!-- All Education Levels Enrollment -->
              <div class="mt-4 p-4 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <div class="flex items-center gap-2 mb-3">
                  <i class="fa-solid fa-chart-line text-blue-400"></i>
                  <div class="text-white/90 font-semibold text-sm">Effectifs par Niveau — Commune</div>
                </div>
                
                <div class="space-y-3 text-xs">
                  <!-- Préscolaire -->
                  <div class="p-2 rounded-lg bg-white/5">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">🎨 Préscolaire</span>
                      <span class="text-white/60 text-[10px]">${communeData["Nombre d'établissements préscolaires"] || 0} établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">${prescoF}</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">${prescoG}</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">${prescoF + prescoG}</span>
                    </div>
                  </div>

                  <!-- Primaire -->
                  <div class="p-2 rounded-lg bg-white/5 border border-blue-400/30">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">📚 Primaire</span>
                      <span class="text-white/60 text-[10px]">${communeData["Nombre d'établissements Primaire"] || 0} établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">${primF}</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">${primG}</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">${primF + primG}</span>
                    </div>
                  </div>

                  <!-- Collège -->
                  <div class="p-2 rounded-lg bg-white/5">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">📖 Collège</span>
                      <span class="text-white/60 text-[10px]">${communeData["Nombre d'établissements collège"] || 0} établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">${collF}</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">${collG}</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">${collF + collG}</span>
                    </div>
                  </div>

                  <!-- Lycée -->
                  <div class="p-2 rounded-lg bg-white/5">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">🎓 Lycée</span>
                      <span class="text-white/60 text-[10px]">${communeData["Nombre d'établissements Lycée"] || 0} établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">${lycF}</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">${lycG}</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">${lycF + lycG}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        if (rightPanel) rightPanel.innerHTML = `
          <div class="panel-card text-white">
            <div class="panel-header">
              <div>
                <div class="panel-title">Synthèse Communale</div>
                <div class="panel-sub">Statistiques globales</div>
              </div>
            </div>
            <div class="panel-body">
              <!-- Total Students Summary -->
              <div class="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
                <div class="flex items-center gap-2 mb-3">
                  <i class="fa-solid fa-users text-purple-400 text-lg"></i>
                  <div class="text-white font-bold">Total Élèves Scolarisés</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-white mb-2">${totalEleves.toLocaleString()}</div>
                  <div class="text-xs text-white/60">${communeName}</div>
                </div>
                
                <div class="mt-4 grid grid-cols-2 gap-3">
                  <div class="text-center p-2 rounded-lg bg-pink-500/20 border border-pink-400/30">
                    <div class="text-pink-400 text-xs mb-1">♀ Filles</div>
                    <div class="text-white font-bold text-lg">${totalFilles}</div>
                    <div class="text-[10px] text-white/50">${percFilles}%</div>
                  </div>
                  <div class="text-center p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <div class="text-blue-400 text-xs mb-1">♂ Garçons</div>
                    <div class="text-white font-bold text-lg">${totalGarcons}</div>
                    <div class="text-[10px] text-white/50">${percGarcons}%</div>
                  </div>
                </div>
              </div>

              <!-- Key Insights -->
              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-lightbulb text-yellow-400 text-sm"></i>
                  <span class="text-white/90 font-semibold text-sm">Indicateurs Clés</span>
                </div>
                
                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Parité Filles/Garçons</span>
                    <span class="text-green-400 font-bold text-sm">${Math.abs(percFilles - percGarcons) < 5 ? 'Équilibrée' : 'Variable'}</span>
                  </div>
                  <div class="mt-1 text-[10px] text-white/50">
                    Ratio: ${percFilles}% / ${percGarcons}%
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Moyenne élèves/établ.</span>
                    <span class="text-blue-400 font-bold text-sm">${avgPerEtab}</span>
                  </div>
                  <div class="mt-1 text-[10px] text-white/50">
                    Sur ${totalEtab} établissement${totalEtab > 1 ? 's' : ''}
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Niveau le plus fréquenté</span>
                    <span class="text-purple-400 font-bold text-sm">${primF + primG >= prescoF + prescoG && primF + primG >= collF + collG && primF + primG >= lycF + lycG ? 'Primaire' :
            collF + collG >= prescoF + prescoG && collF + collG >= lycF + lycG ? 'Collège' :
              lycF + lycG >= prescoF + prescoG ? 'Lycée' : 'Préscolaire'
          }</span>
                  </div>
                </div>
              </div>

              <!-- Data Source Note -->
              <div class="mt-4 p-2 rounded-lg bg-blue-500/10 border border-blue-400/20">
                <div class="text-[10px] text-white/60 flex items-start gap-2">
                  <i class="fa-solid fa-database text-blue-400 mt-0.5"></i>
                  <div>
                    <div class="font-semibold text-white/80 mb-1">Source des données</div>
                    Données officielles de la Direction Provinciale - ${communeName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        return;
      } else {
        // Commune selected but data not found
        console.warn("No education data found for commune:", communeName);
        if (leftPanel) leftPanel.innerHTML = `
          <div class="panel-card text-white">
            <div class="panel-body">
              <div class="hint">
                Données d'éducation non disponibles pour ${communeName}.
              </div>
            </div>
          </div>
        `;
        if (rightPanel) rightPanel.innerHTML = '';
        return;
      }
    }

    // PROVINCE-SPECIFIC LOGIC - Tarfaya Province
    if (AppState.selectedProvince && isTarfayaProvince(AppState.selectedProvince)) {
      const d = TARFAYA_DATA.details.education.synthese;
      const total = d.ecoles_primaires_estimees + d.colleges_estimes + d.lycees_estimes;

      if (leftPanel) leftPanel.innerHTML = `
          <div class="panel-card text-white">
            <div class="panel-header">
              <div>
                <div class="panel-title">Indicateurs — Éducation</div>
                <div class="panel-sub">Scolarisation et infrastructures</div>
              </div>
              <span class="badge-chip"><span class="badge-dot" style="background:#3b82f6;"></span> Éducation</span>
            </div>
            <div class="panel-body">
              <div class="kpi-grid">
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Établissements (Est.)</div>
                      <div class="kpi-value">${total}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-school"></i></div>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                         <div class="kpi-label">Écoles Primaires</div>
                        <div class="kpi-value">${d.ecoles_primaires_estimees}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-child-reaching"></i></div>
                  </div>
                </div>
              </div>
              <div class="kpi-grid mt-3">
                 <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Collèges</div>
                      <div class="kpi-value">${d.colleges_estimes}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-book-open"></i></div>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Lycées</div>
                      <div class="kpi-value">${d.lycees_estimes}</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-graduation-cap"></i></div>
                  </div>
                </div>
              </div>
              
              <!-- All Education Levels Enrollment -->
              <div class="mt-4 p-4 rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <div class="flex items-center gap-2 mb-3">
                  <i class="fa-solid fa-chart-line text-blue-400"></i>
                  <div class="text-white/90 font-semibold text-sm">Effectifs par Niveau — Province</div>
                </div>
                
                <div class="space-y-3 text-xs">
                  <!-- Préscolaire -->
                  <div class="p-2 rounded-lg bg-white/5">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">🎨 Préscolaire</span>
                      <span class="text-white/60 text-[10px]">10 établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">225</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">209</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">434</span>
                    </div>
                  </div>

                  <!-- Primaire -->
                  <div class="p-2 rounded-lg bg-white/5 border border-blue-400/30">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">📚 Primaire</span>
                      <span class="text-white/60 text-[10px]">10 établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">925</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">969</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">1,894</span>
                    </div>
                  </div>

                  <!-- Collège -->
                  <div class="p-2 rounded-lg bg-white/5">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">📖 Collège</span>
                      <span class="text-white/60 text-[10px]">5 établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">421</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">434</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">855</span>
                    </div>
                  </div>

                  <!-- Lycée -->
                  <div class="p-2 rounded-lg bg-white/5">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-white/80 font-medium">🎓 Lycée</span>
                      <span class="text-white/60 text-[10px]">2 établ.</span>
                    </div>
                    <div class="flex gap-2 text-[11px]">
                      <div class="flex-1 flex justify-between">
                        <span class="text-pink-400">♀ Filles</span>
                        <span class="text-white font-semibold">323</span>
                      </div>
                      <div class="flex-1 flex justify-between">
                        <span class="text-blue-400">♂ Garçons</span>
                        <span class="text-white font-semibold">291</span>
                      </div>
                    </div>
                    <div class="mt-1 pt-1 border-t border-white/10 flex justify-between">
                      <span class="text-white/60">Total</span>
                      <span class="text-white font-bold">614</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      if (rightPanel) rightPanel.innerHTML = `
          <div class="panel-card text-white">
             <div class="panel-header">
              <div>
                <div class="panel-title">Synthèse Provinciale</div>
                <div class="panel-sub">Statistiques globales</div>
              </div>
            </div>
            <div class="panel-body">
              <!-- Total Students Summary -->
              <div class="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
                <div class="flex items-center gap-2 mb-3">
                  <i class="fa-solid fa-users text-purple-400 text-lg"></i>
                  <div class="text-white font-bold">Total Élèves Scolarisés</div>
                </div>
                <div class="text-center">
                  <div class="text-4xl font-bold text-white mb-2">3,797</div>
                  <div class="text-xs text-white/60">Province de Tarfaya</div>
                </div>
                
                <div class="mt-4 grid grid-cols-2 gap-3">
                  <div class="text-center p-2 rounded-lg bg-pink-500/20 border border-pink-400/30">
                    <div class="text-pink-400 text-xs mb-1">♀ Filles</div>
                    <div class="text-white font-bold text-lg">1,894</div>
                    <div class="text-[10px] text-white/50">49.9%</div>
                  </div>
                  <div class="text-center p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                    <div class="text-blue-400 text-xs mb-1">♂ Garçons</div>
                    <div class="text-white font-bold text-lg">1,903</div>
                    <div class="text-[10px] text-white/50">50.1%</div>
                  </div>
                </div>
              </div>

              <!-- Key Insights -->
              <div class="mt-4 space-y-2">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid fa-lightbulb text-yellow-400 text-sm"></i>
                  <span class="text-white/90 font-semibold text-sm">Indicateurs Clés</span>
                </div>
                
                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Taux de scolarisation</span>
                    <span class="text-green-400 font-bold text-sm">Élevé</span>
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Parité Filles/Garçons</span>
                    <span class="text-green-400 font-bold text-sm">Équilibrée</span>
                  </div>
                  <div class="mt-1 text-[10px] text-white/50">
                    Ratio: 49.9% / 50.1%
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Moyenne élèves/établ.</span>
                    <span class="text-blue-400 font-bold text-sm">141</span>
                  </div>
                  <div class="mt-1 text-[10px] text-white/50">
                    Sur 27 établissements
                  </div>
                </div>

                <div class="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div class="flex justify-between items-center">
                    <span class="text-white/70 text-xs">Niveau le plus fréquenté</span>
                    <span class="text-purple-400 font-bold text-sm">Primaire</span>
                  </div>
                  <div class="mt-1 text-[10px] text-white/50">
                    1,894 élèves (49.9%)
                  </div>
                </div>
              </div>

              <!-- Data Source Note -->
              <div class="mt-4 p-2 rounded-lg bg-blue-500/10 border border-blue-400/20">
                <div class="text-[10px] text-white/60 flex items-start gap-2">
                  <i class="fa-solid fa-database text-blue-400 mt-0.5"></i>
                  <div>
                    <div class="font-semibold text-white/80 mb-1">Source des données</div>
                    Données officielles de la Direction Provinciale - Province de Tarfaya
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      return;
    }

    // Default/Existing logic for other provinces
    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs — Éducation</div>
            <div class="panel-sub">Scolarisation et infrastructures</div>
          </div>
          <span class="badge-chip"><span class="badge-dot" style="background:#3b82f6;"></span> Éducation</span>
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Pop. Scolaire Estimée</div>
                  <div class="kpi-value">3 500</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-user-graduate"></i></div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Scolarisation Primaire</div>
                  <div class="kpi-value">98%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-school"></i></div>
              </div>
            </div>
          </div>
          <div class="kpi-grid mt-3">
             <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Collège</div>
                  <div class="kpi-value">85%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-book-open"></i></div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Lycée</div>
                  <div class="kpi-value">65%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-graduation-cap"></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    if (rightPanel) rightPanel.innerHTML = `
      <div class="panel-card text-white">
         <div class="panel-header">
          <div>
            <div class="panel-title">Infrastructures</div>
          </div>
        </div>
        <div class="panel-body">
           <div class="hint">
             La province dispose d'un réseau d'établissements couvrant les communes urbaines et rurales.
           </div>
        </div>
      </div>
    `;
    return;
  }

  if (sectorKey === "eau") {
    // Tarfaya specific - Water sector
    if (AppState.selectedProvince && isTarfayaProvince(AppState.selectedProvince)) {
      const eauData = AppState.provinceStats?.eau || {};
      const infrastructure = parseNumber(eauData["Infrastructure Production EP"]) || 0;
      const capacite = eauData["Capacité de production"] || "0 l/s";
      const branchements = parseNumber(eauData["Nombre de branchement EP"]) || 0;
      const raccordements = parseNumber(eauData["Nombre de raccordement aux réseaux publics"]) || 0;
      const tauxCouverture = eauData["Taux de couverture en assainissement"] || "0%";
      const tauxRendementProd = eauData["Taux de rendement infrastructure production EP"] || "0%";
      const tauxRendementDist = eauData["Taux de rendement infrastructure distribution EP"] || "0%";

      if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">💧 Infrastructure Eau</div>
            <div class="panel-sub">Production et Distribution</div>
          </div>
          <span class="badge-chip"><span class="badge-dot" style="background:#06b6d4;"></span> Province</span>
        </div>
        <div class="panel-body">
           <div class="kpi-grid">
              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Stations EP</div>
                    <div class="kpi-value">${infrastructure}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-industry"></i></div>
                </div>
                <div class="kpi-note">Stations de production</div>
              </div>
              
              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Capacité</div>
                    <div class="kpi-value" style="font-size: 18px;">${capacite}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-droplet"></i></div>
                </div>
                <div class="kpi-note">Production totale</div>
              </div>

              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Branchements</div>
                    <div class="kpi-value">${branchements.toLocaleString()}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-plug"></i></div>
                </div>
                <div class="kpi-note">Total branchements EP</div>
              </div>

              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Raccordements</div>
                    <div class="kpi-value">${raccordements.toLocaleString()}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-house-circle-check"></i></div>
                </div>
                <div class="kpi-note">Réseau public</div>
              </div>
           </div>
        </div>
      </div>`;

      if (rightPanel) rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">📊 Performance</div>
            <div class="panel-sub">Taux de couverture et rendement</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="space-y-4">
            <div class="p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(6, 182, 212, 0.3);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/70 text-sm">🏘️ Couverture Assainissement</span>
                <span class="text-2xl font-bold text-cyan-300">${tauxCouverture}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style="width: ${tauxCouverture}"></div>
              </div>
            </div>

            <div class="p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.3);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/70 text-sm">⚙️ Rendement Production</span>
                <span class="text-2xl font-bold text-green-300">${tauxRendementProd}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style="width: ${tauxRendementProd}"></div>
              </div>
            </div>

            <div class="p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.3);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/70 text-sm">🚰 Rendement Distribution</span>
                <span class="text-2xl font-bold text-blue-300">${tauxRendementDist}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style="width: ${tauxRendementDist}"></div>
              </div>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div class="text-xs text-white/60 mb-1">💡 Taux de connexion</div>
              <div class="text-lg font-bold text-white">
                ${branchements > 0 ? ((raccordements / branchements) * 100).toFixed(1) : 0}%
              </div>
              <div class="text-xs text-white/50 mt-1">
                ${raccordements.toLocaleString()} / ${branchements.toLocaleString()} branchements raccordés
              </div>
            </div>
          </div>
        </div>
      </div>`;
      return;
    }

    // Default
    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs — Eau</div>
            <div class="panel-sub">Accès et Ressources</div>
          </div>
          <span class="badge-chip"><span class="badge-dot" style="background:#06b6d4;"></span> Eau</span>
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Points d'eau</div>
                  <div class="kpi-value">40</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-faucet"></i></div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Accès Eau Potable</div>
                  <div class="kpi-value">92%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-hand-holding-droplet"></i></div>
              </div>
            </div>
          </div>
          <div class="mt-3 p-3 rounded-xl border border-white/10 bg-white/5">
            <div class="text-[11px] text-white/70 mb-1">Alimentation Rurale</div>
            <div class="text-white/90 text-sm">Forages et stations de dessalement côtières</div>
          </div>
        </div>
      </div>
    `;
    if (rightPanel) rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div><div class="panel-title">Réseaux</div></div>
        </div>
        <div class="panel-body">
           <div class="hint">
             Réseaux présents dans les centres communaux.
           </div>
        </div>
      </div>
    `;
    return;
  }

  if (sectorKey === "emploi") {
    // Tarfaya specific
    if (AppState.selectedProvince && isTarfayaProvince(AppState.selectedProvince)) {
      const d = TARFAYA_DATA.details.emploi.indicateurs;
      const dVul = TARFAYA_DATA.details.emploi.vulnerabilites || [];

      if (leftPanel) leftPanel.innerHTML = `
          <div class="panel-card text-white">
            <div class="panel-header">
              <div>
                <div class="panel-title">Indicateurs — Emploi</div>
                <div class="panel-sub">Activité et Chômage</div>
              </div>
              <span class="badge-chip"><span class="badge-dot" style="background:#f97316;"></span> Emploi</span>
            </div>
            <div class="panel-body">
              <div class="kpi-grid">
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Taux d'activité</div>
                      <div class="kpi-value">${d.taux_activite_estime}%</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-briefcase"></i></div>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Taux de chômage</div>
                      <div class="kpi-value">${d.taux_chomage_estime}%</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-user-clock"></i></div>
                  </div>
                </div>
              </div>
               <div class="kpi-grid mt-3">
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Chômage Jeunes</div>
                      <div class="kpi-value">${d.taux_chomage_jeunes_15_24_estime}%</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-child"></i></div>
                  </div>
                </div>
                <div class="kpi">
                  <div class="kpi-top">
                    <div>
                      <div class="kpi-label">Chômage Femmes</div>
                      <div class="kpi-value">${d.taux_chomage_femmes_estime}%</div>
                    </div>
                    <div class="kpi-ico"><i class="fa-solid fa-person-dress"></i></div>
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <div class="text-[11px] text-white/60 mb-2 uppercase font-bold tracking-wider">Secteurs Principaux</div>
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Pêche</span>
                  <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Énergies</span>
                  <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Fonction Publique</span>
                </div>
              </div>
            </div>
          </div>
        `;
      if (rightPanel) rightPanel.innerHTML = `
          <div class="panel-card text-white">
            <div class="panel-header">
               <div class="panel-title">Dynamique</div>
            </div>
            <div class="panel-body">
               <div class="hint mb-3">
                 ${d.commentaire_source}
               </div>
               ${dVul.length ? `
                <div class="rounded-xl border border-red-400/20 bg-red-500/10 p-3">
                     <div class="text-[11px] text-red-300 font-bold mb-1">Vulnérabilités</div>
                     <ul class="text-[10px] text-white/80 space-y-1 list-disc pl-3">
                        ${dVul.slice(0, 3).map(v => `<li>${v}</li>`).join("")}
                     </ul>
                </div>
               ` : ""}
            </div>
          </div>
        `;
      return;
    }

    // Default
    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs — Emploi</div>
            <div class="panel-sub">Activité et Chômage</div>
          </div>
          <span class="badge-chip"><span class="badge-dot" style="background:#f97316;"></span> Emploi</span>
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Taux d'activité</div>
                  <div class="kpi-value">43%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-briefcase"></i></div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Taux de chômage</div>
                  <div class="kpi-value">14%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-user-clock"></i></div>
              </div>
            </div>
          </div>
          <div class="mt-3">
            <div class="text-[11px] text-white/60 mb-2 uppercase font-bold tracking-wider">Secteurs Principaux</div>
            <div class="flex flex-wrap gap-2">
              <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Pêche</span>
              <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Services portuaires</span>
              <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Admin. publique</span>
              <span class="px-2 py-1 rounded bg-white/10 text-xs border border-white/10">Énergies renouv.</span>
            </div>
          </div>
        </div>
      </div>
    `;
    if (rightPanel) rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
           <div class="panel-title">Dynamique</div>
        </div>
        <div class="panel-body">
           <div class="hint">
             Dépendance importante aux secteurs maritime et energétique.
           </div>
        </div>
      </div>
    `;
    return;
  }

  renderStatsPrefecture();
}

// Helper function to get commune education data from DATA_JSON
function getCommuneEducationData(communeName) {
  if (!DATA_JSON || !DATA_JSON.tables) return null;

  const eduTable = DATA_JSON.tables.find(t => t.nom === "EDUCATION");
  if (!eduTable) return null;

  // Normalize the commune name for better matching
  const normalizedSearch = communeName.toLowerCase()
    .replace(/commune\s+(de\s+|d')?/gi, '')
    .trim();

  const communeSection = eduTable.sections.find(s => {
    const name = s.donnees?.["Collectivités territoriales"] || "";
    const normalizedName = name.toLowerCase();

    // IMPORTANT: Exclude province rows - only match commune rows
    if (normalizedName.includes('province')) {
      return false;
    }

    // Must contain "commune" to be a commune row
    if (!normalizedName.includes('commune')) {
      return false;
    }

    // Now check if it matches our search
    const cleanName = normalizedName
      .replace(/commune\s+(de\s+|d')?/gi, '')
      .trim();

    // Try exact match first, then partial match
    return cleanName === normalizedSearch ||
      cleanName.includes(normalizedSearch) ||
      normalizedSearch.includes(cleanName);
  });

  console.log("Matched commune section:", communeSection?.donnees?.["Collectivités territoriales"]);
  return communeSection?.donnees || null;
}

const TARFAYA_POINT = turf.point([-12.92611, 27.93944]);

const TARFAYA_DATA = {
  province: "Tarfaya",
  resume: {
    communes: 5,
    hopitaux_total: 1,
    centres_sante_primaires_essp: 7,
    ambulances: 10,
    reseaux_eau_ou_stations: 2,
    ecoles_et_institutions_estimees: 25,
    facultes_universitaires: 0
  },
  details: {
    sante: {
      hopitaux: [{
        nom: "Hôpital provincial de Tarfaya",
        commune: "Tarfaya",
        type: "hopital_provincial",
        capacite_lits: 70,
        personnel: { medecins: 13, infirmiers: 60, autres: 29 },
        population_cible: 16000,
        lat: 27.942, lng: -12.922 // Approximate coord
      }],
      centres_sante_primaires_essp: [{
        commune: "Tah",
        nom: "Centre de santé rural Tah",
        niveau: "ESSP 1er niveau",
        personnel: { medecins: 0, infirmiers: 4 },
        population_cible: 900,
        lat: 28.166, lng: -12.75 // Approximate
      }],
      synthese: {
        essp_total_estime: 7,
        commentaire: "Hôpital provincial + centres de santé ruraux dont Tah."
      }
    },
    eau: {
      infrastructures: [{
        nom: "Station de dessalement d’Amgrew",
        commune: "Tarfaya",
        type: "dessalement_monobloc",
        debit_eau_mer_m3_j: 1037,
        production_eau_potable_m3_j: 432,
        budget_MAD: 26.1,
        lat: 27.910, lng: -12.950 // Approximate coastal
      }, {
        nom: "Future grande station de dessalement Tarfaya",
        commune: "Tarfaya",
        type: "dessalement_haute_capacite",
        capacite_traitement_m3_j: 22500,
        lat: 27.960, lng: -12.910 // Approximate
      }],
      reseaux: {
        description: "Alimentation en eau potable assurée pour la ville de Tarfaya et le village de pêche Amgrew via dessalement."
      }
    },
    education: {
      synthese: {
        ecoles_primaires_estimees: 15,
        colleges_estimes: 5,
        lycees_estimes: 3,
        facultes_universitaires: 0,
        commentaire: "Valeurs estimées pour un dashboard."
      },
      exemples_ecoles: [{
        commune: "Tarfaya",
        nom: "École secondaire Alihelip",
        type: "secondaire",
        lat: 27.935, lng: -12.925
      }]
    },
    emploi: {
      indicateurs: {
        taux_activite_estime: 45,
        taux_emploi_estime: 38,
        taux_chomage_estime: 14.3,
        taux_chomage_jeunes_15_24_estime: 35,
        taux_chomage_femmes_estime: 22,
        commentaire_source: "Chômage rural ~14.3%."
      },
      secteurs_principaux: [
        { nom: "Peche_maritime", part_estimee: 40, lat: 27.930, lng: -12.935, description: "Pêche hauturière et côtière." },
        { nom: "Energies_renouvelables", part_estimee: 15, lat: 27.800, lng: -12.800, description: "Parc éolien de Tarfaya." },
        { nom: "Services_publics", part_estimee: 20, lat: 27.940, lng: -12.922, description: "Fonction publique, éducation, santé." },
      ],
      projets_structurants: [{
        nom: "Parc_eolien_de_Tarfaya",
        type: "energie_renouvelable",
        investissement_MAD: 5000000000,
        capacite_MW: 301,
        emplois_construction: 600,
        emplois_exploitation: 60,
        description: "Parc éolien terrestre de 131 turbines.",
        lat: 27.850, lng: -12.850 // Approximate wind farm area
      }]
    }
  }
};

function isSoussMassaRegion(feature) {
  const n = normalizeName(featureName(feature));
  if (n.includes("laayoune") || n.includes("sakia") || n.includes("boujdour")) return true;
  try { return turf.booleanPointInPolygon(TARFAYA_POINT, feature); } catch (e) { return false; }
}

function isTarfayaProvince(feature) {
  const n = normalizeName(featureName(feature));
  if (n.includes("tarfaya")) return true;
  try { return turf.booleanPointInPolygon(TARFAYA_POINT, feature); } catch (e) { return false; }
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed: " + url);
  return res.json();
}

const AppState = {
  level: "country",
  selectedRegion: null,
  selectedProvince: null,
  selectedCommune: null,
  selectedSector: null,
  regionsFC: null,
  provincesFC: null,
  communesFC: null,
  moroccoBoundary: null,
  projects: [],
  santePoints: [],
  santeFilter: "all",
  diagnosticMode: false,
  importedData: {}
};

function generateRandomProjectsForProvince(provinceFeature, count = 80) {
  const bbox = turf.bbox(provinceFeature);
  const statuses = ["En Étude", "En Chantier", "Livré", "Arrêté"];
  const owners = ["Agence Urbaine", "Conseil Régional", "Privé", "INDH"];
  const projects = [];
  let guard = 0;

  while (projects.length < count && guard < 7000) {
    guard++;
    const sector = pick(Object.keys(SECTOR_CONFIG));
    const lng = rand(bbox[0], bbox[2]);
    const lat = rand(bbox[1], bbox[3]);
    const pt = turf.point([lng, lat]);
    if (!turf.booleanPointInPolygon(pt, provinceFeature)) continue;

    const title = "Projet – " + randInt(10, 99);

    projects.push({
      id: projects.length + 1,
      title,
      nom: title,
      sector,
      lat, lng,
      status: pick(statuses),
      progress: randInt(0, 100),
      budgetMAD: randInt(5, 50) * 100000,
      owner: pick(owners),
      img: "assets/projet.jpg",
      capacite_accueil: randInt(50, 500),
      nb_medecins: "-",
      nb_infirmiers: "-",
      constat: pick([
        "Avancement satisfaisant.",
        "Risque de retard lié aux contraintes administratives.",
        "Besoin de suivi technique renforcé."
      ])
    });
  }
  // Use supplied strict data if available for Tarfaya
  if (isTarfayaProvince(provinceFeature)) {
    return [
      {
        id: "proj_hopital_tarfaya",
        title: "Mise à niveau de l’hôpital provincial de Tarfaya",
        nom: "Extension et équipement de l’hôpital provincial",
        sector: "sante",
        lat: 27.937,
        lng: -12.927,
        status: "En Chantier",
        progress: 75,
        budgetMAD: 60000000,
        owner: "Ministère de la Santé",
        img: "assets/projet.jpg",
        capacite_accueil: 70,
        nb_medecins: 13,
        nb_infirmiers: 60,
        constat: "Projet structurant visant à rapprocher les soins hospitaliers."
      }
    ];
  }

  return projects;
}

function generateRandomSantePointsForProvince(provinceFeature, esspCount = 35, ambCount = 10) {
  const bbox = turf.bbox(provinceFeature);
  const esspTypes = ["Dispensaire", "CSR 1", "CSR 2", "CSU 1", "UMP"];
  const pts = [];
  let guard = 0;

  while (pts.filter(x => x.kind === "essp").length < esspCount && guard < 15000) {
    guard++;
    const lng = rand(bbox[0], bbox[2]);
    const lat = rand(bbox[1], bbox[3]);
    const pt = turf.point([lng, lat]);
    if (!turf.booleanPointInPolygon(pt, provinceFeature)) continue;

    const subtype = pick(esspTypes);
    const name = `ESSP (${subtype}) – ${randInt(1, 50)}`;

    pts.push({
      id: pts.length + 1,
      kind: "essp",
      subtype,
      title: name,
      nom: name,
      capacite_accueil: randInt(20, 250),
      nb_medecins: randInt(1, 12),
      nb_infirmiers: randInt(2, 30),
      constat: pick([
        "Besoin de renforcement en personnel.",
        "Couverture correcte, équipements à améliorer.",
        "Surcharge aux heures de pointe."
      ]),
      img: "assets/image hopital hagounia.png",
      lat, lng
    });
  }

  guard = 0;
  while (pts.filter(x => x.kind === "ambulance").length < ambCount && guard < 15000) {
    guard++;
    const lng = rand(bbox[0], bbox[2]);
    const lat = rand(bbox[1], bbox[3]);
    const pt = turf.point([lng, lat]);
    if (!turf.booleanPointInPolygon(pt, provinceFeature)) continue;

    const name = `Ambulance – ${randInt(1, 50)}`;

    pts.push({
      id: pts.length + 1,
      kind: "ambulance",
      subtype: null,
      title: name,
      nom: name,
      capacite_accueil: "-",
      nb_medecins: randInt(0, 2),
      nb_infirmiers: randInt(0, 4),
      constat: pick([
        "Temps d’intervention à réduire.",
        "Besoin de maintenance régulière.",
        "Couverture acceptable."
      ]),
      img: "assets/ambulance.jpg",
      lat, lng
    });
  }

  // Use supplied strict data if available, otherwise fallback/mix
  const STRICT_SANTE_POINTS = [
    {
      id: "essp_tarfaya_hopital",
      kind: "essp",
      subtype: "UMP", // mapped to UMP for icon or closest match
      title: "Hôpital provincial de Tarfaya",
      nom: "Hôpital provincial de Tarfaya",
      capacite_accueil: 70,
      nb_medecins: 13,
      nb_infirmiers: 60,
      constat: "Hôpital récent de niveau provincial, 70 lits.",
      img: "assets/image hopital hagounia.png",
      lat: 27.937,
      lng: -12.927
    },
    {
      id: "essp_tah_csr1",
      kind: "essp",
      subtype: "CSR 1",
      title: "Centre de santé rural Tah",
      nom: "Centre de santé rural de premier niveau Tah",
      capacite_accueil: 4,
      nb_medecins: 0,
      nb_infirmiers: 4,
      constat: "Centre rural réhabilité, dessert environ 900 habitants.",
      img: "assets/image hopital hagounia.png",
      lat: 28.166,
      lng: -12.75
    },
    {
      id: "ambulance_tarfaya_1",
      kind: "ambulance",
      subtype: null,
      title: "Parc ambulances Tarfaya",
      nom: "Ambulances provinciales Tarfaya",
      capacite_accueil: "-",
      nb_medecins: 0,
      nb_infirmiers: 4,
      constat: "Flotte d’ambulances assurant la couverture d’urgence.",
      img: "assets/ambulance.jpg",
      lat: 27.937,
      lng: -12.927
    }
  ];

  // Tarfaya specific data
  if (isTarfayaProvince(provinceFeature)) {
    const d = TARFAYA_DATA.details.sante;
    const all = [];
    const bbox = turf.bbox(provinceFeature);

    // Hospitals
    d.hopitaux.forEach(h => {
      all.push({
        id: "hop_" + Math.random().toString(36).substr(2, 9),
        kind: "essp",
        subtype: "UMP",
        title: h.nom,
        nom: h.nom,
        capacite_accueil: h.capacite_lits,
        nb_medecins: h.personnel.medecins,
        nb_infirmiers: h.personnel.infirmiers,
        constat: "Hôpital provincial.",
        img: "assets/image hopital hagounia.png",
        lat: h.lat, lng: h.lng
      });
    });

    // Defined Centers
    d.centres_sante_primaires_essp.forEach(c => {
      all.push({
        id: "csr_" + Math.random().toString(36).substr(2, 9),
        kind: "essp",
        subtype: c.niveau.includes("1") ? "CSR 1" : "CSR 2",
        title: c.nom,
        nom: c.nom,
        capacite_accueil: "-",
        nb_medecins: c.personnel.medecins,
        nb_infirmiers: c.personnel.infirmiers,
        constat: "Centre de santé rural.",
        img: "assets/image hopital hagounia.png",
        lat: c.lat, lng: c.lng
      });
    });

    // Generate Missing Centers (Total 7 - defined ones)
    // defined ones: d.centres_sante_primaires_essp.length
    const missing = 7 - d.centres_sante_primaires_essp.length;
    for (let i = 0; i < missing; i++) {
      let lat, lng, pt;
      let guard = 0;
      while (guard < 100) {
        lng = rand(bbox[0], bbox[2]);
        lat = rand(bbox[1], bbox[3]);
        pt = turf.point([lng, lat]);
        if (turf.booleanPointInPolygon(pt, provinceFeature)) break;
        guard++;
      }

      all.push({
        id: "csr_rnd_" + i,
        kind: "essp",
        subtype: "CSR 1",
        title: "Centre de Santé Rural " + (i + 1),
        nom: "Centre de Santé Rural (Est.)",
        capacite_accueil: "-",
        nb_medecins: 1,
        nb_infirmiers: 2,
        constat: "Structure de proximité.",
        img: "assets/image hopital hagounia.png",
        lat, lng
      });
    }

    // Ambulances (random distribution in province to cover territory)
    for (let i = 0; i < TARFAYA_DATA.resume.ambulances; i++) {
      let lat, lng, pt;
      let guard = 0;
      while (guard < 100) {
        lng = rand(bbox[0], bbox[2]);
        lat = rand(bbox[1], bbox[3]);
        pt = turf.point([lng, lat]);
        if (turf.booleanPointInPolygon(pt, provinceFeature)) break;
        guard++;
      }

      all.push({
        id: "amb_" + i,
        kind: "ambulance",
        title: "Ambulance " + (i + 1),
        nom: "Ambulance Prov.",
        capacite_accueil: "-",
        nb_medecins: 0,
        nb_infirmiers: 2,
        constat: "Service d'urgence mobile.",
        img: "assets/ambulance.jpg",
        lat, lng
      });
    }

    return all;
  }

  // Fallback to random
  return pts;
}

function generateSectorPoints(sector, provinceFeature) {
  if (!isTarfayaProvince(provinceFeature)) return [];

  const bbox = turf.bbox(provinceFeature);
  const pts = [];

  if (sector === "eau") {
    const d = TARFAYA_DATA.details.eau;
    d.infrastructures.forEach(inf => {
      pts.push({
        id: "eau_" + Math.random(),
        sector: "eau",
        type: inf.type,
        title: inf.nom,
        nom: inf.nom,
        desc: `Capacité: ${inf.capacite_traitement_m3_j || inf.production_eau_potable_m3_j || "?"} m3/j`,
        img: "assets/projet.jpg",
        lat: inf.lat, lng: inf.lng
      });
    });
    return pts;
  }

  if (sector === "education") {
    const d = TARFAYA_DATA.details.education;
    // Specific examples
    d.exemples_ecoles.forEach(e => {
      pts.push({
        id: "edu_ex_" + Math.random(),
        sector: "education",
        type: e.type,
        title: e.nom,
        nom: e.nom,
        desc: "Établissement scolaire.",
        img: "assets/projet.jpg",
        lat: e.lat, lng: e.lng
      });
    });

    // Estimated remaining
    const total = d.synthese.ecoles_primaires_estimees + d.synthese.colleges_estimes + d.synthese.lycees_estimes;
    const remainder = total - d.exemples_ecoles.length;

    for (let i = 0; i < remainder; i++) {
      const lng = rand(bbox[0], bbox[2]);
      const lat = rand(bbox[1], bbox[3]);
      if (!turf.booleanPointInPolygon(turf.point([lng, lat]), provinceFeature)) continue;
      pts.push({
        id: "edu_rnd_" + i,
        sector: "education",
        type: "ecole",
        title: "École " + (i + 1),
        nom: "École Primaire/Collège",
        desc: "Établissement public.",
        img: "assets/projet.jpg",
        lat, lng
      });
    }
    return pts;
  }

  if (sector === "emploi") {
    const d = TARFAYA_DATA.details.emploi;

    // Main sectors markers
    d.secteurs_principaux.forEach(s => {
      pts.push({
        id: "emp_sec_" + Math.random(),
        sector: "emploi",
        type: s.nom,
        title: s.description.split(" ")[0] + "...",
        nom: s.description,
        desc: `Part estimée: ${s.part_estimee}%`,
        img: "assets/projet.jpg",
        lat: s.lat, lng: s.lng
      });
    });

    // Structuring projects
    d.projets_structurants.forEach(p => {
      pts.push({
        id: "emp_proj_" + Math.random(),
        sector: "emploi",
        type: p.type,
        title: p.nom,
        nom: p.nom,
        desc: `Investissement: ${fmtInt(p.investissement_MAD)} MAD`,
        img: "assets/projet.jpg",
        lat: p.lat, lng: p.lng
      });
    });

    return pts;
  }

  return [];
}

let map;
let moroccoMaskLayer = null;
let moroccoFillLayer = null;
let moroccoBorderLayer = null;
let adminLayer = null;
let markersLayer = null;
let focusMaskLayer = null;

function clearAdmin() { if (adminLayer) adminLayer.remove(); adminLayer = null; }
function clearMarkers() { if (markersLayer) markersLayer.clearLayers(); }
function clearFocusMask() { if (focusMaskLayer) { map.removeLayer(focusMaskLayer); focusMaskLayer = null; } }

function ringLngLatToLatLng(ring) { return ring.map(([lng, lat]) => [lat, lng]); }

function outerRings(geom) {
  const rings = [];
  if (!geom) return rings;
  if (geom.type === "Polygon") {
    if (geom.coordinates?.[0]) rings.push(ringLngLatToLatLng(geom.coordinates[0]));
  } else if (geom.type === "MultiPolygon") {
    (geom.coordinates || []).forEach(poly => { if (poly?.[0]) rings.push(ringLngLatToLatLng(poly[0])); });
  }
  return rings;
}

function setFocusMask(featureOrGeoJSON) {
  clearFocusMask();
  if (!map.getPane("focusMaskPane")) map.createPane("focusMaskPane");
  map.getPane("focusMaskPane").style.zIndex = 230;
  map.getPane("focusMaskPane").style.pointerEvents = "none";

  const world = [[-90, -360], [-90, 360], [90, 360], [90, -360], [-90, -360]];
  const g = featureOrGeoJSON?.type === "Feature" ? featureOrGeoJSON.geometry : featureOrGeoJSON;
  const rings = outerRings(g);
  if (!rings.length) return;

  focusMaskLayer = L.polygon([world, ...rings], {
    pane: "focusMaskPane",
    stroke: false,
    fillColor: "#0f172a",
    fillOpacity: 1,
    fillRule: "evenodd",
    interactive: false
  }).addTo(map);
}

function addMoroccoMask(boundaryGeoJSON) {
  if (moroccoMaskLayer) map.removeLayer(moroccoMaskLayer);
  if (moroccoFillLayer) map.removeLayer(moroccoFillLayer);
  if (moroccoBorderLayer) map.removeLayer(moroccoBorderLayer);

  if (!map.getPane("maskPane")) map.createPane("maskPane");
  if (!map.getPane("fillPane")) map.createPane("fillPane");
  if (!map.getPane("borderPane")) map.createPane("borderPane");

  map.getPane("maskPane").style.zIndex = 200;
  map.getPane("fillPane").style.zIndex = 210;
  map.getPane("borderPane").style.zIndex = 220;

  const rings = [];
  if (boundaryGeoJSON.type === "FeatureCollection") boundaryGeoJSON.features.forEach(f => rings.push(...outerRings(f.geometry)));
  else if (boundaryGeoJSON.type === "Feature") rings.push(...outerRings(boundaryGeoJSON.geometry));
  else rings.push(...outerRings(boundaryGeoJSON));

  const world = [[-90, -360], [-90, 360], [90, 360], [90, -360], [-90, -360]];

  moroccoMaskLayer = L.polygon([world, ...rings], {
    pane: "maskPane", stroke: false, fillColor: "#0f172a", fillOpacity: 1,
    fillRule: "evenodd", interactive: false
  }).addTo(map);

  moroccoFillLayer = L.geoJSON(boundaryGeoJSON, {
    pane: "fillPane",
    style: { color: "transparent", weight: 0, fillColor: "#f8fafc", fillOpacity: 0.92 },
    interactive: false
  }).addTo(map);

  moroccoBorderLayer = L.geoJSON(boundaryGeoJSON, {
    pane: "borderPane",
    style: { weight: 1.5, color: "#94a3b8", fillOpacity: 0 },
    interactive: false
  }).addTo(map);

  map.fitBounds(moroccoBorderLayer.getBounds().pad(0.05));
}

function featuresInside(parentFeature, childrenFC) {
  const out = [];
  for (const f of (childrenFC.features || [])) {
    const c = turf.centroid(f);
    if (turf.booleanPointInPolygon(c, parentFeature)) out.push(f);
  }
  return out;
}

function resetSectorButtons() {
  document.querySelectorAll(".sector-btn").forEach(b => b.classList.remove("active"));
}

function renderSanteMarkers() {
  clearMarkers();
  if (!AppState.selectedProvince) return;

  let filtered = AppState.santePoints;
  const f = AppState.santeFilter || "all";

  console.log(`[renderSanteMarkers] Total health points: ${AppState.santePoints?.length || 0}`);
  console.log(`[renderSanteMarkers] Filter: ${f}`);
  console.log(`[renderSanteMarkers] Selected commune: ${AppState.selectedCommune ? 'Yes' : 'No (Province level)'}`);

  if (f === "all") { }
  else if (f === "ambulance") filtered = filtered.filter(x => x.kind === "ambulance");
  else filtered = filtered.filter(x => x.kind === "essp" && x.subtype === f);

  if (AppState.selectedCommune) {
    filtered = filtered.filter(p => {
      try { return turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), AppState.selectedCommune); }
      catch (e) { return false; }
    });
    console.log(`[renderSanteMarkers] Filtered to commune: ${filtered.length} markers`);
  } else {
    console.log(`[renderSanteMarkers] Showing all province markers: ${filtered.length} markers`);
  }

  filtered.forEach(p => {
    let conf;
    if (p.kind === "ambulance") conf = SANTE_CONFIG.ambulance;
    else conf = SANTE_CONFIG.essp[p.subtype] || { label: "ESSP", hex: "#22c55e", icon: "fa-house-medical" };

    const iconHtml = `
      <div class="marker-pin" style="background-color:${conf.hex}">
        <i class="fa-solid ${conf.icon} text-sm"></i>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml, className: "custom-div-icon",
      iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -38]
    });

    const m = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(markersLayer);
    m.bindPopup(fichePopupHTML(p), { maxWidth: 380 });
  });

  console.log(`[renderSanteMarkers] Rendered ${filtered.length} markers on map`);
}

// Generate education markers based on data.json counts
function generateEducationMarkers(provinceFeature, communeFeature = null) {
  const markers = [];

  console.log(`[generateEducationMarkers] Province: ${provinceFeature ? 'Yes' : 'No'}, Commune: ${communeFeature ? 'Yes' : 'No (All communes)'}`);

  // If at province level (no commune selected), generate markers for ALL communes
  if (!communeFeature && AppState.communesFC) {
    console.log(`[generateEducationMarkers] Generating markers for all communes in province`);

    AppState.communesFC.features.forEach(commune => {
      const communeMarkers = generateEducationMarkersForCommune(commune);
      markers.push(...communeMarkers);
    });

    console.log(`[generateEducationMarkers] Generated ${markers.length} total education markers for all communes`);
    return markers;
  }

  // If commune is selected, generate markers only for that commune
  if (communeFeature) {
    const communeMarkers = generateEducationMarkersForCommune(communeFeature);
    console.log(`[generateEducationMarkers] Generated ${communeMarkers.length} education markers for selected commune`);
    return communeMarkers;
  }

  return markers;
}

// Helper function to generate education markers for a single commune
function generateEducationMarkersForCommune(communeFeature) {
  const markers = [];
  const communeName = featureName(communeFeature);

  let cleanName = communeName;
  if (cleanName.toLowerCase().startsWith("commune de ")) {
    cleanName = cleanName.substring(11);
  } else if (cleanName.toLowerCase().startsWith("commune d'")) {
    cleanName = cleanName.substring(10);
  }

  const nKey = normalizeName(cleanName);
  const eduData = AppState.importedData?.[nKey]?.edu;

  console.log(`[generateEducationMarkersForCommune] Commune: ${communeName}, nKey: ${nKey}`);
  console.log(`[generateEducationMarkersForCommune] eduData:`, eduData);

  if (!eduData) {
    console.warn(`[generateEducationMarkersForCommune] No education data found for ${communeName}`);
    return markers;
  }

  // Generate markers for each education level
  // The data structure is: edu.prescolaire.etabs, edu.primaire.etabs, etc.
  const levels = [
    { key: "prescolaire", type: "prescolaire" },
    { key: "primaire", type: "primaire" },
    { key: "college", type: "college" },
    { key: "lycee", type: "lycee" }
  ];

  levels.forEach(level => {
    const count = eduData[level.key]?.etabs || 0;
    console.log(`[generateEducationMarkersForCommune] ${level.type}: ${count} schools`);

    for (let i = 0; i < count; i++) {
      const pt = randomPointInPoly(communeFeature);
      if (pt) {
        const conf = EDUCATION_CONFIG[level.type];
        const marker = {
          id: `edu_${level.type}_${nKey}_${i}`,
          sector: "education",
          type: level.type,
          title: `${conf.label} - ${communeName}`,
          commune: communeName,
          icon: conf.icon,
          hex: conf.hex,
          lat: pt.geometry.coordinates[1],
          lng: pt.geometry.coordinates[0],
          desc: `Établissement ${conf.label} à ${communeName}`,
          kind: "education",
          filles: eduData[level.key]?.filles || 0,
          garcons: eduData[level.key]?.garcons || 0
        };
        markers.push(marker);
        console.log(`[generateEducationMarkersForCommune] Created marker:`, marker);
      } else {
        console.warn(`[generateEducationMarkersForCommune] Failed to generate point for ${level.type} #${i}`);
      }
    }
  });

  console.log(`[generateEducationMarkersForCommune] Total markers created for ${communeName}: ${markers.length}`);
  return markers;
}

// Generate water infrastructure markers based on data.js
function generateWaterMarkers(provinceFeature, communeFeature = null) {
  const markers = [];

  console.log(`[generateWaterMarkers] Province: ${provinceFeature ? 'Yes' : 'No'}, Commune: ${communeFeature ? 'Yes' : 'No (All communes)'}`);

  // If at province level (no commune selected), generate markers for ALL communes
  if (!communeFeature && AppState.communesFC) {
    console.log(`[generateWaterMarkers] Generating markers for all communes in province`);

    AppState.communesFC.features.forEach(commune => {
      const communeMarkers = generateWaterMarkersForCommune(commune);
      markers.push(...communeMarkers);
    });

    console.log(`[generateWaterMarkers] Generated ${markers.length} total water markers for all communes`);
    return markers;
  }

  // If commune is selected, generate markers only for that commune
  if (communeFeature) {
    const communeMarkers = generateWaterMarkersForCommune(communeFeature);
    console.log(`[generateWaterMarkers] Generated ${communeMarkers.length} water markers for selected commune`);
    return communeMarkers;
  }

  return markers;
}

// Helper function to generate water markers for a single commune
function generateWaterMarkersForCommune(communeFeature) {
  const markers = [];
  const communeName = featureName(communeFeature);

  let cleanName = communeName;
  if (cleanName.toLowerCase().startsWith("commune de ")) {
    cleanName = cleanName.substring(11);
  } else if (cleanName.toLowerCase().startsWith("commune d'")) {
    cleanName = cleanName.substring(10);
  }

  const nKey = normalizeName(cleanName);
  const eauData = AppState.importedData?.[nKey]?.eau;

  console.log(`[generateWaterMarkersForCommune] Commune: ${communeName}, nKey: ${nKey}`);
  console.log(`[generateWaterMarkersForCommune] eauData:`, eauData);

  if (!eauData) {
    console.warn(`[generateWaterMarkersForCommune] No water data found for ${communeName}`);
    return markers;
  }

  const infrastructureCount = parseNumber(eauData["Infrastructure Production EP"]) || 0;
  const capacite = eauData["Capacité de production"] || "0 l/s";
  const branchements = parseNumber(eauData["Nombre de branchement EP"]) || 0;
  const raccordements = parseNumber(eauData["Nombre de raccordement aux réseaux publics"]) || 0;
  const tauxCouverture = eauData["Taux de couverture en assainissement"] || "0%";

  console.log(`[generateWaterMarkersForCommune] ${infrastructureCount} water stations`);

  // Map commune names to their image files
  const imageMap = {
    'tarfaya': [
      'assets/Station  de dessalement d\'eau/Station  de dessalement d\'eau tarafaya 1.png',
      'assets/Station  de dessalement d\'eau/Station  de dessalement d\'eau tarafaya 2.png',
      'assets/Station  de dessalement d\'eau/Station  de dessalement d\'eau tarafaya 3.png'
    ],
    'akhfennir': ['assets/Station  de dessalement d\'eau/Station  de dessalement d\'eau AKHFENIR.png'],
    'tah': ['assets/Station  de dessalement d\'eau/Station  de dessalement d\'eau tah.png'],
    'daoura': ['assets/Station  de dessalement d\'eau/Station  de dessalement d\'eau daoura.png'],
    'elhagounia': [] // No infrastructure
  };

  const images = imageMap[nKey] || [];

  // Generate markers for water infrastructure
  for (let i = 0; i < infrastructureCount; i++) {
    const pt = randomPointInPoly(communeFeature);
    if (pt) {
      const marker = {
        id: `eau_${nKey}_${i}`,
        sector: "eau",
        type: "dessalement",
        title: `Station de Dessalement - ${communeName}`,
        commune: communeName,
        icon: "fa-faucet-drip",
        hex: "#06b6d4",
        lat: pt.geometry.coordinates[1],
        lng: pt.geometry.coordinates[0],
        desc: `Station de dessalement d'eau à ${communeName}`,
        kind: "eau",
        img: images[i] || images[0] || "assets/fiche-default.jpg",
        capacite: capacite,
        branchements: branchements,
        raccordements: raccordements,
        tauxCouverture: tauxCouverture
      };
      markers.push(marker);
      console.log(`[generateWaterMarkersForCommune] Created water marker:`, marker);
    } else {
      console.warn(`[generateWaterMarkersForCommune] Failed to generate point for station #${i}`);
    }
  }

  console.log(`[generateWaterMarkersForCommune] Total markers created for ${communeName}: ${markers.length}`);
  return markers;
}

// Generate employment markers based on data.js
function generateEmploymentMarkers(provinceFeature, communeFeature = null) {
  const markers = [];

  console.log(`[generateEmploymentMarkers] Province: ${provinceFeature ? 'Yes' : 'No'}, Commune: ${communeFeature ? 'Yes' : 'No (All communes)'}`);

  // If at province level (no commune selected), generate markers for ALL communes
  if (!communeFeature && AppState.communesFC) {
    console.log(`[generateEmploymentMarkers] Generating markers for all communes in province`);

    AppState.communesFC.features.forEach(commune => {
      const communeMarkers = generateEmploymentMarkersForCommune(commune);
      markers.push(...communeMarkers);
    });

    console.log(`[generateEmploymentMarkers] Generated ${markers.length} total employment markers for all communes`);
    return markers;
  }

  // If commune is selected, generate markers only for that commune
  if (communeFeature) {
    const communeMarkers = generateEmploymentMarkersForCommune(communeFeature);
    console.log(`[generateEmploymentMarkers] Generated ${communeMarkers.length} employment markers for selected commune`);
    return communeMarkers;
  }

  return markers;
}

// Helper function to generate employment markers for a single commune
function generateEmploymentMarkersForCommune(communeFeature) {
  const markers = [];
  const communeName = featureName(communeFeature);

  let cleanName = communeName;
  if (cleanName.toLowerCase().startsWith("commune de ")) {
    cleanName = cleanName.substring(11);
  } else if (cleanName.toLowerCase().startsWith("commune d'")) {
    cleanName = cleanName.substring(10);
  }

  const nKey = normalizeName(cleanName);
  const empData = AppState.importedData?.[nKey]?.emp;

  console.log(`[generateEmploymentMarkersForCommune] Commune: ${communeName}, nKey: ${nKey}`);
  console.log(`[generateEmploymentMarkersForCommune] empData:`, empData);

  if (!empData) {
    console.warn(`[generateEmploymentMarkersForCommune] No employment data found for ${communeName}`);
    return markers;
  }

  const tauxActivite = empData.taux_activite || 0;
  const tauxChomage = empData.taux_chomage || 0;
  const popActive = empData.pop_active || 0;

  // Generate one employment center marker per commune
  const pt = randomPointInPoly(communeFeature);
  if (pt) {
    const marker = {
      id: `emploi_${nKey}`,
      sector: "emploi",
      type: "centre_emploi",
      title: `Centre Emploi - ${communeName}`,
      commune: communeName,
      icon: "fa-briefcase",
      hex: "#f97316",
      lat: pt.geometry.coordinates[1],
      lng: pt.geometry.coordinates[0],
      desc: `Centre d'emploi et de formation à ${communeName}`,
      kind: "emploi",
      tauxActivite: tauxActivite,
      tauxChomage: tauxChomage,
      popActive: popActive
    };
    markers.push(marker);
    console.log(`[generateEmploymentMarkersForCommune] Created employment marker:`, marker);
  } else {
    console.warn(`[generateEmploymentMarkersForCommune] Failed to generate point for employment center`);
  }

  console.log(`[generateEmploymentMarkersForCommune] Total markers created for ${communeName}: ${markers.length}`);
  return markers;
}

// Generate sector-specific points (education, eau, emploi)
function generateSectorPoints(sector, provinceFeature) {
  if (sector === "education") {
    return generateEducationMarkers(provinceFeature, AppState.selectedCommune);
  }
  if (sector === "eau") {
    return generateWaterMarkers(provinceFeature, AppState.selectedCommune);
  }
  if (sector === "emploi") {
    return generateEmploymentMarkers(provinceFeature, AppState.selectedCommune);
  }
  // Return empty array for other sectors (they use different generation methods)
  return [];
}

function renderProjectsMarkers() {
  if (AppState.selectedSector === "sante") return renderSanteMarkers();

  clearMarkers();
  if (!AppState.selectedSector || !AppState.selectedProvince) return;

  let filtered = [];

  console.log(`[renderProjectsMarkers] Sector: ${AppState.selectedSector}, Province: ${AppState.selectedProvince ? 'Yes' : 'No'}`);

  // Use generated points for Tarfaya special sectors
  if (isTarfayaProvince(AppState.selectedProvince) && ["eau", "education", "emploi"].includes(AppState.selectedSector)) {
    filtered = generateSectorPoints(AppState.selectedSector, AppState.selectedProvince);
    console.log(`[renderProjectsMarkers] Generated ${filtered.length} markers for ${AppState.selectedSector}`);
  } else {
    filtered = AppState.projects.filter(p => p.sector === AppState.selectedSector);
  }

  if (AppState.selectedCommune) {
    const beforeFilter = filtered.length;
    filtered = filtered.filter(p => {
      try { return turf.booleanPointInPolygon(turf.point([p.lng, p.lat]), AppState.selectedCommune); }
      catch (e) { return false; }
    });
    console.log(`[renderProjectsMarkers] Filtered from ${beforeFilter} to ${filtered.length} markers for commune`);
  } else {
    console.log(`[renderProjectsMarkers] No commune selected, showing all ${filtered.length} markers`);
  }

  const sectorConf = SECTOR_CONFIG[AppState.selectedSector];

  filtered.forEach(p => {
    let conf = sectorConf;
    // Granular config overrides
    if (AppState.selectedSector === "emploi" && EMPLOI_CONFIG[p.type]) conf = EMPLOI_CONFIG[p.type];
    if (AppState.selectedSector === "eau" && EAU_CONFIG[p.type]) conf = EAU_CONFIG[p.type];
    if (AppState.selectedSector === "education" && EDUCATION_CONFIG[p.type]) conf = EDUCATION_CONFIG[p.type];

    const iconHtml = `
      <div class="marker-pin" style="background-color:${conf.hex}">
        <i class="fa-solid ${conf.icon} text-sm"></i>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml, className: "custom-div-icon",
      iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -38]
    });

    const m = L.marker([p.lat, p.lng], { icon: customIcon }).addTo(markersLayer);
    m.bindPopup(fichePopupHTML(p), { maxWidth: 380 });
  });

  console.log(`[renderProjectsMarkers] Rendered ${filtered.length} markers on map`);
}

function renderRegions() {
  clearAdmin(); clearMarkers(); clearFocusMask(); clearLabels();
  AppState.level = "country";
  AppState.selectedRegion = null;
  AppState.selectedProvince = null;
  AppState.selectedCommune = null;
  AppState.selectedSector = null;
  AppState.projects = [];
  AppState.santePoints = [];
  AppState.santeFilter = "all";
  AppState.diagnosticMode = false;
  resetSectorButtons();
  applyPanelTheme("default");
  setText("headerSubTitle", "Maroc");
  updateUIVisibility();

  adminLayer = L.geoJSON(AppState.regionsFC, {
    style: (feature) => {
      const allowed = isSoussMassaRegion(feature);
      return {
        weight: allowed ? 2 : 1,
        color: allowed ? "#0f172a" : "#94a3b8",
        fillColor: allowed ? "#3b82f6" : "#f1f5f9",
        fillOpacity: allowed ? 0.22 : 0.05,
        dashArray: allowed ? "" : "3, 3"
      };
    },
    onEachFeature: (feature, layer) => {
      const allowed = isSoussMassaRegion(feature);
      if (allowed) addCenterLabel(feature, "Région Laâyoune-Sakia El Hamra ");

      if (allowed) {
        layer.on("click", () => {
          AppState.selectedRegion = feature;
          renderProvinces(feature);
        });
      }
    }
  }).addTo(map);

  map.fitBounds(adminLayer.getBounds().pad(0.05));
}

function renderProvinces(regionFeature) {
  clearAdmin(); clearMarkers(); clearLabels();
  AppState.level = "region";
  AppState.selectedProvince = null;
  AppState.selectedCommune = null;
  AppState.selectedSector = null;
  AppState.projects = [];
  AppState.santePoints = [];
  AppState.santeFilter = "all";
  AppState.diagnosticMode = false;
  resetSectorButtons();
  applyPanelTheme("default");
  setFocusMask(regionFeature);
  updateUIVisibility();

  const rName = featureName(regionFeature);
  renderStatsRegion(rName);

  const provinces = featuresInside(regionFeature, AppState.provincesFC);

  adminLayer = L.geoJSON({ type: "FeatureCollection", features: provinces }, {
    style: (feature) => {
      const allowed = isTarfayaProvince(feature);
      return {
        weight: allowed ? 2 : 1,
        color: allowed ? "#0f172a" : "#64748b",
        fillColor: allowed ? "#3b82f6" : "#e2e8f0",
        fillOpacity: allowed ? 0.25 : 0.08
      };
    },
    onEachFeature: (feature, layer) => {
      const allowed = isTarfayaProvince(feature);
      if (allowed) addCenterLabel(feature, "Province : Tarfaya");

      if (allowed) {
        layer.on("click", () => {
          AppState.selectedProvince = feature;
          renderCommunes(feature);
        });
      }
    }
  }).addTo(map);

  map.fitBounds(adminLayer.getBounds(), { padding: [20, 20] });
}

function renderStatsRegion(regionName) {
  applyPanelTheme("default");

  const leftPanel = document.getElementById("leftPanel");
  const rightPanel = document.getElementById("rightPanel");
  const s = REGION_STATS;

  if (leftPanel) {
    leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs démographiques</div>
            <div class="panel-sub">RGPH 2025 • ${regionName}</div>
          </div>
          <span class="badge-chip"><span class="badge-dot"></span> Région</span>
        </div>

        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Population (2025)</div>
                  <div class="kpi-value">${fmtInt(s.population_2025)}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-people-group"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Urbanisation (2025)</div>
                  <div class="kpi-value">${s.urbanisation_2025}%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-city"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Femmes</div>
                  <div class="kpi-value">${s.women_share}%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-person-dress"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Jeunes (&lt; 15 ans)</div>
                  <div class="kpi-value">${s.under15_share}%</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-child"></i></div>
              </div>
            </div>
          </div>

          <div class="big-stat mt-3">
            <div class="num">${s.density_hab_km2}</div>
            <div class="cap">Densité (hab/km²)</div>
          </div>
        </div>
      </div>
    `;
  }

  if (rightPanel) {
    rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs territoriaux</div>
            <div class="panel-sub">Découpage et superficie</div>
          </div>
          <span class="badge-chip"><span class="badge-dot"></span> Territoire</span>
        </div>

        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Superficie (km²)</div>
                  <div class="kpi-value">${fmtInt(s.area_km2)}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-ruler-combined"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Préfectures • Provinces</div>
                  <div class="kpi-value">${s.prefectures} • ${s.provinces}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-layer-group"></i></div>
              </div>
            </div>
          </div>

          <div class="kpi-grid mt-3">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Communes (total)</div>
                  <div class="kpi-value">${s.communes_total}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-diagram-project"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Urbaines • Rurales</div>
                  <div class="kpi-value">${s.communes_urbaines} • ${s.communes_rurales}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-house-flag"></i></div>
              </div>
            </div>
          </div>

          <div class="hint mt-3">
            Cliquez sur Agadir Ida-Outanane pour descendre au niveau province.
          </div>
        </div>
      </div>
    `;
  }

  setText("headerSubTitle", "Région : " + regionName);
}

function renderStatsPrefecture() {
  applyPanelTheme(AppState.selectedSector || "default");

  const leftPanel = document.getElementById("leftPanel");
  const rightPanel = document.getElementById("rightPanel");

  // PROVINCE TARFAYA STATS
  if (leftPanel) {
    const provinceStats = AppState.provinceStats || {};

    if (AppState.selectedSector === "education") {
      const dEdu = provinceStats.edu || {};
      const val = (k) => parseNumber(dEdu[k]);

      const prescolaire = { etabs: val("Nombre d'établissements préscolaires"), filles: val("Nombre des élèves Préscolaire -Fille-"), garcons: val("Nombre des élèves Préscolaire -Garçon-") };
      const primaire = { etabs: val("Nombre d'établissements Primaire"), filles: 0, garcons: 0 };
      const college = { etabs: val("Nombre d'établissements collège"), filles: val("Nombre des élèves collège -Fille-"), garcons: val("Nombre des élèves collège -Garçon-") };
      const lycee = { etabs: val("Nombre d'établissements Lycée"), filles: val("Nombre des élèves Lycée -Fille-"), garcons: val("Nombre des élèves Lycée -Garçon-") };

      leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div><div class="panel-title">Éducation - Province</div></div>
          <span class="badge-chip"><span class="badge-dot" style="background:#3b82f6;"></span> Éducation</span>
        </div>
        <div class="panel-body">
           <div class="kpi-grid mb-4">
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Établissements</div><div class="kpi-value">${prescolaire.etabs + primaire.etabs + college.etabs + lycee.etabs}</div></div><div class="kpi-ico"><i class="fa-solid fa-school"></i></div></div></div>
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Élèves (Total)</div><div class="kpi-value">${prescolaire.filles + prescolaire.garcons + college.filles + college.garcons + lycee.filles + lycee.garcons}</div></div><div class="kpi-ico"><i class="fa-solid fa-user-graduate"></i></div></div></div>
           </div>
           
           <table class="w-full text-sm text-left">
              <thead><tr class="text-xs uppercase text-slate-400 border-b border-slate-700">
                  <th class="p-2">Cycle</th><th class="p-2 text-right">Etabs</th><th class="p-2 text-right">Filles</th><th class="p-2 text-right">Garçons</th>
              </tr></thead>
              <tbody>
                  <tr><td class="p-2">Préscolaire</td><td class="p-2 text-right">${prescolaire.etabs}</td><td class="p-2 text-right">${prescolaire.filles}</td><td class="p-2 text-right">${prescolaire.garcons}</td></tr>
                  <tr><td class="p-2">Primaire</td><td class="p-2 text-right">${primaire.etabs}</td><td class="p-2 text-right">-</td><td class="p-2 text-right">-</td></tr>
                  <tr><td class="p-2">Collège</td><td class="p-2 text-right">${college.etabs}</td><td class="p-2 text-right">${college.filles}</td><td class="p-2 text-right">${college.garcons}</td></tr>
                  <tr><td class="p-2">Lycée</td><td class="p-2 text-right">${lycee.etabs}</td><td class="p-2 text-right">${lycee.filles}</td><td class="p-2 text-right">${lycee.garcons}</td></tr>
              </tbody>
           </table>
        </div>
      </div>`;
    } else if (AppState.selectedSector === "emploi") {
      const dEmp = provinceStats.emp || { taux_activite: 0, taux_chomage: 0, pop_active: 0 };
      leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div><div class="panel-title">Emploi - Province</div></div>
          <span class="badge-chip"><span class="badge-dot" style="background:#f97316;"></span> Emploi</span>
        </div>
        <div class="panel-body">
           <div class="kpi-grid">
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Pop. Active</div><div class="kpi-value">${fmtInt(dEmp.pop_active)}</div></div><div class="kpi-ico"><i class="fa-solid fa-users-gear"></i></div></div></div>
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Taux Activité</div><div class="kpi-value">${dEmp.taux_activite}%</div></div><div class="kpi-ico"><i class="fa-solid fa-briefcase"></i></div></div></div>
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Taux Chômage</div><div class="kpi-value">${dEmp.taux_chomage}%</div></div><div class="kpi-ico"><i class="fa-solid fa-user-clock"></i></div></div></div>
           </div>
        </div>
      </div>`;
    } else if (AppState.selectedSector === "sante") {
      const dSante = provinceStats.sante || {};

      // Calculate totals
      const totalESSP = parseNumber(dSante["ESSP"]) || 8;
      const totalAmbulances = parseNumber(dSante["Nombre d'ambulances"]) || 10;
      const dispensaire = parseNumber(dSante["Nombre Dispensaire"]) || 0;
      const csr1 = parseNumber(dSante["Nombre CSR 1"]) || 0;
      const csu1 = parseNumber(dSante["Nombre CSU 1"]) || 0;
      const csu2 = parseNumber(dSante["Nombre CSU 2"]) || 0;
      const chp = parseNumber(dSante["Nombre CHP"]) || 0;

      leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div><div class="panel-title">Santé - Province</div></div>
          <span class="badge-chip"><span class="badge-dot" style="background:#ef4444;"></span> Santé</span>
        </div>
        <div class="panel-body">
           <div class="kpi-grid mb-4">
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">ESSP</div><div class="kpi-value">${totalESSP}</div></div><div class="kpi-ico"><i class="fa-solid fa-hospital"></i></div></div></div>
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Ambulances</div><div class="kpi-value">${totalAmbulances}</div></div><div class="kpi-ico"><i class="fa-solid fa-truck-medical"></i></div></div></div>
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Couverture</div><div class="kpi-value" style="font-size:11px;">${dSante["Taux de couverture sanitaire (Nbre centres/habitants)"] || "—"}</div></div><div class="kpi-ico"><i class="fa-solid fa-shield-heart"></i></div></div></div>
           </div>
           
           <div style="margin-bottom:16px;">
             <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.7); margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px;">Établissements par type</div>
             <table class="w-full text-sm">
               <tbody style="font-size:12px;">
                 <tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td class="p-2">Dispensaire</td><td class="p-2 text-right font-semibold">${dispensaire}</td></tr>
                 <tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td class="p-2">CSR 1</td><td class="p-2 text-right font-semibold">${csr1}</td></tr>
                 <tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td class="p-2">CSU 1</td><td class="p-2 text-right font-semibold">${csu1}</td></tr>
                 <tr style="border-bottom:1px solid rgba(255,255,255,0.1);"><td class="p-2">CSU 2</td><td class="p-2 text-right font-semibold">${csu2}</td></tr>
                 <tr><td class="p-2">CHP</td><td class="p-2 text-right font-semibold">${chp}</td></tr>
               </tbody>
             </table>
           </div>

           <div class="kpi-grid">
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label" style="font-size:10px;">Médecins/10k hab</div><div class="kpi-value" style="font-size:13px;">${dSante["Médecins généraliste pour 10 000 habitants"] || "—"}</div></div><div class="kpi-ico"><i class="fa-solid fa-user-doctor"></i></div></div></div>
              <div class="kpi"><div class="kpi-top"><div><div class="kpi-label" style="font-size:10px;">Infirmiers/10k hab</div><div class="kpi-value" style="font-size:13px;">${dSante["Infirmiers pour 10 000 habitants"] || "—"}</div></div><div class="kpi-ico"><i class="fa-solid fa-user-nurse"></i></div></div></div>
           </div>

           <div style="margin-top:16px; padding:12px; background:rgba(239,68,68,0.1); border-radius:8px; border-left:3px solid #ef4444;">
             <div style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.7); margin-bottom:6px;">INDICATEURS DE SANTÉ</div>
             <div style="font-size:11px; line-height:1.6;">
               <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                 <span>Accouchements surveillés</span>
                 <span style="font-weight:600;">${(parseFloat(dSante["Taux d'accouchement surveillé en 2024"]) * 100).toFixed(1)}%</span>
               </div>
               <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                 <span>Mortalité périnatale</span>
                 <span style="font-weight:600;">${(parseFloat(dSante["Taux de mortalité périnatale précoce"]) * 100).toFixed(2)}%</span>
               </div>
               <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                 <span>Mortalité infantile</span>
                 <span style="font-weight:600;">${dSante["Taux de mortalité infantile"] || "0‰"}</span>
               </div>
               <div style="display:flex; justify-content:space-between;">
                 <span>Mortalité maternelle</span>
                 <span style="font-weight:600;">${dSante["Taux de mortalité maternelle"] || "0‰"}</span>
               </div>
             </div>
           </div>
        </div>
      </div>`;
    } else if (AppState.selectedSector === "eau") {
      // Water sector - comprehensive statistics
      const eauData = provinceStats.eau || {};
      console.log('[renderStatsPrefecture] provinceStats:', provinceStats);
      console.log('[renderStatsPrefecture] eauData:', eauData);

      const infrastructure = parseNumber(eauData["Infrastructure Production EP"]) || 0;
      const capacite = eauData["Capacité de production"] || "0 l/s";
      const branchements = parseNumber(eauData["Nombre de branchement EP"]) || 0;
      const raccordements = parseNumber(eauData["Nombre de raccordement aux réseaux publics"]) || 0;
      const tauxCouverture = eauData["Taux de couverture en assainissement"] || "0%";
      const tauxRendementProd = eauData["Taux de rendement infrastructure production EP"] || "0%";
      const tauxRendementDist = eauData["Taux de rendement infrastructure distribution EP"] || "0%";

      console.log('[renderStatsPrefecture] Parsed values:', { infrastructure, capacite, branchements, raccordements });

      leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">💧 Infrastructure Eau</div>
            <div class="panel-sub">Production et Distribution</div>
          </div>
          <span class="badge-chip"><span class="badge-dot" style="background:#06b6d4;"></span> Province</span>
        </div>
        <div class="panel-body">
           <div class="kpi-grid">
              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Stations EP</div>
                    <div class="kpi-value">${infrastructure}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-industry"></i></div>
                </div>
                <div class="kpi-note">Stations de production</div>
              </div>
              
              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Capacité</div>
                    <div class="kpi-value" style="font-size: 18px;">${capacite}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-droplet"></i></div>
                </div>
                <div class="kpi-note">Production totale</div>
              </div>

              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Branchements</div>
                    <div class="kpi-value">${branchements.toLocaleString()}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-plug"></i></div>
                </div>
                <div class="kpi-note">Total branchements EP</div>
              </div>

              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Raccordements</div>
                    <div class="kpi-value">${raccordements.toLocaleString()}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-house-circle-check"></i></div>
                </div>
                <div class="kpi-note">Réseau public</div>
              </div>
           </div>
        </div>
      </div>`;

      rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">📊 Performance</div>
            <div class="panel-sub">Taux de couverture et rendement</div>
          </div>
        </div>
        <div class="panel-body">
          <div class="space-y-4">
            <div class="p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(6, 182, 212, 0.3);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/70 text-sm">🏘️ Couverture Assainissement</span>
                <span class="text-2xl font-bold text-cyan-300">${tauxCouverture}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full" style="width: ${tauxCouverture}"></div>
              </div>
            </div>

            <div class="p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.3);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/70 text-sm">⚙️ Rendement Production</span>
                <span class="text-2xl font-bold text-green-300">${tauxRendementProd}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style="width: ${tauxRendementProd}"></div>
              </div>
            </div>

            <div class="p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.3);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-white/70 text-sm">🚰 Rendement Distribution</span>
                <span class="text-2xl font-bold text-blue-300">${tauxRendementDist}</span>
              </div>
              <div class="w-full bg-white/10 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full" style="width: ${tauxRendementDist}"></div>
              </div>
            </div>

            <div class="mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div class="text-xs text-white/60 mb-1">💡 Taux de connexion</div>
              <div class="text-lg font-bold text-white">
                ${branchements > 0 ? ((raccordements / branchements) * 100).toFixed(1) : 0}%
              </div>
              <div class="text-xs text-white/50 mt-1">
                ${raccordements.toLocaleString()} / ${branchements.toLocaleString()} branchements raccordés
              </div>
            </div>
          </div>
        </div>
      </div>`;
    } else {
      const dDemo = provinceStats.demo || {};
      leftPanel.innerHTML = `
        <div class="panel-card text-white">
          <div class="panel-header">
            <div>
              <div class="panel-title">Indicateurs démographiques</div>
              <div class="panel-sub">Province — Tarfaya</div>
            </div>
            <span class="badge-chip"><span class="badge-dot"></span> Indicateurs</span>
          </div>
  
          <div class="panel-body">
            <div class="kpi-grid">
              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Population (2025)</div>
                    <div class="kpi-value">${fmtInt(dDemo.Population || 0)}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-people-group"></i></div>
                </div>
              </div>
  
              <div class="kpi">
                <div class="kpi-top">
                  <div>
                    <div class="kpi-label">Urbanisation</div>
                    <div class="kpi-value">${dDemo["Taux d'urbanisation"] || "-"}</div>
                  </div>
                  <div class="kpi-ico"><i class="fa-solid fa-city"></i></div>
                </div>
              </div>
            </div>
  
            <div class="kpi mt-3">
               <div class="kpi-top">
                 <div>
                    <div class="kpi-label">Femmes / Hommes</div>
                    <div class="kpi-value">${dDemo["Féminin"] || "-"} / ${dDemo["Masculin"] || "-"}</div>
                 </div>
                 <div class="kpi-ico"><i class="fa-solid fa-venus-mars"></i></div>
               </div>
               <div class="kpi-note" style="margin-top:4px; font-size:10px; color:rgba(255,255,255,0.5);">
                 Superficie: ${fmtInt(dDemo["Superficie (Km²)"] || 0)} Km²
               </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  if (rightPanel) {
    rightPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">Indicateurs territoriaux</div>
            <div class="panel-sub">Géographie et communes</div>
          </div>
          <span class="badge-chip"><span class="badge-dot"></span> Territoire</span>
        </div>

        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Superficie (km²)</div>
                  <div class="kpi-value">11 945</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-map"></i></div>
              </div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Communes</div>
                  <div class="kpi-value">5</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-diagram-project"></i></div>
              </div>
            </div>
          </div>

          <div class="kpi-grid mt-3">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Littoral</div>
                  <div class="kpi-value">205 km</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-water"></i></div>
              </div>
            </div>
            
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Zone désertique</div>
                  <div class="kpi-value">Dominante</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-sun"></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setText("headerSubTitle", "Province : Tarfaya");
}

function renderStatsCommune(communeName) {
  applyPanelTheme(AppState.selectedSector || "default");

  const leftPanel = document.getElementById("leftPanel");
  const rightPanel = document.getElementById("rightPanel");

  // Check for imported/static data
  // Strip "Commune de " or "Commune d'" prefix before normalizing
  let cleanName = communeName;
  if (cleanName.toLowerCase().startsWith("commune de ")) {
    cleanName = cleanName.substring(11); // Remove "Commune de "
  } else if (cleanName.toLowerCase().startsWith("commune d'")) {
    cleanName = cleanName.substring(10); // Remove "Commune d'"
  }
  const nKey = normalizeName(cleanName);
  const data = AppState.importedData ? AppState.importedData[nKey] : null;

  // Values (imported or default) - using actual keys from data.json
  const population = data?.demo?.Population ? fmtInt(data.demo.Population) : "—";
  const menages = data?.demo?.["Nombre ménage"] ? fmtInt(data.demo["Nombre ménage"]) : "—";
  const superficie = data?.demo?.["Superficie (Km²)"] ? fmtInt(data.demo["Superficie (Km²)"]) : "—";
  const littoral = data?.demo?.Littoral || "—";
  const masculin = data?.demo?.Masculin ? data.demo.Masculin + (typeof data.demo.Masculin === 'number' ? '%' : '') : "—";
  const feminin = data?.demo?.Féminin ? data.demo.Féminin + (typeof data.demo.Féminin === 'number' ? '%' : '') : "—";



  if (AppState.selectedSector === "emploi") {
    const emp = data?.emp;
    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div><div class="panel-title">Emploi - ${communeName}</div></div>
          <span class="badge-chip"><span class="badge-dot" style="background:#f97316;"></span> Emploi</span>
        </div>
        <div class="panel-body">
           <div class="kpi-grid">
            <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Pop. Active</div><div class="kpi-value">${emp ? fmtInt(emp.pop_active) : "—"}</div></div><div class="kpi-ico"><i class="fa-solid fa-users-gear"></i></div></div></div>
            <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Taux Activité</div><div class="kpi-value">${emp ? emp.taux_activite : "—"}%</div></div><div class="kpi-ico"><i class="fa-solid fa-briefcase"></i></div></div></div>
            <div class="kpi"><div class="kpi-top"><div><div class="kpi-label">Taux Chômage</div><div class="kpi-value">${emp ? emp.taux_chomage : "—"}%</div></div><div class="kpi-ico"><i class="fa-solid fa-user-clock"></i></div></div></div>
           </div>
        </div>
      </div>`;
    if (rightPanel) rightPanel.innerHTML = `<div class="panel-card text-white"><div class="panel-body"><div class="hint">Indicateurs Emploi (RGPH/Estimation).</div></div></div>`;
    setText("headerSubTitle", "Commune : " + communeName);
    return;
  }

  if (AppState.selectedSector === "sante") {
    const sante = data?.sante || {};
    const etabs = parseNumber(sante["Nombre d'établissements sanitaires"]) || 0;
    const medecins = parseNumber(sante["Nombre de médcin"]) || 0;
    const infirmiers = parseNumber(sante["Nombre d'infirmier"]) || 0;
    const sageFemmes = parseNumber(sante["Nombre de sage femme"]) || 0;
    const ambulances = parseNumber(sante["Nombre d'ambulances"]) || 0;
    const litsAccouchement = parseNumber(sante["Nombre lit accouchement"]) || 0;

    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div><div class="panel-title">Santé - ${communeName}</div></div>
          <span class="badge-chip"><span class="badge-dot" style="background:#ef4444;"></span> Santé</span>
        </div>
        <div class="panel-body">
           <div class="kpi mb-4">
             <div class="kpi-top">
               <div>
                 <div class="kpi-label">Établissements Sanitaires</div>
                 <div class="kpi-value" style="font-size:24px;">${etabs}</div>
               </div>
               <div class="kpi-ico"><i class="fa-solid fa-hospital"></i></div>
             </div>
           </div>

           <div style="margin-bottom:16px;">
             <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.7); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Personnel Médical</div>
             <div class="kpi-grid">
               <div class="kpi">
                 <div class="kpi-top">
                   <div>
                     <div class="kpi-label" style="font-size:11px;">Médecins</div>
                     <div class="kpi-value" style="font-size:18px;">${medecins}</div>
                   </div>
                   <div class="kpi-ico" style="background:rgba(59,130,246,0.15);"><i class="fa-solid fa-user-doctor" style="color:#3b82f6;"></i></div>
                 </div>
               </div>
               <div class="kpi">
                 <div class="kpi-top">
                   <div>
                     <div class="kpi-label" style="font-size:11px;">Infirmiers</div>
                     <div class="kpi-value" style="font-size:18px;">${infirmiers}</div>
                   </div>
                   <div class="kpi-ico" style="background:rgba(16,185,129,0.15);"><i class="fa-solid fa-user-nurse" style="color:#10b981;"></i></div>
                 </div>
               </div>
               <div class="kpi">
                 <div class="kpi-top">
                   <div>
                     <div class="kpi-label" style="font-size:11px;">Sages-femmes</div>
                     <div class="kpi-value" style="font-size:18px;">${sageFemmes}</div>
                   </div>
                   <div class="kpi-ico" style="background:rgba(236,72,153,0.15);"><i class="fa-solid fa-person-breastfeeding" style="color:#ec4899;"></i></div>
                 </div>
               </div>
             </div>
           </div>

           <div style="margin-bottom:16px;">
             <div style="font-size:11px; font-weight:600; color:rgba(255,255,255,0.7); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Équipements & Ressources</div>
             <div class="kpi-grid">
               <div class="kpi">
                 <div class="kpi-top">
                   <div>
                     <div class="kpi-label" style="font-size:11px;">Ambulances</div>
                     <div class="kpi-value" style="font-size:18px;">${ambulances}</div>
                   </div>
                   <div class="kpi-ico" style="background:rgba(239,68,68,0.15);"><i class="fa-solid fa-truck-medical" style="color:#ef4444;"></i></div>
                 </div>
               </div>
               <div class="kpi">
                 <div class="kpi-top">
                   <div>
                     <div class="kpi-label" style="font-size:11px;">Lits Maternité</div>
                     <div class="kpi-value" style="font-size:18px;">${litsAccouchement}</div>
                   </div>
                   <div class="kpi-ico" style="background:rgba(139,92,246,0.15);"><i class="fa-solid fa-bed-pulse" style="color:#8b5cf6;"></i></div>
                 </div>
               </div>
             </div>
           </div>

           ${etabs > 0 ? `<div style="padding:10px; background:rgba(16,185,129,0.1); border-radius:6px; border-left:3px solid #10b981;">
             <div style="font-size:11px; color:rgba(255,255,255,0.8);"><i class="fa-solid fa-circle-check" style="color:#10b981; margin-right:6px;"></i>Services de santé disponibles dans cette commune</div>
           </div>` : `<div style="padding:10px; background:rgba(239,68,68,0.1); border-radius:6px; border-left:3px solid #ef4444;">
             <div style="font-size:11px; color:rgba(255,255,255,0.8);"><i class="fa-solid fa-circle-info" style="color:#ef4444; margin-right:6px;"></i>Données détaillées non disponibles</div>
           </div>`}
        </div>
      </div>`;
    if (rightPanel) rightPanel.innerHTML = `<div class="panel-card text-white"><div class="panel-body"><div class="hint">Données de la Direction Provinciale de la Santé.</div></div></div>`;
    setText("headerSubTitle", "Commune : " + communeName);
    return;
  }

  if (AppState.selectedSector === "eau") {
    const eauData = data?.eau || {};
    const infrastructure = parseNumber(eauData["Infrastructure Production EP"]) || 0;
    const capacite = eauData["Capacité de production"] || "0 l/s";
    const branchements = parseNumber(eauData["Nombre de branchement EP"]) || 0;
    const raccordements = parseNumber(eauData["Nombre de raccordement aux réseaux publics"]) || 0;
    const tauxCouverture = eauData["Taux de couverture en assainissement"] || "0%";

    if (leftPanel) leftPanel.innerHTML = `
      <div class="panel-card text-white">
        <div class="panel-header">
          <div>
            <div class="panel-title">💧 Eau - ${communeName}</div>
            <div class="panel-sub">Infrastructure locale</div>
          </div>
          <span class="badge-chip"><span class="badge-dot" style="background:#06b6d4;"></span> Eau</span>
        </div>
        <div class="panel-body">
          <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Stations</div>
                  <div class="kpi-value">${infrastructure}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-industry"></i></div>
              </div>
              <div class="kpi-note">Production EP</div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Capacité</div>
                  <div class="kpi-value" style="font-size: 16px;">${capacite}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-droplet"></i></div>
              </div>
              <div class="kpi-note">Production</div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Branchements</div>
                  <div class="kpi-value">${branchements.toLocaleString()}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-plug"></i></div>
              </div>
              <div class="kpi-note">Total EP</div>
            </div>

            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Couverture</div>
                  <div class="kpi-value" style="font-size: 20px;">${tauxCouverture}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-chart-pie"></i></div>
              </div>
              <div class="kpi-note">Assainissement</div>
            </div>
          </div>

          <div class="mt-4 p-4 rounded-xl" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05)); border: 1px solid rgba(6, 182, 212, 0.3);">
            <div class="flex items-center justify-between mb-2">
              <span class="text-white/70 text-sm">🏘️ Raccordements réseau public</span>
              <span class="text-xl font-bold text-cyan-300">${raccordements.toLocaleString()}</span>
            </div>
            <div class="text-xs text-white/50 mt-2">
              ${branchements > 0 ? `Taux: ${((raccordements / branchements) * 100).toFixed(1)}%` : 'Aucun branchement'}
            </div>
          </div>
        </div>
      </div>`;
    if (rightPanel) rightPanel.innerHTML = "";
    setText("headerSubTitle", "Commune : " + communeName);
    return;
  }

  // Default view (Demographics)
  if (leftPanel) leftPanel.innerHTML = `
    <div class="panel-card text-white">
      <div class="panel-header">
        <div>
          <div class="panel-title">Commune - ${communeName}</div>
          <div class="panel-sub">Démographie Locale</div>
        </div>
        <span class="badge-chip"><span class="badge-dot"></span> Commune</span>
      </div>
      <div class="panel-body">
        <div class="kpi-grid">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Population</div>
                  <div class="kpi-value" style="font-size:16px;">${population}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-users"></i></div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Ménages</div>
                  <div class="kpi-value" style="font-size:16px;">${menages}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-house-user"></i></div>
              </div>
            </div>
        </div>
        
        <div class="kpi-grid mt-3">
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Superficie</div>
                  <div class="kpi-value" style="font-size:14px;">${superficie} Km²</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-map"></i></div>
              </div>
            </div>
            <div class="kpi">
              <div class="kpi-top">
                <div>
                  <div class="kpi-label">Littoral</div>
                  <div class="kpi-value" style="font-size:14px;">${littoral}</div>
                </div>
                <div class="kpi-ico"><i class="fa-solid fa-water"></i></div>
              </div>
            </div>
        </div>
        
        <div class="kpi mt-3">
          <div class="kpi-top">
            <div>
              <div class="kpi-label">Répartition Genre</div>
              <div class="kpi-value" style="font-size:14px;">♀ ${feminin} / ♂ ${masculin}</div>
            </div>
            <div class="kpi-ico"><i class="fa-solid fa-venus-mars"></i></div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (rightPanel) rightPanel.innerHTML = `
    <div class="panel-card text-white">
      <div class="panel-header">
        <div>
          <div class="panel-title">Actions</div>
          <div class="panel-sub">Filtres et secteurs</div>
        </div>
        <span class="badge-chip"><span class="badge-dot"></span> Actions</span>
      </div>
      <div class="panel-body">
        <div class="hint">
          Sélectionnez un secteur en bas pour afficher les marqueurs.
        </div>
      </div>
    </div>
  `;

  setText("headerSubTitle", "Commune : " + communeName);
}


// Generate health markers based on real commune data
function generateHealthMarkersFromData() {
  const healthMarkers = [];

  if (!AppState.communesFC || !AppState.importedData) return healthMarkers;

  // Map commune names to their hospital image files
  const imageMap = {
    'tarfaya': [
      'assets/image des hopitaux santé/hapital tarfaya 1.png',
      'assets/image des hopitaux santé/hopital tarfaya 2.png',
      'assets/image des hopitaux santé/hopital tarfaya 3.png'
    ],
    'akhfennir': ['assets/image des hopitaux santé/hopital AKHFENNIR.png'],
    'tah': [
      'assets/image des hopitaux santé/hopital tah 1.png',
      'assets/image des hopitaux santé/hopital tah 2.png'
    ],
    'daoura': ['assets/image des hopitaux santé/hopital DAOURA.png'],
    'el hagounia': ['assets/image des hopitaux santé/image hopital hagounia.png']
  };

  AppState.communesFC.features.forEach(communeFeature => {
    const communeName = featureName(communeFeature);
    const nKey = normalizeName(communeName.replace(/^Commune (de |d')/i, ''));
    const communeData = AppState.importedData[nKey];

    if (!communeData || !communeData.sante) return;

    const sante = communeData.sante;
    const etabs = parseNumber(sante["Nombre d'établissements sanitaires"]) || 0;
    const ambulances = parseNumber(sante["Nombre d'ambulances"]) || 0;
    const medecins = parseNumber(sante["Nombre de médcin"]) || 0;
    const infirmiers = parseNumber(sante["Nombre d'infirmier"]) || 0;
    const sageFemmes = parseNumber(sante["Nombre de sage femme"]) || 0;

    const images = imageMap[nKey] || [];

    // Generate ESSP markers (health establishments)
    for (let i = 0; i < etabs; i++) {
      const pt = randomPointInPoly(communeFeature);
      if (pt) {
        const subtypes = ["Dispensaire", "CSR 1", "CSU 1", "CSU 2", "CHP"];
        const subtype = subtypes[i % subtypes.length];

        healthMarkers.push({
          id: `essp_${nKey}_${i}`,
          kind: "essp",
          subtype: subtype,
          title: `${subtype} - ${communeName}`,
          nom: `${subtype} - ${communeName}`,
          commune: communeName,
          capacite_accueil: etabs > 1 ? Math.floor(medecins / etabs) : medecins,
          nb_medecins: etabs > 1 ? Math.floor(medecins / etabs) : medecins,
          nb_infirmiers: etabs > 1 ? Math.floor(infirmiers / etabs) : infirmiers,
          nb_sage_femmes: etabs > 1 ? Math.floor(sageFemmes / etabs) : sageFemmes,
          constat: `Établissement de santé de ${communeName}`,
          img: images[i] || images[0] || "assets/image hopital hagounia.png",
          lat: pt.geometry.coordinates[1],
          lng: pt.geometry.coordinates[0]
        });
      }
    }

    // Generate ambulance markers
    for (let i = 0; i < ambulances; i++) {
      const pt = randomPointInPoly(communeFeature);
      if (pt) {
        healthMarkers.push({
          id: `amb_${nKey}_${i}`,
          kind: "ambulance",
          subtype: null,
          title: `Ambulance ${i + 1} - ${communeName}`,
          nom: `Ambulance ${i + 1} - ${communeName}`,
          commune: communeName,
          capacite_accueil: "-",
          nb_medecins: 0,
          nb_infirmiers: 1,
          constat: `Ambulance de ${communeName}`,
          img: "assets/ambulance.jpg",
          lat: pt.geometry.coordinates[1],
          lng: pt.geometry.coordinates[0]
        });
      }
    }
  });

  return healthMarkers;
}

function renderCommunes(provinceFeature) {
  clearAdmin(); clearMarkers(); clearLabels();
  AppState.level = "province";
  AppState.selectedCommune = null;
  setFocusMask(provinceFeature);
  updateUIVisibility();

  if (!AppState.projects.length) AppState.projects = generateRandomProjectsForProvince(provinceFeature, 90);

  // Generate health markers from real data instead of random
  if (!AppState.santePoints || AppState.santePoints.length === 0) {
    AppState.santePoints = generateHealthMarkersFromData();
  }

  if (AppState.selectedSector) renderSectorPanels(AppState.selectedSector);
  else renderStatsPrefecture();

  const communes = featuresInside(provinceFeature, AppState.communesFC);

  adminLayer = L.geoJSON({ type: "FeatureCollection", features: communes }, {
    style: (feature) => {
      let style = { weight: 1, color: "#94a3b8", fillColor: "#ffffff", fillOpacity: 0.05 };
      if (AppState.selectedSector === "sante" && AppState.diagnosticMode) {
        const n = countSantePointsInFeature(feature);
        if (n > 1) style = { weight: 1.5, color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.35 };
      }
      return style;
    },
    onEachFeature: (feature, layer) => {
      const cname = featureName(feature);
      addCenterLabel(feature, cname);

      layer.on("click", () => {
        if (AppState.selectedSector === "sante" && AppState.diagnosticMode) {
          const n = countSantePointsInFeature(feature);
          if (n > 1) {
            showCommuneDiagnosticPopup(cname);
            return;
          }
        }

        AppState.selectedCommune = feature;
        renderStatsCommune(cname);
        renderSingleCommune(feature);
        renderProjectsMarkers();
      });
    }
  }).addTo(map);

  map.fitBounds(adminLayer.getBounds().pad(0.1));
  renderProjectsMarkers();
  refreshCommunesDiagnosticStyles();
}

function renderSingleCommune(communeFeature) {
  clearAdmin(); clearMarkers(); clearLabels();
  AppState.level = "commune";
  setFocusMask(communeFeature);
  updateUIVisibility();

  adminLayer = L.geoJSON({ type: "FeatureCollection", features: [communeFeature] }, {
    style: () => ({ weight: 2, color: "#0f172a", fillColor: "#3b82f6", fillOpacity: 0.12 })
  }).addTo(map);

  addCenterLabel(communeFeature, featureName(communeFeature));
  map.fitBounds(adminLayer.getBounds().pad(0.10));
  renderProjectsMarkers();
}

function wireUI() {
  document.querySelectorAll(".sector-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!(AppState.level === "province" || AppState.level === "commune") || !AppState.selectedProvince) {
        alert("Veuillez d'abord naviguer jusqu'à la province de Tarfaya.");
        return;
      }

      const clickedSector = btn.dataset.sector;

      // Toggle functionality: if clicking the same sector, deactivate it
      if (AppState.selectedSector === clickedSector) {
        AppState.selectedSector = null;
        resetSectorButtons();

        // Return to default view based on current level
        if (AppState.level === "commune" && AppState.selectedCommune) {
          renderStatsCommune(featureName(AppState.selectedCommune));
        } else if (AppState.level === "province") {
          renderStatsPrefecture();
        }

        refreshCommunesDiagnosticStyles();
        renderProjectsMarkers();
        return;
      }

      // Activate the clicked sector
      AppState.selectedSector = clickedSector;

      resetSectorButtons();
      btn.classList.add("active");

      if (AppState.selectedSector !== "sante") {
        AppState.diagnosticMode = false;
        AppState.santeFilter = "all";
      }

      renderSectorPanels(AppState.selectedSector);
      refreshCommunesDiagnosticStyles();
      renderProjectsMarkers();
    });
  });

  document.getElementById("btnBack")?.addEventListener("click", goBack);

  const btnImport = document.getElementById("btnImport");
  const excelInput = document.getElementById("excelInput");

  // Sidebar Controls
  const btnSideMenu = document.getElementById("btnSideMenu");
  const btnCloseSidebar = document.getElementById("btnCloseSidebar");
  const sidebar = document.getElementById("sidebar");
  const btnImportSidebar = document.getElementById("btnImportSidebar");

  if (btnSideMenu && sidebar) {
    btnSideMenu.addEventListener("click", () => {
      sidebar.classList.add("active");
    });
    sidebar.addEventListener("mouseleave", () => {
      sidebar.classList.remove("active");
    });
  }

  if (btnCloseSidebar && sidebar) {
    btnCloseSidebar.addEventListener("click", () => {
      sidebar.classList.remove("active");
    });
  }

  if (btnImportSidebar) {
    btnImportSidebar.addEventListener("click", triggerExcelImport);
  }

  // Fallback for old import button if it exists
  if (btnImport && excelInput) {
    btnImport.addEventListener("click", triggerExcelImport);
    excelInput.addEventListener("change", handleExcelUpload);
  } else if (excelInput) {
    // Just listener on input if button was removed
    excelInput.addEventListener("change", (e) => {
      handleExcelUpload(e);
      // Close sidebar on file select
      if (sidebar) sidebar.classList.remove("active");
    });
  }
}


// Helper to generate markers based on Excel data
function generateMarkersFromExcel(communeFeature, data) {
  const points = [];
  if (!data) return points;

  // EAU Markers
  if (data.eau) {
    const e = data.eau;

    // Puit
    if (e["Puit_(oui/non)"] === "OUI") {
      const pt = randomPointInPoly(communeFeature);
      if (pt) points.push({
        id: "eau_puit_" + randInt(1, 9999),
        sector: "eau",
        kind: "puit",
        title: "Puit",
        icon: "fa-bucket",
        hex: "#06b6d4",
        lat: pt.geometry.coordinates[1],
        lng: pt.geometry.coordinates[0],
        desc: "Point d'eau localisé"
      });
    }

    // Aîne
    if (e["Aîne_(oui/non)"] === "OUI") {
      const pt = randomPointInPoly(communeFeature);
      if (pt) points.push({
        id: "eau_aine_" + randInt(1, 9999),
        sector: "eau",
        kind: "aine",
        title: "Source (Aîne)",
        icon: "fa-water",
        hex: "#3b82f6",
        lat: pt.geometry.coordinates[1],
        lng: pt.geometry.coordinates[0],
        desc: "Source naturelle aménagée"
      });
    }

    // Camion
    if (e["Camion_citerne(oui/non)"] === "OUI") {
      const pt = randomPointInPoly(communeFeature);
      if (pt) points.push({
        id: "eau_camion_" + randInt(1, 9999),
        sector: "eau",
        kind: "camion",
        title: "Dessérte Camion Citerne",
        icon: "fa-truck-droplet",
        hex: "#6366f1",
        lat: pt.geometry.coordinates[1],
        lng: pt.geometry.coordinates[0],
        desc: "Approvisionnement mobile"
      });
    }

    // Réseau
    if (e["Réseau_conventionnelle_(oui/non)"] === "OUI") {
      const pt = randomPointInPoly(communeFeature);
      if (pt) points.push({
        id: "eau_res_" + randInt(1, 9999),
        sector: "eau",
        kind: "reseau",
        title: "Raccordement Réseau",
        icon: "fa-faucet",
        hex: "#0ea5e9",
        lat: pt.geometry.coordinates[1],
        lng: pt.geometry.coordinates[0],
        desc: "Accès au réseau public"
      });
    }
  }

  // Emploi/Other - maybe just generic center points?
  // Leaving strict mapping to Eau as requested and feasible.

  return points;
}

function randomPointInPoly(feature) {
  const bbox = turf.bbox(feature);
  let guard = 0;
  const maxAttempts = 1000; // Increased to handle very complex coastal shapes

  while (guard < maxAttempts) {
    guard++;
    const lng = rand(bbox[0], bbox[2]);
    const lat = rand(bbox[1], bbox[3]);
    const pt = turf.point([lng, lat]);
    if (turf.booleanPointInPolygon(pt, feature)) return pt;
  }

  console.warn(`[randomPointInPoly] Failed to find point inside polygon after ${maxAttempts} attempts`);
  return null; // fallback
}

function triggerExcelImport() {
  document.getElementById("excelInput").click();
}


function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    const getSheet = (name) => {
      const s = workbook.Sheets[name];
      return s ? XLSX.utils.sheet_to_json(s) : [];
    };

    const demoData = getSheet("RENSEIGNEMENTS DEMOGRAPHIQUES");
    const empData = getSheet("EMPLOI");
    const eauData = getSheet("EAU");

    const merged = {};

    demoData.forEach(row => {
      const name = normalizeName(row["Nom_Commune"] || row["Nom_Commune_Arabe"]);
      if (!name) return;
      if (!merged[name]) merged[name] = {};
      merged[name].demo = row;
    });

    empData.forEach(row => {
      const name = normalizeName(row["Nom_Commune"] || row["Nom_Commune_Arabe"]);
      if (!name) return;
      if (!merged[name]) merged[name] = {};
      merged[name].emp = row;
    });

    eauData.forEach(row => {
      const name = normalizeName(row["Nom_Commune"] || row["Nom_Commune_Arabe"]);
      if (!name) return;
      if (!merged[name]) merged[name] = {};
      merged[name].eau = row;
    });

    AppState.importedData = merged;

    // Generate Markers
    AppState.importedMarkers = [];
    if (AppState.communesFC && AppState.communesFC.features) {
      AppState.communesFC.features.forEach(f => {
        const name = normalizeName(featureName(f));
        const cData = merged[name];
        if (cData) {
          const pts = generateMarkersFromExcel(f, cData);
          AppState.importedMarkers.push(...pts);
        }
      });
    }

    alert("Données importées avec succès ! " + Object.keys(merged).length + " communes mises à jour.");

    // Refresh view
    if (AppState.selectedCommune) {
      renderStatsCommune(featureName(AppState.selectedCommune));
      renderProjectsMarkers();
    } else if (AppState.selectedProvince) {
      renderProjectsMarkers();
    }
  };

  reader.readAsArrayBuffer(file);
}

function updateBackButton() {
  const btn = document.getElementById("btnBack");
  if (!btn) return;
  btn.style.display = (AppState.level === "country") ? "none" : "flex";
}

function goBack() {
  if (AppState.level === "commune") {
    AppState.level = "province";
    renderCommunes(AppState.selectedProvince);
    return;
  }
  if (AppState.level === "province") {
    AppState.level = "region";
    renderProvinces(AppState.selectedRegion);
    return;
  }
  if (AppState.level === "region") {
    renderRegions();
    return;
  }
}


function normalizeCommuneName(rawName) {
  if (!rawName) return "";
  let n = rawName.toLowerCase();
  n = n.replace("commune de ", "").replace("commune d'", "").replace("commune ", "");
  n = n.trim();
  return normalizeName(n);
}

function parseNumber(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    return parseFloat(val.replace(/,/g, "").replace(/%/g, "").trim()) || 0;
  }
  return 0;
}

async function loadDynamicData() {
  try {
    // Attempt global variable first (local file scenario)
    if (typeof DATA_JSON !== 'undefined') {
      parseData(DATA_JSON);
      return;
    }

    // Fallback to fetch (server scenario)
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Could not load data.json");
    const json = await res.json();
    parseData(json);
  } catch (e) {
    console.error("Error loading data:", e);
    // If no data, we might show empty dash or error
    alert("Attention : Impossible de charger les données (data.json/data.js).");
  }
}

function parseData(json) {
  AppState.importedData = {};

  if (!json || !json.tables) return;

  // Helper to get or create commune entry
  const getCommune = (name) => {
    const k = normalizeCommuneName(name);
    if (!AppState.importedData[k]) AppState.importedData[k] = {};
    return AppState.importedData[k];
  };

  // 1. Demographics
  const tDemo = json.tables.find(t => t.nom === "RENSEIGNEMENTS DEMOGRAPHIQUES");
  if (tDemo && tDemo.sections) {
    // Province
    const sProv = tDemo.sections.find(s => s.type === "Données par province");
    if (sProv && sProv.donnees) {
      // Store province stats somewhere if needed, currently we use hardcoded text in renderStatsPrefecture for some parts, 
      // but we should ideally update REGION_STATS or specific variables. 
      // For now, let's just make it available globally or in AppState if we want to dynamicize province panel too.
      AppState.provinceStats = { demo: sProv.donnees };
    }

    // Communes
    const sCom = tDemo.sections.find(s => s.type === "Données par commune");
    if (sCom && sCom.donnees && Array.isArray(sCom.donnees)) {
      sCom.donnees.forEach(d => {
        const c = getCommune(d["Collectivités territoriales"]);
        c.demo = d;
      });
    }
  }

  // 2. Education
  const tEdu = json.tables.find(t => t.nom === "EDUCATION");
  if (tEdu && tEdu.sections) {
    // Province
    const sProv = tEdu.sections.find(s => s.type.includes("PROVINCE"));
    if (sProv && sProv.donnees) {
      if (!AppState.provinceStats) AppState.provinceStats = {};
      AppState.provinceStats.edu = sProv.donnees;
    }

    // Communes
    tEdu.sections.forEach(s => {
      if (s.type.toLowerCase().includes("commune")) {
        const c = getCommune(s.type); // type is like "Commune de TARFAYA"
        c.edu = {
          prescolaire: {
            etabs: parseNumber(s.donnees["Nombre d'établissements préscolaires"]),
            filles: parseNumber(s.donnees["Nombre des élèves Préscolaire -Fille-"]),
            garcons: parseNumber(s.donnees["Nombre des élèves Préscolaire -Garçon-"])
          },
          primaire: {
            etabs: parseNumber(s.donnees["Nombre d'établissements Primaire"]),
            filles: parseNumber(s.donnees["Nombre des élèves Primaire -Fille-"]),
            garcons: parseNumber(s.donnees["Nombre des élèves Primaire -Garçon-"] || s.donnees["Nombre des élèves  Primaire -Garçon-"]) // Note double space potential
          },
          college: {
            etabs: parseNumber(s.donnees["Nombre d'établissements collège"]),
            filles: parseNumber(s.donnees["Nombre des élèves collège -Fille-"]),
            garcons: parseNumber(s.donnees["Nombre des élèves collège -Garçon-"])
          },
          lycee: {
            etabs: parseNumber(s.donnees["Nombre d'établissements Lycée"]),
            filles: parseNumber(s.donnees["Nombre des élèves Lycée -Fille-"]),
            garcons: parseNumber(s.donnees["Nombre des élèves Lycée -Garçon-"])
          }
        };
      }
    });
  }

  // 3. Emploi
  const tEmp = json.tables.find(t => t.nom === "EMPLOI");
  if (tEmp && tEmp.sections) {
    // Province
    const sProv = tEmp.sections.find(s => s.type.toLowerCase().includes("province"));
    if (sProv && sProv.donnees) {
      if (!AppState.provinceStats) AppState.provinceStats = {};
      AppState.provinceStats.emp = {
        taux_activite: parseNumber(sProv.donnees["Taux d'activité des 15 ans et plus (%)"]),
        taux_chomage: parseNumber(sProv.donnees["Taux de chômage (%)"]),
        pop_active: parseNumber(sProv.donnees["Population active occupée de 15 ans et plus"])
      };
    }

    // Communes
    tEmp.sections.forEach(s => {
      if (s.type.toLowerCase().includes("commune")) {
        const c = getCommune(s.type);
        c.emp = {
          taux_activite: parseNumber(s.donnees["Taux d'activité des 15 ans et plus (%)"]),
          taux_chomage: parseNumber(s.donnees["Taux de chômage (%)"]),
          pop_active: parseNumber(s.donnees["Population active occupée de 15 ans et plus"])
        };
      }
    });
  }

  // 4. Health (Santé)
  const tSante = json.tables.find(t => t.nom === "SANTE");
  if (tSante && tSante.sections) {
    // Province
    const sProv = tSante.sections.find(s => s.type.toLowerCase().includes("province"));
    if (sProv && sProv.donnees) {
      if (!AppState.provinceStats) AppState.provinceStats = {};
      AppState.provinceStats.sante = sProv.donnees;
    }

    // Communes
    const sCom = tSante.sections.find(s => s.type === "Données par commune");
    if (sCom && sCom.donnees && Array.isArray(sCom.donnees)) {
      sCom.donnees.forEach(d => {
        const c = getCommune(d["Collectivités territoriales"]);
        c.sante = d;
      });
    }
  }

  // 5. Water (EAU)
  const tEau = json.tables.find(t => t.nom === "EAU");
  console.log('[parseData] Found EAU table:', tEau);

  if (tEau && tEau.sections) {
    // Province
    const sProv = tEau.sections.find(s => s.type.toLowerCase().includes("province"));
    console.log('[parseData] Found province water section:', sProv);

    if (sProv && sProv.donnees) {
      if (!AppState.provinceStats) AppState.provinceStats = {};
      AppState.provinceStats.eau = sProv.donnees;
      console.log('[parseData] Set provinceStats.eau:', AppState.provinceStats.eau);
    }

    // Communes
    const sCom = tEau.sections.find(s => s.type === "Données par commune");
    if (sCom && sCom.donnees && Array.isArray(sCom.donnees)) {
      sCom.donnees.forEach(d => {
        const c = getCommune(d["Collectivités territoriales"]);
        c.eau = d;
      });
      console.log('[parseData] Parsed water data for', sCom.donnees.length, 'communes');
    }
  }
}


async function init() {
  map = L.map("map", { zoomControl: false, preferCanvas: true });

  L.control.zoom({ position: "bottomleft" }).addTo(map);

  ensureLabelPane();
  labelsLayer = L.layerGroup().addTo(map);

  markersLayer = L.layerGroup().addTo(map);


  const [
    regionsTopo,
    provincesTopo,
    communesTopo,
    boundaryGeo
  ] = await Promise.all([
    fetchJSON(URLS.regionsTopo),
    fetchJSON(URLS.provincesTopo),
    fetchJSON(URLS.communesTopo),
    fetchJSON(URLS.moroccoBoundaryGeoJSON)
  ]);

  AppState.moroccoBoundary = boundaryGeo;

  AppState.regionsFC = topojson.feature(regionsTopo, regionsTopo.objects[Object.keys(regionsTopo.objects)[0]]);
  AppState.provincesFC = topojson.feature(provincesTopo, provincesTopo.objects[Object.keys(provincesTopo.objects)[0]]);
  AppState.communesFC = topojson.feature(communesTopo, communesTopo.objects[Object.keys(communesTopo.objects)[0]]);

  addMoroccoMask(boundaryGeo);

  // Load Dynamic Data
  await loadDynamicData();

  // Auto-navigate to Tarfaya Province to show data.json data immediately
  const tarfayaProvince = AppState.provincesFC.features.find(f => isTarfayaProvince(f));
  if (tarfayaProvince) {
    // Find the region containing Tarfaya
    const region = AppState.regionsFC.features.find(f => isSoussMassaRegion(f));
    if (region) {
      AppState.selectedRegion = region;
      AppState.selectedProvince = tarfayaProvince;
      renderCommunes(tarfayaProvince);
    } else {
      renderRegions();
    }
  } else {
    renderRegions();
  }

  wireUI();
}

document.addEventListener("DOMContentLoaded", init);

