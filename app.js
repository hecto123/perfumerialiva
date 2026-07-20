const catalogo=document.getElementById("catalogo");
const buscarInput=document.getElementById("buscar");
let perfumesData=[];

fetch("perfumes.json")
  .then(res=>res.json())
  .then(datos=>{
    perfumesData=datos;
    renderCatalogo(datos);
  })
  .catch(error=>{
    console.error(error);
    catalogo.innerHTML="<p class='empty'>No se pudo cargar el catálogo.</p>";
  });

function renderCatalogo(datos){
  catalogo.innerHTML="";
  if(datos.length===0){
    catalogo.innerHTML="<p class='empty'>No se encontraron perfumes.</p>";
    return;
  }
  datos.forEach(perfume=>{
    catalogo.innerHTML+=`
      <div class="card">
        <img src="${perfume.imagen}" alt="${perfume.nombre}">
        <h3>${perfume.nombre}</h3>
        <p class="precio">$${Number(perfume.precio).toLocaleString()}</p>
        <button onclick="comprar('${perfume.nombre}')">Comprar</button>
      </div>
    `;
  });
}

function filtrarCatalogo(){
  const texto=buscarInput.value.toLowerCase().trim();
  const filtrados=perfumesData.filter(perfume=>
    perfume.nombre.toLowerCase().includes(texto)
  );
  renderCatalogo(filtrados);
}

function comprar(nombre){
  window.open(
    `https://wa.me/573147317718?text=${encodeURIComponent("Hola, quiero comprar " + nombre)}`,
    "_blank"
  );
}

function pedirPerfume(){
  let nombre=document.querySelector(".solicitar input").value;
  window.open(
    `https://wa.me/573147317718?text=${encodeURIComponent("Hola, estoy buscando el perfume " + nombre)}`,
    "_blank"
  );
}
