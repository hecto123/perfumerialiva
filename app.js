const STORAGE_KEY='perfumerialiva_products';
const ORDERS_KEY='perfumerialiva_orders';

const catalogoGrid=document.querySelector('.catalogo-grid');
const adminPanel=document.querySelector('.admin-panel');
const adminProductList=document.getElementById('adminProductList');
const orderProduct=document.getElementById('orderProduct');
const productImage=document.getElementById('productImage');
const productName=document.getElementById('productName');
const productPrice=document.getElementById('productPrice');
const productIngredients=document.getElementById('productIngredients');
const productPreview=document.getElementById('productPreview');
const imagePreview=document.getElementById('imagePreview');
const ordersList=document.getElementById('ordersList');
const adminPasswordInput=document.getElementById('adminPassword');
const adminLoginError=document.getElementById('adminLoginError');
const adminLoginOverlay=document.getElementById('adminLoginOverlay');
const cancelEditButton=document.getElementById('cancelEditButton');
const clearImageButton=document.getElementById('clearImageButton');

let perfumesData=[];
let savedOrders=[];
let editIndex=null;

loadApp();

function loadApp(){
  loadStorage();
  fetch('perfumes.json')
    .then(res=>res.json())
    .then(datos=>{
      if(perfumesData.length===0){
        perfumesData=datos;
        saveProductStorage();
      }
      renderCatalogo();
      renderAdminProductList();
      renderOrders();
    })
    .catch(error=>{
      console.error(error);
      if(perfumesData.length===0){
        catalogoGrid.innerHTML="<p class='empty'>No se pudo cargar el catálogo.</p>";
      } else {
        renderCatalogo();
        renderAdminProductList();
      }
    });
}

function loadStorage(){
  const storedProducts=localStorage.getItem(STORAGE_KEY);
  const storedOrders=localStorage.getItem(ORDERS_KEY);
  perfumesData=storedProducts?JSON.parse(storedProducts):[];
  savedOrders=storedOrders?JSON.parse(storedOrders):[];
}

function saveProductStorage(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfumesData));
}

function saveOrderStorage(){
  localStorage.setItem(ORDERS_KEY, JSON.stringify(savedOrders));
}

function renderCatalogo(){
  catalogoGrid.innerHTML='';
  if(perfumesData.length===0){
    catalogoGrid.innerHTML="<p class='empty'>No se encontraron perfumes.</p>";
    return;
  }
  perfumesData.forEach((perfume,index)=>{
    catalogoGrid.innerHTML+=`
      <article class="card">
        <div class="card-image">
          <img src="${perfume.imagen}" alt="${perfume.nombre}">
        </div>
        <div class="card-body">
          <h3>${perfume.nombre}</h3>
          <p class="precio">$${Number(perfume.precio).toLocaleString()}</p>
          <div class="card-actions">
            <button class="btn-secondary" onclick="openIngredientesModal(${index})">Ver ingredientes</button>
            <button onclick="comprar('${perfume.nombre}')">Comprar</button>
          </div>
        </div>
      </article>
    `;
  });
  populateOrderProduct();
}

function populateOrderProduct(){
  if(!orderProduct) return;
  orderProduct.innerHTML='';
  perfumesData.forEach(perfume=>{
    const option=document.createElement('option');
    option.value=perfume.nombre;
    option.textContent=`${perfume.nombre} - $${Number(perfume.precio).toLocaleString()}`;
    orderProduct.appendChild(option);
  });
}

function renderAdminProductList(){
  if(!adminProductList) return;
  adminProductList.innerHTML='';
  if(perfumesData.length===0){
    adminProductList.innerHTML='<p>No hay productos en el catálogo.</p>';
    return;
  }
  perfumesData.forEach((perfume,index)=>{
    const card=document.createElement('div');
    card.className='admin-product-card';
    card.innerHTML=`
      <img src="${perfume.imagen}" alt="${perfume.nombre}">
      <h4>${perfume.nombre}</h4>
      <p><strong>Precio:</strong> $${Number(perfume.precio).toLocaleString()}</p>
      <p><strong>Ingredientes:</strong> ${perfume.ingredientes.join(', ')}</p>
      <div class="admin-product-actions">
        <button class="btn-secondary" onclick="startEdit(${index})">Editar</button>
        <button class="btn btn-primary" onclick="deleteProduct(${index})">Eliminar</button>
      </div>
    `;
    adminProductList.appendChild(card);
  });
}

function openIngredientesModal(index){
  const perfume=perfumesData[index];
  if(!perfume) return;
  const modal=document.getElementById('ingredientes-modal');
  const modalTitle=document.getElementById('modal-perfume-name');
  const modalList=document.getElementById('modal-ingredientes-list');
  modalTitle.textContent=perfume.nombre;
  modalList.innerHTML=perfume.ingredientes.map(item=>`<li>${item}</li>`).join('');
  modal.classList.add('visible');
}

function closeIngredientesModal(){
  const modal=document.getElementById('ingredientes-modal');
  modal.classList.remove('visible');
}

function openAdminLogin(){
  adminLoginOverlay.classList.add('visible');
  adminLoginError.textContent='';
  adminPasswordInput.value='';
}

function closeAdminLogin(){
  adminLoginOverlay.classList.remove('visible');
}

function verifyAdmin(){
  const password=adminPasswordInput.value.trim();
  const correctPassword='perfume123';
  if(password===correctPassword){
    adminPanel.classList.add('active');
    closeAdminLogin();
    return;
  }
  adminLoginError.textContent='Clave incorrecta. Intenta nuevamente.';
}

function addProduct(){
  const nombre=productName.value.trim();
  const precio=productPrice.value.trim();
  const ingredientes=productIngredients.value.trim();
  const imagenFile=productImage.files[0];

  if(!nombre||!precio||!ingredientes){
    productPreview.textContent='Completa todos los campos.';
    return;
  }

  const saveNewProduct=(imagenUrl)=>{
    const productData={
      nombre,
      precio:Number(precio),
      imagen:imagenUrl,
      ingredientes:ingredientes.split(',').map(i=>i.trim()).filter(Boolean)
    };

    if(editIndex===null){
      perfumesData.push(productData);
      productPreview.innerHTML=`<p>Producto agregado:</p><strong>${nombre}</strong>`;
    } else {
      perfumesData[editIndex]=productData;
      productPreview.innerHTML=`<p>Producto actualizado:</p><strong>${nombre}</strong>`;
    }

    saveProductStorage();
    renderCatalogo();
    renderAdminProductList();
    resetForm();
  };

  if(imagenFile){
    const reader=new FileReader();
    reader.onload=function(e){
      saveNewProduct(e.target.result);
    };
    reader.readAsDataURL(imagenFile);
  } else if(editIndex!==null){
    saveNewProduct(perfumesData[editIndex].imagen);
  } else {
    productPreview.textContent='Debes seleccionar una imagen para el producto.';
  }
}

productImage.addEventListener('change', ()=>{
  if(!productImage.files || !productImage.files[0]){
    imagePreview.innerHTML='';
    return;
  }
  const file=productImage.files[0];
  const reader=new FileReader();
  reader.onload=function(e){
    imagePreview.innerHTML=`<img src="${e.target.result}" alt="Vista previa" />`;
  };
  reader.readAsDataURL(file);
});

function startEdit(index){
  const perfume=perfumesData[index];
  if(!perfume) return;
  editIndex=index;
  productName.value=perfume.nombre;
  productPrice.value=perfume.precio;
  productIngredients.value=perfume.ingredientes.join(', ');
  productPreview.innerHTML=`<p>Editando: <strong>${perfume.nombre}</strong></p>`;
  cancelEditButton.style.display='inline-block';
  document.getElementById('addProductButton').textContent='Actualizar producto';
}

function cancelEdit(){
  editIndex=null;
  resetForm();
}

function deleteProduct(index){
  if(!confirm('¿Deseas eliminar este producto?')) return;
  perfumesData.splice(index,1);
  saveProductStorage();
  renderCatalogo();
  renderAdminProductList();
}

function resetForm(){
  editIndex=null;
  productName.value='';
  productPrice.value='';
  productIngredients.value='';
  productImage.value='';
  productPreview.textContent='';
  imagePreview.innerHTML='';
  cancelEditButton.style.display='none';
  document.getElementById('addProductButton').textContent='Agregar producto';
}

function clearSelectedImage(){
  productImage.value='';
  imagePreview.innerHTML='';
}

function saveOrder(){
  const cliente=document.getElementById('customerName').value.trim();
  const telefono=document.getElementById('customerPhone').value.trim();
  const producto=document.getElementById('orderProduct').value;
  const nota=document.getElementById('customerNote').value.trim();

  if(!cliente||!telefono||!producto){
    return;
  }

  const pedido={
    cliente,
    telefono,
    producto,
    nota,
    fecha:new Date().toLocaleString()
  };

  savedOrders.push(pedido);
  saveOrderStorage();
  renderOrders();
  document.getElementById('customerName').value='';
  document.getElementById('customerPhone').value='';
  document.getElementById('customerNote').value='';
}

function renderOrders(){
  ordersList.innerHTML='';
  if(savedOrders.length===0){
    ordersList.innerHTML='<p>No hay pedidos guardados aún.</p>';
    return;
  }
  savedOrders.forEach(order=>{
    const div=document.createElement('div');
    div.className='order-item';
    div.innerHTML=`
      <strong>${order.cliente} - ${order.producto}</strong>
      <p>Tel: ${order.telefono}</p>
      <p>${order.nota||'Sin nota extra'}</p>
      <small>${order.fecha}</small>
    `;
    ordersList.appendChild(div);
  });
}

function comprar(nombre){
  window.open(
    `https://wa.me/573147317718?text=${encodeURIComponent('Hola, quiero comprar ' + nombre)}`,
    '_blank'
  );
}

function pedirPerfume(){
  const nombre=document.querySelector('.solicitar input').value;
  window.open(
    `https://wa.me/573147317718?text=${encodeURIComponent('Hola, estoy buscando el perfume ' + nombre)}`,
    '_blank'
  );
}
