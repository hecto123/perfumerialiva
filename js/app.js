/* Lógica principal de la app pública de Perfumería LIVA */
const STORAGE_KEY='perfumerialiva_products';
const appState={
  products:[],
  categories:['Hombre','Mujer'],
  favorites:new Set(),
  selectedCategory:'Todos',
  search:'',
  filter:{minPrice:0,maxPrice:999999,tipo:'',marca:''}
};

const firebaseConfig={
  apiKey:'REEMPLAZAR_API_KEY',
  authDomain:'REEMPLAZAR_AUTH_DOMAIN',
  projectId:'REEMPLAZAR_PROJECT_ID',
  storageBucket:'REEMPLAZAR_STORAGE_BUCKET',
  messagingSenderId:'REEMPLAZAR_MESSAGING_SENDER_ID',
  appId:'REEMPLAZAR_APP_ID'
};

function normalizeCategory(value){
  const cat = (value || '').toString().trim().toLowerCase();
  if(cat === 'mujer' || cat === 'dama') return 'Mujer';
  if(cat === 'hombre') return 'Hombre';
  return 'Mujer';
}

function normalizeProduct(product,index){
  return {
    id: product.id || Date.now() + index,
    nombre: product.nombre || 'Perfume LIVA',
    marca: product.marca || 'LIVA',
    precio: Number(product.precio || 0),
    tamano: product.tamano || '100ml',
    descripcion: product.descripcion || '',
    categoria: normalizeCategory(product.categoria),
    tipo: product.tipo || 'Fragancia',
    imagen: product.imagen || 'imagenes/default.jpg',
    badges: Array.isArray(product.badges) ? product.badges : product.badges ? product.badges.toString().split(',').map(b=>b.trim()).filter(Boolean) : [],
    ingredientes: Array.isArray(product.ingredientes) ? product.ingredientes : product.ingredientes ? product.ingredientes.toString().split(',').map(i=>i.trim()).filter(Boolean) : []
  };
}

function saveProducts(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.products));
}

function loadProducts(){
  const stored=localStorage.getItem(STORAGE_KEY);
  if(stored){
    try{
      appState.products=JSON.parse(stored).map(normalizeProduct);
      initApp();
      return;
    } catch(error){
      console.error('Error parseando productos locales:', error);
    }
  }
  fetch('perfumes.json')
    .then(response=>response.json())
    .then(datos=>{
      appState.products=datos.map(normalizeProduct);
      saveProducts();
      initApp();
    })
    .catch(error=>{
      console.error(error);
      appState.products=[];
      initApp();
    });
}

function initApp(){
  renderHeader();
  renderCategories();
  renderBanners();
  renderProducts();
  renderPromotions();
  renderWhatsAppFloat();
}

function formatMoney(value){
  return new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0}).format(value);
}

function renderHeader(){
  const header=document.getElementById('header-content');
  header.innerHTML=`
    <div class="logo">
      <h1>Perfumería LIVA</h1>
      <p>Fragancias originales, exclusivas y listas para ti.</p>
    </div>
    <div class="search-box">
      <svg viewBox="0 0 24 24"><path d="M21.71 20.29l-5.4-5.39a8 8 0 10-1.41 1.41l5.39 5.39a1 1 0 001.42-1.41zM10 16a6 6 0 116-6 6 6 0 01-6 6z"/></svg>
      <input type="search" id="searchInput" placeholder="Buscar perfume, marca o aroma" oninput="onSearch(this.value)">
    </div>
  `;
}

function getCategories(){
  return ['Todos',...appState.categories];
}

function renderCategories(){
  const categories=getCategories();
  const container=document.getElementById('categoriesGrid');
  container.innerHTML=categories.map(cat=>`
    <div class="category-card ${appState.selectedCategory===cat?'active':''}" onclick="setCategory('${cat}')">
      <span>Catálogo</span>
      <h3>${cat}</h3>
    </div>
  `).join('');
}

function renderBanners(){
  const banner=document.getElementById('bannerSection');
  banner.innerHTML=`
    <div class="hero-copy">
      <span>Novedad</span>
      <h2>Encuentra tu aroma ideal en Perfumería LIVA</h2>
      <p>Explora fragancias premium para hombre y mujer con envío rápido y atención por WhatsApp.</p>
      <div class="hero-buttons">
        <button class="btn primary" onclick="scrollToSection('catalogoSection')">Ver catálogo</button>
        <button class="btn outline" onclick="scrollToSection('contactSection')">Solicitar perfume</button>
      </div>
    </div>
    <div class="hero-visual">
      <img src="imagenes/portada.jpg" alt="Perfumería LIVA">
    </div>
  `;
}

function renderPromotions(){
  const promo=document.getElementById('promoCarousel');
  promo.innerHTML=`
    <div class="promo-slide">
      <div class="promo-info">
        <span>Promoción</span>
        <h3>60% off en fragancias destacadas</h3>
        <p>Solo por tiempo limitado. Aprovecha envío gratis y pagos por WhatsApp.</p>
      </div>
      <div class="promo-media">
        <img src="imagenes/stock-photo-perfumery-cosmetics-branding-and-luxe-concept-perfume-bottle-and-vintage-fragrance-on-glamour-1545397058.jpg" alt="Promoción Perfumes">
      </div>
    </div>
  `;
}

function getFilteredProducts(){
  return appState.products.filter(product=>{
    const matchesSearch=[product.nombre,product.marca,product.tipo].join(' ').toLowerCase().includes(appState.search.toLowerCase());
    const matchesCategory=appState.selectedCategory==='Todos'||product.categoria===appState.selectedCategory;
    const matchesPrice=product.precio>=appState.filter.minPrice && product.precio<=appState.filter.maxPrice;
    const matchesBrand=appState.filter.marca?product.marca===appState.filter.marca:true;
    return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
  });
}

function renderProducts(){
  const grid=document.getElementById('productsGrid');
  const products=getFilteredProducts();
  if(!products.length){grid.innerHTML='<p>No se encontraron perfumes con esos filtros.</p>';return;}
  grid.innerHTML=products.map(product=>`
    <article class="product-card">
      <img src="${product.imagen}" alt="${product.nombre}">
      <div class="product-body">
        <div class="badges">${product.badges.map(b=>`<span class="badge">${b}</span>`).join('')}</div>
        <h3>${product.nombre}</h3>
        <p>${product.descripcion}</p>
        <div class="meta"><span>${formatMoney(product.precio)}</span><span>${product.tamano}</span></div>
        <div class="actions">
          <button class="whatsapp" onclick="comprarWhatsApp('${product.nombre}')">WhatsApp</button>
          <button class="details" onclick="verDetalles(${product.id})">Detalles</button>
        </div>
      </div>
    </article>`).join('');
}

function onSearch(value){appState.search=value;renderProducts();}
function setCategory(cat){
  appState.selectedCategory=cat;
  renderCategories();
  renderProducts();
}
function scrollToSection(id){document.getElementById(id).scrollIntoView({behavior:'smooth'});}
function comprarWhatsApp(nombre){window.open(`https://wa.me/573147317718?text=${encodeURIComponent('Hola, quiero comprar '+nombre)}`,'_blank');}
function verDetalles(id){alert('Ver detalles del perfume '+id);}

function renderWhatsAppFloat(){
  const floatContainer=document.getElementById('whatsappFloat');
  floatContainer.innerHTML=`<a href="https://wa.me/573147317718?text=Hola%2C%20quiero%20consultar%20por%20un%20perfume" target="_blank" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M21.71 20.29l-5.4-5.39a8 8 0 10-1.41 1.41l5.39 5.39a1 1 0 001.42-1.41zM10 16a6 6 0 116-6 6 6 0 01-6 6z"/></svg></a>`;
}

window.addEventListener('DOMContentLoaded',()=>{loadProducts();});